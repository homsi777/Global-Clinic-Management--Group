
'use client';

import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Appointment, Patient } from '@/lib/types';
import { Logo } from '@/components/icons/logo';
import { AnimatePresence, motion } from 'framer-motion';
import { Hash, DoorOpen, Clock, Users, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const PatientListItem = ({ appointment }: { appointment: Appointment }) => {
    const patient = useLiveQuery(() => db.patients.where('patientId').equals(appointment.patientId).first(), [appointment.patientId]);

    if (!patient) return null;

    const statusConfig = {
        'Waiting': { color: 'bg-orange-100 border-orange-500', icon: <UserCheck className="h-4 w-4 text-orange-600" />, text: 'ينتظر' },
        'InRoom': { color: 'bg-green-100 border-green-500', icon: <DoorOpen className="h-4 w-4 text-green-600" />, text: `في غرفة ${appointment.assignedRoomNumber}` },
    };
    
    const currentStatus = appointment.status === 'InRoom' ? 'InRoom' : 'Waiting';
    const config = statusConfig[currentStatus];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={cn('p-3 mb-3 rounded-lg border-2 flex items-center gap-3', config.color)}
        >
            {config.icon}
            <div className='flex-grow'>
                <p className="font-semibold text-gray-800">{patient.patientName}</p>
                <p className="text-sm text-gray-600">ID: {patient.patientId}</p>
            </div>
            <Badge variant="outline" className='border-gray-400'>{config.text}</Badge>
        </motion.div>
    );
  };


export default function WaitingRoomPage() {
  const [currentTime, setCurrentTime] = useState('');
  const [sessionTimer, setSessionTimer] = useState('00:00');
  const [isPulsing, setIsPulsing] = useState(false);

  // Live query for the application state (currently called patient)
  const appState = useLiveQuery(() => db.appState.get('current'), []);
  
  // Live query for the patient being called
  const calledPatient = useLiveQuery(
    () => appState?.currentCalledPatientId ? db.patients.where('patientId').equals(appState.currentCalledPatientId).first() : Promise.resolve(undefined),
    [appState?.currentCalledPatientId]
  );
  
  // Live query for waiting and in-room lists
  const waitingList = useLiveQuery(() => db.appointments.where('status').equals('Waiting').sortBy('queueTime'), []);
  const inRoomList = useLiveQuery(() => db.appointments.where('status').equals('InRoom').sortBy('queueTime'), []);

  // Update client time every second
  useEffect(() => {
    const updateClientTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    };
    updateClientTime();
    const timer = setInterval(updateClientTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Effect for pulsing animation and session timer
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;

    if (calledPatient && appState?.calledTime) {
      setIsPulsing(true);
      const pulseTimeout = setTimeout(() => setIsPulsing(false), 7000);

      const startTime = new Date(appState.calledTime).getTime();
      timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const diff = now - startTime;
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setSessionTimer(
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }, 1000);
      
      return () => {
        if (timerInterval) clearInterval(timerInterval);
        clearTimeout(pulseTimeout);
        setSessionTimer('00:00');
      }
    }
  }, [calledPatient, appState?.calledTime]);
  
  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900 font-arabic" dir="rtl">
      <div className="flex flex-col w-full">
        <header className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 shadow-md">
            <div className="flex items-center gap-3">
            <Logo className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                العالمية جروب - غرفة الانتظار
            </h1>
            </div>
            <div className="text-3xl font-mono text-gray-700 dark:text-gray-300">
            {currentTime}
            </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
            <AnimatePresence mode="wait">
            {calledPatient && appState?.assignedRoomNumber ? (
                <motion.div
                    key={calledPatient._id}
                    initial={{ opacity: 0, scale: 0.7, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className={cn(
                    "w-full max-w-4xl rounded-2xl bg-white dark:bg-gray-800 p-12 text-center shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-500",
                    isPulsing && "shadow-red-500/50 shadow-2xl border-red-500 animate-pulse"
                    )}
                >
                    <p className="text-4xl font-medium text-gray-600 dark:text-gray-400">الدور الحالي لـ</p>
                    <h2 className="my-4 text-8xl font-bold text-primary tracking-tight">
                    {calledPatient.patientName}
                    </h2>
                    <div className="mt-10 flex justify-center divide-x-2 divide-gray-200 dark:divide-gray-700 rtl:divide-x-reverse">
                    <div className="px-8 flex items-center gap-4">
                        <Hash className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                        <div>
                            <p className="text-2xl text-gray-500 dark:text-gray-400">رقم المريض</p>
                            <p className="text-5xl font-semibold text-gray-800 dark:text-gray-200">{calledPatient.patientId}</p>
                        </div>
                    </div>
                    <div className="px-8 flex items-center gap-4">
                        <DoorOpen className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                        <div>
                            <p className="text-2xl text-gray-500 dark:text-gray-400">يرجى التوجه إلى</p>
                            <p className="text-5xl font-semibold text-gray-800 dark:text-gray-200">غرفة {appState.assignedRoomNumber}</p>
                        </div>
                    </div>
                    </div>
                    <div className="mt-8 flex justify-center items-center gap-3 text-gray-500 dark:text-gray-400">
                        <Clock className="h-6 w-6" />
                        <p className="text-2xl font-mono">{sessionTimer}</p>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="waiting"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h2 className="text-5xl font-semibold text-gray-500 dark:text-gray-400">
                        الرجاء الإنتظار...
                    </h2>
                    <p className="mt-4 text-2xl text-gray-400 dark:text-gray-500">
                        سيتم استدعاء المريض التالي قريباً.
                    </p>
                </motion.div>
            )}
            </AnimatePresence>
            </main>
            <aside className="w-1/3 max-w-sm p-4 bg-gray-100 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Users />
                    قائمة الانتظار
                </h3>
                <AnimatePresence>
                    {inRoomList?.map(apt => <PatientListItem key={apt._id} appointment={apt} />)}
                    {waitingList?.map(apt => <PatientListItem key={apt._id} appointment={apt} />)}
                </AnimatePresence>
                {(waitingList?.length === 0 && inRoomList?.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center pt-8">لا يوجد مرضى في قائمة الانتظار حالياً.</p>
                )}
            </aside>
        </div>
      </div>
    </div>
  );
}
