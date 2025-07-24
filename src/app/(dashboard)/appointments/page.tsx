'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useClinicContext } from '@/components/app-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Stethoscope, CheckCircle, Clock, Hash, DoorOpen, PlusCircle } from 'lucide-react';
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
import { useLocale } from '@/components/locale-provider';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/lib/types';
import AddAppointmentSheet from '@/components/dashboard/add-appointment-sheet';

export default function AppointmentsPage() {
  const { appointments, getPatientById, updateAppointmentStatus, rooms, isLoading } = useClinicContext();
  const { toast } = useToast();
  const { locale } = useLocale();
  const [loadingPatientId, setLoadingPatientId] = useState<string | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  
  const occupiedRoomNumbers = useMemo(() => 
    rooms.filter(r => r.isOccupied).map(r => r.roomNumber)
  , [rooms]);

  const sortedAppointments = useMemo(() => {
    if (!appointments) return [];
    return [...appointments].sort((a, b) => new Date(a.queueTime).getTime() - new Date(b.queueTime).getTime());
  }, [appointments]);

  const waitingPatients = sortedAppointments.filter(apt => apt.status === 'Waiting');
  const inProgressPatients = sortedAppointments.filter(apt => apt.status === 'InRoom' || apt.status === 'InConsultation');
  const completedPatients = sortedAppointments.filter(apt => apt.status === 'Completed');

  const handleCallClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setIsRoomModalOpen(true);
  };
  
  const speakAnnouncementFallback = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Web Speech API is not supported by this browser.");
    }
  }

  const handleConfirmCall = async () => {
    if (!selectedAppointmentId || !roomNumber) return;
    
    const roomNum = parseInt(roomNumber, 10);
    if(occupiedRoomNumbers.includes(roomNum)){
        toast({
            variant: "destructive",
            title: locale === 'ar' ? 'غرفة مشغولة' : "Room Occupied",
            description: locale === 'ar' ? `الغرفة ${roomNumber} مشغولة حالياً.` : `Room ${roomNumber} is currently occupied.`,
        });
        return;
    }


    const appointment = appointments.find(apt => apt._id === selectedAppointmentId);
    if (!appointment) return;
    
    const patient = getPatientById(appointment.patientId);
    if (!patient) return;
    
    setLoadingPatientId(appointment._id);
    setIsRoomModalOpen(false);

    try {
      await updateAppointmentStatus(appointment._id, 'InRoom', roomNum);

       toast({
        title: locale === 'ar' ? 'جاري استدعاء المريض...' : "Calling Patient...",
        description: locale === 'ar' ? `جاري الإعلان عن ${patient.patientName}.` : `Announcing for ${patient.patientName}.`,
      });

      const result = await announceNextPatient({
        patientName: patient.patientName,
        patientId: patient.patientId,
        roomNumber: roomNum,
      });

      if (result.media) {
        // Play audio from Genkit if available
        const audio = new Audio(result.media);
        audio.play();
        audio.onended = () => {
            toast({
            title: locale === 'ar' ? 'تم استدعاء المريض' : "Patient Called",
            description: locale === 'ar' ? `تم توجيه ${patient.patientName} إلى الغرفة ${roomNumber}.` : `${patient.patientName} has been directed to room ${roomNumber}.`,
            });
        };
      } else {
        // Fallback to browser's Web Speech API
        console.log("Using Web Speech API fallback for announcement.");
        const announcementText = `المريض ${patient.patientName}, رقم الهوية ${patient.patientId}, يرجى التوجه إلى الغرفة رقم ${roomNum}. `.repeat(3);
        speakAnnouncementFallback(announcementText);
        toast({
            title: locale === 'ar' ? 'تم استدعاء المريض (محلياً)' : "Patient Called (Locally)",
            description: locale === 'ar' ? `تم توجيه ${patient.patientName} إلى الغرفة ${roomNumber}.` : `${patient.patientName} has been directed to room ${roomNumber}.`,
        });
      }
      
    } catch (error) {
      console.error("Failed to announce patient:", error);
      toast({
        variant: "destructive",
        title: locale === 'ar' ? 'فشل الإعلان' : "Announcement Failed",
        description: locale === 'ar' ? 'لا يمكن إعلان المريض. يرجى المحاولة مرة أخرى.' : "Could not announce the patient. Please try again.",
      });
      await updateAppointmentStatus(appointment._id, 'Waiting');
    } finally {
      setLoadingPatientId(null);
      setRoomNumber('');
      setSelectedAppointmentId(null);
    }
  };

  const PatientCard = ({ appointment }: { appointment: Appointment }) => {
    const patient = getPatientById(appointment.patientId);
    
    const [waitTime, setWaitTime] = useState<string | null>(null);

    useEffect(() => {
        if (!appointment || appointment.status !== 'Waiting') {
            setWaitTime(null);
            return;
        }
    
        const calculateWaitTime = () => {
            const timeDiff = Math.round((Date.now() - new Date(appointment.queueTime).getTime()) / 60000);
            const timeString = locale === 'ar' ? `${timeDiff} د` : `${timeDiff} min`;
            setWaitTime(timeString);
        };
    
        calculateWaitTime();
        const interval = setInterval(calculateWaitTime, 60000);
    
        return () => clearInterval(interval);
    }, [appointment, locale]);


    if (!patient) return null;

    const cardStatusStyles = {
        Waiting: 'border-l-4 border-l-orange-500 bg-orange-500/5',
        InRoom: 'border-l-4 border-l-blue-500 bg-blue-500/5',
        InConsultation: 'border-l-4 border-l-red-500 bg-red-500/5',
        Completed: 'border-l-4 border-l-green-500 bg-green-500/5 opacity-80'
    }

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={cn("rounded-lg border bg-card text-card-foreground shadow-sm mb-4", cardStatusStyles[appointment.status])}
      >
        <div className="p-4 flex items-start space-x-4 rtl:space-x-reverse">
          <Avatar className="h-12 w-12">
            <AvatarImage src={patient.avatarUrl} alt={patient.patientName} data-ai-hint="person portrait" />
            <AvatarFallback>{patient.patientName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold">{patient.patientName}</h3>
                {appointment.status === 'Waiting' && waitTime !== null && (
                  <Badge variant="outline" className="flex items-center gap-1.5 border-orange-500 text-orange-600">
                    <Clock className="h-3 w-3" />
                    {waitTime}
                  </Badge>
                )}
                {(appointment.status === 'InRoom' || appointment.status === 'InConsultation') && (
                   <Badge variant="outline" className="flex items-center gap-1.5 border-gray-400">
                        <DoorOpen className="h-3 w-3" />
                        {locale === 'ar' ? `غرفة ${appointment.assignedRoomNumber}` : `Room ${appointment.assignedRoomNumber}`}
                   </Badge>
                )}
                 {appointment.status === 'InConsultation' && (
                    <Badge variant="default" className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600">
                        <Stethoscope className="h-3 w-3" />
                        {locale === 'ar' ? `في الفحص` : `Examining`}
                    </Badge>
                )}
                {appointment.status === 'Completed' && (
                     <Badge variant="default" className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-3 w-3" />
                        {locale === 'ar' ? 'مكتمل' : 'Completed'}
                    </Badge>
                )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Hash className="h-3 w-3" /> {patient.patientId}</p>
          </div>
        </div>
        {(appointment.status === 'Waiting') && (
            <div className="px-4 pb-4 flex justify-end gap-2">
                {appointment.status === 'Waiting' && (
                <Button onClick={() => handleCallClick(appointment._id)} disabled={loadingPatientId === appointment._id} size="sm">
                    <Megaphone className="ml-0 rtl:ml-2 mr-2 rtl:mr-0 h-4 w-4" />
                    {loadingPatientId === appointment._id ? (locale === 'ar' ? 'جاري الاستدعاء...' : 'Calling...') : (locale === 'ar' ? 'استدعاء' : 'Call')}
                </Button>
                )}
            </div>
        )}
      </motion.div>
    );
  };
  
  if (isLoading) {
    return <div>{locale === 'ar' ? 'جاري تحميل البيانات...' : 'Loading data...'}</div>;
  }

  return (
    <>
    <div className="flex flex-col gap-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                  {locale === 'ar' ? 'إدارة المواعيد' : 'Appointment Management'}
              </h1>
              <p className="text-muted-foreground">
                  {locale === 'ar' ? 'عرض وتتبع جميع مواعيد المرضى.' : 'View and track all patient appointments.'}
              </p>
            </div>
             <Button onClick={() => setIsSheetOpen(true)}>
                <PlusCircle className="mr-2" />
                {locale === 'ar' ? 'إضافة موعد جديد' : 'New Appointment'}
            </Button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">{locale === 'ar' ? 'في الانتظار' : 'Waiting'}</CardTitle>
                    <Clock className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <AnimatePresence>
                        {waitingPatients.length > 0 ? (
                            waitingPatients.map(apt => <PatientCard key={apt._id} appointment={apt} />)
                        ) : (
                            <p className="text-muted-foreground text-center py-8">{locale === 'ar' ? 'لا يوجد مرضى في الانتظار.' : 'No patients waiting.'}</p>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">{locale === 'ar' ? 'قيد التقدم' : 'In Progress'}</CardTitle>
                    <Stethoscope className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <AnimatePresence>
                        {inProgressPatients.length > 0 ? (
                            inProgressPatients.map(apt => <PatientCard key={apt._id} appointment={apt} />)
                        ) : (
                            <p className="text-muted-foreground text-center py-8">{locale === 'ar' ? 'لا يوجد مرضى في الغرف.' : 'No patients in rooms.'}</p>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">{locale === 'ar' ? 'مكتمل' : 'Completed'}</CardTitle>
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <AnimatePresence>
                        {completedPatients.length > 0 ? (
                            completedPatients.map(apt => <PatientCard key={apt._id} appointment={apt} />)
                        ) : (
                            <p className="text-muted-foreground text-center py-8">{locale === 'ar' ? 'لا توجد مواعيد مكتملة اليوم.' : 'No completed appointments today.'}</p>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>

        <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{locale === 'ar' ? 'تخصيص غرفة' : 'Assign Room'}</DialogTitle>
                    <DialogDescription>
                    {locale === 'ar' ? 'أدخل رقم الغرفة للمريض قبل استدعائه.' : 'Enter the room number for the patient before calling.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="room-number" className="text-right rtl:text-left">
                            {locale === 'ar' ? 'رقم الغرفة' : 'Room Number'}
                        </Label>
                        <Input
                            id="room-number"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            className="col-span-3"
                            type="number"
                            placeholder={locale === 'ar' ? 'مثال: 3' : 'e.g., 3'}
                            autoFocus
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsRoomModalOpen(false)}>{locale === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                    <Button type="submit" onClick={handleConfirmCall}>{locale === 'ar' ? 'استدعاء وتوجيه' : 'Call & Assign'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
    <AddAppointmentSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
