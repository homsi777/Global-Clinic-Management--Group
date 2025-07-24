
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Patient, Appointment, AppointmentStatus, Transaction, Room, User, UserRole } from '@/lib/types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, populate } from '@/lib/db';

const mockUsers: User[] = [
    { _id: 'user-1', name: 'Admin User', role: 'Admin' },
    { _id: 'user-2', name: 'Nurse User', role: 'Nurse' },
    { _id: 'user-3', name: 'Assistant User', role: 'DoctorAssistant' },
]

interface AppContextType {
  patients: Patient[];
  appointments: Appointment[];
  transactions: Transaction[];
  rooms: Room[];
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus, roomNumber?: number) => void;
  getPatientById: (patientId: string) => Patient | undefined;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  
  // Populate DB on initial load
  useEffect(() => {
    populate().catch(err => {
        console.error("Failed to populate database:", err);
    });
  }, []);

  const patients = useLiveQuery(() => db.patients.toArray(), []);
  const appointments = useLiveQuery(() => db.appointments.toArray(), []);
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  
  const isLoading = !patients || !appointments || !transactions;

  const getPatientById = (patientId: string) => {
    return patients?.find(p => p.patientId === patientId);
  };
  
  const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus, roomNumber?: number) => {
    const appointment = appointments?.find(apt => apt._id === appointmentId);
    if (!appointment) return;
    
    const updates: Partial<Appointment> = {
        status,
        assignedRoomNumber: roomNumber ?? appointment.assignedRoomNumber,
        calledTime: status === 'InRoom' ? new Date().toISOString() : appointment.calledTime,
        completedTime: status === 'Completed' ? new Date().toISOString() : appointment.completedTime,
    };
    
    await db.appointments.update(appointmentId, updates);

    if (status === 'InRoom') {
        await db.appState.put({ 
            id: 'current', 
            currentCalledPatientId: appointment.patientId,
            assignedRoomNumber: roomNumber,
            calledTime: new Date().toISOString()
        });
    } else {
        const currentAppState = await db.appState.get('current');
        if (currentAppState?.currentCalledPatientId === appointment.patientId) {
            await db.appState.put({ id: 'current', currentCalledPatientId: null, assignedRoomNumber: null, calledTime: null });
        }
    }
  };

  const TOTAL_ROOMS = 5;
  const rooms: Room[] = Array.from({ length: TOTAL_ROOMS }, (_, i) => {
    const roomNumber = i + 1;
    const occupyingAppointment = appointments?.find(
      (apt) => apt.status === 'InRoom' && apt.assignedRoomNumber === roomNumber
    );
    const patient = occupyingAppointment ? getPatientById(occupyingAppointment.patientId) : undefined;
    return {
      _id: `room-${roomNumber}`,
      roomNumber,
      isOccupied: !!occupyingAppointment,
      currentPatientId: patient?.patientId,
      patientName: patient?.patientName,
    };
  });


  const value: AppContextType = {
    patients: patients || [],
    appointments: appointments || [],
    transactions: transactions || [],
    rooms,
    updateAppointmentStatus,
    getPatientById,
    currentUser,
    setCurrentUser,
    users: mockUsers,
    isLoading,
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
