
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useClinicContext } from '@/components/app-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Stethoscope, CheckCircle, Clock, User, Hash, DoorOpen } from 'lucide-react';
import { announceNextPatient } from '@/ai/flows/announce-next-patient';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function PatientQueue() {
  const { appointments, getPatientById, updateAppointmentStatus } = useClinicContext();
  const { toast } = useToast();
  const [loadingPatientId, setLoadingPatientId] = useState<string | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState('');

  const sortedAppointments = useMemo(() => {
    return appointments.sort((a, b) => new Date(a.queueTime).getTime() - new Date(b.queueTime).getTime());
  }, [appointments]);

  const waitingPatients = sortedAppointments.filter(apt => apt.status === 'Waiting');
  const inRoomPatients = sortedAppointments.filter(apt => apt.status === 'InRoom');
  const completedPatients = sortedAppointments.filter(apt => apt.status === 'Completed');

  const handleCallClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setIsRoomModalOpen(true);
  };

  const handleConfirmCall = async () => {
    if (!selectedAppointmentId || !roomNumber) return;

    const appointment = appointments.find(apt => apt._id === selectedAppointmentId);
    if (!appointment) return;
    
    const patient = getPatientById(appointment.patientId);
    if (!patient) return;
    
    setLoadingPatientId(appointment._id);
    setIsRoomModalOpen(false);

    try {
      toast({
        title: "Calling Patient...",
        description: `Announcing for ${patient.patientName}.`,
      });

      const result = await announceNextPatient({
        patientName: patient.patientName,
        patientId: patient.patientId,
        roomNumber: parseInt(roomNumber, 10),
      });

      const audio = new Audio(result.media);
      audio.play();
      
      audio.onended = () => {
        updateAppointmentStatus(appointment._id, 'InRoom', parseInt(roomNumber, 10));
        toast({
          title: "Patient Called",
          description: `${patient.patientName} has been directed to room ${roomNumber}.`,
        });
      };
      
    } catch (error) {
      console.error("Failed to announce patient:", error);
      toast({
        variant: "destructive",
        title: "Announcement Failed",
        description: "Could not announce the patient. Please try again.",
      });
    } finally {
      setLoadingPatientId(null);
      setRoomNumber('');
      setSelectedAppointmentId(null);
    }
  };

  const handleComplete = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, 'Completed');
     const appointment = appointments.find(apt => apt._id === appointmentId);
     if(appointment) {
        const patient = getPatientById(appointment.patientId);
        if(patient) {
            toast({
                title: "Appointment Completed",
                description: `The appointment for ${patient.patientName} is complete.`
            })
        }
     }
  }

  const PatientCard = ({ appointmentId }: { appointmentId: string }) => {
    const appointment = appointments.find(apt => apt._id === appointmentId);
    const patient = appointment ? getPatientById(appointment.patientId) : null;
    
    const [waitTime, setWaitTime] = useState<number | null>(null);

    useEffect(() => {
      if (!appointment || appointment.status !== 'Waiting') return;

      const calculateWaitTime = () => {
        const time = Math.round((Date.now() - new Date(appointment.queueTime).getTime()) / 60000);
        setWaitTime(time);
      };

      calculateWaitTime();
      const interval = setInterval(calculateWaitTime, 60000); // Update every minute

      return () => clearInterval(interval);
    }, [appointment]);


    if (!appointment || !patient) return null;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="rounded-lg border bg-card text-card-foreground shadow-sm mb-4"
      >
        <div className="p-4 flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={patient.avatarUrl} alt={patient.patientName} data-ai-hint="person portrait" />
            <AvatarFallback>{patient.patientName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">{patient.patientName}</h3>
                {appointment.status === 'Waiting' && waitTime !== null && (
                  <Badge variant="secondary" className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {waitTime} min
                  </Badge>
                )}
                {appointment.status === 'InRoom' && (
                  <Badge variant="default" className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600">
                    <DoorOpen className="h-3 w-3" />
                    Room {appointment.assignedRoomNumber}
                  </Badge>
                )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Hash className="h-3 w-3" /> {patient.patientId}</p>
          </div>
        </div>
        <div className="px-4 pb-4 flex justify-end gap-2">
            {appointment.status === 'Waiting' && (
              <Button onClick={() => handleCallClick(appointment._id)} disabled={loadingPatientId === appointment._id} size="sm">
                <Megaphone className="mr-2 h-4 w-4" />
                {loadingPatientId === appointment._id ? 'Calling...' : 'Call Patient'}
              </Button>
            )}
            {appointment.status === 'InRoom' && (
              <Button onClick={() => handleComplete(appointment._id)} size="sm" variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Complete
              </Button>
            )}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Waiting</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <AnimatePresence>
                {waitingPatients.length > 0 ? (
                    waitingPatients.map(apt => <PatientCard key={apt._id} appointmentId={apt._id} />)
                ) : (
                    <p className="text-muted-foreground text-center py-8">No patients waiting.</p>
                )}
            </AnimatePresence>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">In Room</CardTitle>
            <Stethoscope className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <AnimatePresence>
                {inRoomPatients.length > 0 ? (
                    inRoomPatients.map(apt => <PatientCard key={apt._id} appointmentId={apt._id} />)
                ) : (
                    <p className="text-muted-foreground text-center py-8">No patients in rooms.</p>
                )}
            </AnimatePresence>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Completed</CardTitle>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <AnimatePresence>
                {completedPatients.length > 0 ? (
                    completedPatients.map(apt => <PatientCard key={apt._id} appointmentId={apt._id} />)
                ) : (
                    <p className="text-muted-foreground text-center py-8">No completed appointments today.</p>
                )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

       <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Room</DialogTitle>
            <DialogDescription>
              Enter the room number for the patient before calling.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="room-number" className="text-right">
                Room Number
              </Label>
              <Input
                id="room-number"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="col-span-3"
                type="number"
                placeholder="e.g., 3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsRoomModalOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleConfirmCall}>Call Patient</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
