'use client';

import { useParams } from 'next/navigation';
import { useClinicContext } from '@/components/app-provider';
import { useLocale } from '@/components/locale-provider';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Megaphone, CheckCircle, Stethoscope, User, Clock, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';

export default function RoomDetailPage() {
    const params = useParams();
    const { toast } = useToast();
    const { rooms, getPatientById, appointments, updateAppointmentStatus, isLoading } = useClinicContext();
    const { locale } = useLocale();

    const roomId = typeof params.roomId === 'string' ? params.roomId : '';
    const room = useMemo(() => rooms.find(r => r.roomNumber.toString() === roomId), [rooms, roomId]);

    const roomAppointment = useMemo(() => 
        room?.currentAppointmentId 
        ? appointments.find(apt => apt._id === room.currentAppointmentId)
        : undefined
    , [room, appointments]);

    const patient = roomAppointment ? getPatientById(roomAppointment.patientId) : null;
    
    const handleStartConsultation = async (appointment: Appointment) => {
        if (!room) return;
        await updateAppointmentStatus(appointment._id, 'InConsultation', room.roomNumber);
        toast({
            title: locale === 'ar' ? 'بدأ الفحص' : 'Consultation Started',
            description: locale === 'ar' ? `بدأ فحص المريض ${patient?.patientName}` : `Consultation started for ${patient?.patientName}.`,
        })
    }

    const handleCompleteConsultation = async (appointment: Appointment) => {
        if (!room) return;
        await updateAppointmentStatus(appointment._id, 'Completed', room.roomNumber);
        toast({
            title: locale === 'ar' ? 'اكتمل الفحص' : 'Consultation Completed',
             description: locale === 'ar' ? `اكتمل فحص المريض ${patient?.patientName}` : `Consultation completed for ${patient?.patientName}.`,
        })
    }
    
    const handleCallNextPatient = () => {
        // This is a placeholder for a more advanced "call next" from room feature
        toast({
            title: locale === 'ar' ? 'وظيفة قيد الإنشاء' : 'Feature in Development',
            description: locale === 'ar' ? 'سيتم تفعيل استدعاء المريض التالي من لوحة المواعيد الرئيسية.' : 'Calling the next patient should be done from the main appointments dashboard.'
        })
    };


    if (isLoading || !room) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
        );
    }
    
    const roomStatusText = {
        Available: { ar: 'متاحة', en: 'Available', color: 'text-green-500' },
        Assigned: { ar: 'مخصصة', en: 'Assigned', color: 'text-orange-500' },
        Occupied: { ar: 'مشغولة', en: 'Occupied', color: 'text-red-500' },
    }[room.currentStatus];
    
    return (
        <div className={cn("flex flex-col gap-6 p-4 md:p-6 lg:p-8 min-h-screen bg-background text-foreground", locale === 'ar' && 'font-arabic')} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <header className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => window.close()}>
                    <ArrowLeft className={cn(locale === 'ar' && 'transform rotate-180')} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {locale === 'ar' ? `غرفة الطبيب ${room.roomNumber}` : `Doctor's Room ${room.roomNumber}`}
                    </h1>
                     <p className={cn("text-lg font-semibold", roomStatusText.color)}>
                        {locale === 'ar' ? roomStatusText.ar : roomStatusText.en}
                    </p>
                </div>
            </header>

            <AnimatePresence mode="wait">
            {patient && roomAppointment ? (
                <motion.div
                    key={patient._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>{locale === 'ar' ? 'المريض الحالي' : 'Current Patient'}</CardTitle>
                             <CardDescription>
                                {roomAppointment.status === 'InRoom' ? (locale === 'ar' ? 'المريض في طريقه إلى الغرفة. اضغط "بدء الفحص" عند وصوله.' : 'Patient is on their way. Click "Start Consultation" upon arrival.') : (locale === 'ar' ? 'الفحص جارٍ حاليًا.' : 'Consultation in progress.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row items-start gap-6">
                           <Avatar className="h-24 w-24">
                               <AvatarImage src={patient.avatarUrl} alt={patient.patientName} data-ai-hint="person portrait" />
                               <AvatarFallback>{patient.patientName.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <div className="flex-1 space-y-2">
                               <h3 className="text-2xl font-bold">{patient.patientName}</h3>
                               <p className="text-muted-foreground flex items-center gap-2"><Hash className="h-4 w-4" /> {patient.patientId}</p>
                               <p className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> {locale === 'ar' ? 'وقت النداء:' : 'Called at:'} {roomAppointment.calledTime ? new Date(roomAppointment.calledTime).toLocaleTimeString() : 'N/A'}</p>
                           </div>
                           <div className="w-full md:w-auto flex flex-col gap-2 self-center">
                            {roomAppointment.status === 'InRoom' && (
                                <Button onClick={() => handleStartConsultation(roomAppointment)} size="lg" className="bg-green-600 hover:bg-green-700">
                                    <Stethoscope className="mr-2" />
                                    {locale === 'ar' ? 'بدء الفحص' : 'Start Consultation'}
                                </Button>
                            )}
                             {roomAppointment.status === 'InConsultation' && (
                                <Button onClick={() => handleCompleteConsultation(roomAppointment)} size="lg" variant="default">
                                    <CheckCircle className="mr-2" />
                                    {locale === 'ar' ? 'إنهاء الفحص' : 'Complete Consultation'}
                                </Button>
                            )}
                           </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                 <motion.div
                    key="no-patient"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center justify-center text-center gap-4 p-8 border-2 border-dashed rounded-lg"
                >
                     <User className="h-16 w-16 text-muted-foreground" />
                    <h3 className="text-2xl font-bold tracking-tight">
                        {locale === 'ar' ? 'الغرفة متاحة' : 'Room is Available'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {locale === 'ar' ? 'يمكنك استدعاء المريض التالي من لوحة المواعيد الرئيسية.' : 'You can call the next patient from the main appointments dashboard.'}
                    </p>
                    <Button onClick={handleCallNextPatient}>
                        <Megaphone className="mr-2"/>
                        {locale === 'ar' ? 'استدعاء المريض التالي' : 'Call Next Patient'}
                    </Button>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}