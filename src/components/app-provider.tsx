'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Patient, Appointment, AppointmentStatus, Transaction } from '@/lib/types';
import { mockPatients, mockAppointments, mockTransactions } from '@/lib/data';

interface AppContextType {
  patients: Patient[];
  appointments: Appointment[];
  transactions: Transaction[];
  currentlyCalled: Appointment | null;
  setCurrentlyCalled: (appointment: Appointment | null) => void;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus, roomNumber?: number) => void;
  getPatientById: (patientId: string) => Patient | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [currentlyCalled, setCurrentlyCalled] = useState<Appointment | null>(null);

  const updateAppointmentStatus = (appointmentId: string, status: AppointmentStatus, roomNumber?: number) => {
    setAppointments(prevAppointments =>
      prevAppointments.map(apt => {
        if (apt._id === appointmentId) {
          const updatedApt = {
            ...apt,
            status,
            assignedRoomNumber: roomNumber ?? apt.assignedRoomNumber,
            calledTime: status === 'InRoom' ? new Date().toISOString() : apt.calledTime,
            completedTime: status === 'Completed' ? new Date().toISOString() : apt.completedTime,
          };
          if (status === 'InRoom') {
            setCurrentlyCalled(updatedApt);
          } else if (status === 'Completed' && currentlyCalled?._id === appointmentId) {
            // Optional: Clear currentlyCalled or move to next logic
          }
          return updatedApt;
        }
        return apt;
      })
    );
  };

  const getPatientById = (patientId: string) => {
    return patients.find(p => p.patientId === patientId);
  };

  const value = {
    patients,
    appointments,
    transactions,
    currentlyCalled,
    setCurrentlyCalled,
    updateAppointmentStatus,
    getPatientById,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useClinicContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useClinicContext must be used within an AppProvider');
  }
  return context;
}
