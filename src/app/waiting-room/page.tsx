
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useClinicContext } from '@/components/app-provider';
import { Logo } from '@/components/icons/logo';
import { AnimatePresence, motion } from 'framer-motion';
import { Hash, DoorOpen, Clock, Users, UserCheck, UserX } from 'lucide-react';
import type { Patient, Appointment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


interface DisplayData {
  name: string;
  id: string;
  room: number;
  calledTime: string;
}

export default function WaitingRoomPage() {
  const { getPatientById } = useClinicContext();
  const [currentlyCalled, setCurrentlyCalled] = useState<Appointment | null>(null);
  const [displayData, setDisplayData] = useState<DisplayData | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [sessionTimer, setSessionTimer] = useState('00:00');
  const [isPulsing, setIsPulsing] = useState(false);
  const [waitingList, setWaitingList] = useState<Appointment[]>([]);
  const [inRoomList, setInRoomList] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const updateClientTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    };
    updateClientTime();
    const timer = setInterval(updateClientTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const updateStateFromLocalStorage = useCallback(() => {
    try {
        const storedCall = localStorage.getItem('currentlyCalled');
        const storedAppointments = localStorage.getItem('appointments');
        
        const allApts = storedAppointments ? JSON.parse(storedAppointments) : [];
        setAllAppointments(allApts);

        const newCurrentlyCalled = storedCall ? JSON.parse(storedCall) : null;

        // Check if there is a new call
        if (newCurrentlyCalled && newCurrentlyCalled._id !== currentlyCalled?._id) {
             setCurrentlyCalled(newCurrentlyCalled);
        } else if (!newCurrentlyCalled && currentlyCalled) {
             setCurrentlyCalled(null);
        } else {
             // If no change in called patient, just update lists
             setWaitingList(allApts.filter((apt: Appointment) => apt.status === 'Waiting'));
             setInRoomList(allApts.filter((apt: Appointment) => apt.status === 'InRoom'));
        }

    } catch (error) {
        console.error("Error reading from localStorage", error);
    }
  }, [currentlyCalled]);


  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === 'currentlyCalled' || event.key === 'appointments') {
      updateStateFromLocalStorage();
    }
  }, [updateStateFromLocalStorage]);

  useEffect(() => {
    updateStateFromLocalStorage(); // Initial load
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll every 5 seconds as a fallback
    const intervalId = setInterval(updateStateFromLocalStorage, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [handleStorageChange, updateStateFromLocalStorage]);


  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;

    if (currentlyCalled) {
      const calledPatient = getPatientById(currentlyCalled.patientId);
      if (calledPatient && currentlyCalled.assignedRoomNumber && currentlyCalled.calledTime) {
        setDisplayData({
            name: calledPatient.patientName,
            id: calledPatient.patientId,
            room: currentlyCalled.assignedRoomNumber,
            calledTime: currentlyCalled.calledTime,
        });

        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 7000); 

        const startTime = new Date(currentlyCalled.calledTime).getTime();
        timerInterval = setInterval(() => {
            const now = new Date().getTime();
            const diff = now - startTime;
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setSessionTimer(
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            );
        }, 1000);
      }
    } else {
        setDisplayData(null);
    }

    // Update waiting and in-room lists whenever `allAppointments` or `currentlyCalled` changes
    setWaitingList(allAppointments.filter(apt => apt.status === 'Waiting'));
    setInRoomList(allAppointments.filter(apt => apt.status === 'InRoom'));


    return () => {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        setSessionTimer('00:00');
    }
  }, [currentlyCalled, getPatientById, allAppointments]);

  const PatientListItem = ({ appointment }: { appointment: Appointment }) => {
    const patient = getPatientById(appointment.patientId);
    if (!patient) return null;

    const statusConfig = {
        'Waiting': { color: 'bg-orange-100 border-orange-500', icon: <UserCheck className="h-4 w-4 text-orange-600" />, text: 'ينتظر' },
        'InRoom': { color: 'bg-green-100 border-green-500', icon: <DoorOpen className="h-4 w-4 text-green-600" />, text: `في غرفة ${appointment.assignedRoomNumber}` },
        'NotArrived': { color: 'bg-red-100 border-red-500', icon: <UserX className="h-4 w-4 text-red-600" />, text: 'لم يحضر' }
    };
    
    // For now, all waiting are considered "arrived". The "NotArrived" is for future implementation.
    const currentStatus = appointment.status === 'Waiting' ? 'Waiting' : 'InRoom';
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
            <main className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background to-secondary">
            <AnimatePresence mode="wait">
            {displayData ? (
                <motion.div
                    key={displayData.id}
                    initial={{ opacity: 0, scale: 0.7, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className={cn(
                    "w-full max-w-4xl rounded-2xl bg-card p-12 text-center shadow-2xl border transition-all duration-500",
                    isPulsing && "shadow-red-500/50 shadow-2xl border-red-500 animate-pulse"
                    )}
                >
                    <p className="text-4xl font-medium text-muted-foreground">الدور الحالي لـ</p>
                    <h2 className="my-4 text-8xl font-bold text-primary tracking-tight">
                    {displayData.name}
                    </h2>
                    <div className="mt-10 flex justify-center divide-x-2 divide-border rtl:divide-x-reverse">
                    <div className="px-8 flex items-center gap-4">
                        <Hash className="h-12 w-12 text-accent-foreground" />
                        <div>
                            <p className="text-2xl text-muted-foreground">رقم المريض</p>
                            <p className="text-5xl font-semibold">{displayData.id}</p>
                        </div>
                    </div>
                    <div className="px-8 flex items-center gap-4">
                        <DoorOpen className="h-12 w-12 text-accent-foreground" />
                        <div>
                            <p className="text-2xl text-muted-foreground">يرجى التوجه إلى</p>
                            <p className="text-5xl font-semibold">غرفة {displayData.room}</p>
                        </div>
                    </div>
                    </div>
                    <div className="mt-8 flex justify-center items-center gap-3 text-muted-foreground">
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
                    <h2 className="text-5xl font-semibold text-muted-foreground">
                        الرجاء الإنتظار...
                    </h2>
                    <p className="mt-4 text-2xl text-muted-foreground/80">
                        سيتم استدعاء المريض التالي قريباً.
                    </p>
                </motion.div>
            )}
            </AnimatePresence>
            </main>
            <aside className="w-1/3 max-w-sm p-4 bg-gray-200 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Users />
                    قائمة الانتظار
                </h3>
                <AnimatePresence>
                    {inRoomList.map(apt => <PatientListItem key={apt._id} appointment={apt} />)}
                    {waitingList.map(apt => <PatientListItem key={apt._id} appointment={apt} />)}
                </AnimatePresence>
                {waitingList.length === 0 && inRoomList.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center pt-8">لا يوجد مرضى في قائمة الانتظار حالياً.</p>
                )}
            </aside>
        </div>
      </div>
    </div>
  );
}

    