'use client';

import React, { useEffect, useState } from 'react';
import { useClinicContext } from '@/components/app-provider';
import { Logo } from '@/components/icons/logo';
import { AnimatePresence, motion } from 'framer-motion';
import { Hash, DoorOpen } from 'lucide-react';

export default function WaitingRoomPage() {
  const { currentlyCalled, getPatientById } = useClinicContext();
  const [patient, setPatient] = useState<ReturnType<typeof getPatientById>>(null);
  const [displayData, setDisplayData] = useState<{name: string, id: string, room: number} | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    
    // Set initial time
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentlyCalled) {
      const calledPatient = getPatientById(currentlyCalled.patientId);
      setPatient(calledPatient);
      if (calledPatient && currentlyCalled.assignedRoomNumber) {
        setDisplayData({
            name: calledPatient.patientName,
            id: calledPatient.patientId,
            room: currentlyCalled.assignedRoomNumber
        });
      }
    }
  }, [currentlyCalled, getPatientById]);


  return (
    <div className="flex h-screen w-full flex-col bg-gray-100 dark:bg-gray-900">
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
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background to-secondary">
        <AnimatePresence mode="wait">
        {displayData ? (
            <motion.div
              key={displayData.id}
              initial={{ opacity: 0, scale: 0.7, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="w-full max-w-4xl rounded-2xl bg-card p-12 text-center shadow-2xl border"
            >
              <p className="text-4xl font-medium text-muted-foreground">Now Serving</p>
              <h2 className="my-4 text-8xl font-bold text-primary tracking-tight">
                {displayData.name}
              </h2>
              <div className="mt-10 flex justify-center divide-x-2 divide-border">
                 <div className="px-8 flex items-center gap-4">
                    <Hash className="h-12 w-12 text-accent" />
                    <div>
                        <p className="text-2xl text-muted-foreground">Patient ID</p>
                        <p className="text-5xl font-semibold">{displayData.id}</p>
                    </div>
                </div>
                <div className="px-8 flex items-center gap-4">
                    <DoorOpen className="h-12 w-12 text-accent" />
                     <div>
                        <p className="text-2xl text-muted-foreground">Please proceed to</p>
                        <p className="text-5xl font-semibold">Room {displayData.room}</p>
                    </div>
                </div>
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
                    Please wait...
                </h2>
                <p className="mt-4 text-2xl text-muted-foreground/80">
                    The next patient will be called shortly.
                </p>
            </motion.div>
        )}
        </AnimatePresence>
      </main>
      <footer className="p-4 text-center text-muted-foreground bg-white dark:bg-gray-800">
          Have a wonderful day!
      </footer>
    </div>
  );
}
