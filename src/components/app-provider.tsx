'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Patient, Appointment, AppointmentStatus, Transaction, Room, User, UserRole } from '@/lib/types';
import { mockPatients, mockAppointments, mockTransactions } from '@/lib/data';

const TOTAL_ROOMS = 5;

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
  currentlyCalled: Appointment | null;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus, roomNumber?: number) => void;
  getPatientById: (patientId: string) => Patient | undefined;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [currentlyCalled, setCurrentlyCalled] = useState<Appointment | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);

  const getPatientById = (patientId: string) => {
    return patients.find(p => p.patientId === patientId);
  };
  
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
            // Use localStorage to sync across tabs
            localStorage.setItem('currentlyCalled', JSON.stringify(updatedApt));

          } else if (status === 'Completed' && currentlyCalled?._id === appointmentId) {
             localStorage.removeItem('currentlyCalled');
          }
          return updatedApt;
        }
        return apt;
      })
    );
  };

  const rooms: Room[] = Array.from({ length: TOTAL_ROOMS }, (_, i) => {
    const roomNumber = i + 1;
    const occupyingAppointment = appointments.find(
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


  const value = {
    patients,
    appointments,
    transactions,
    rooms,
    currentlyCalled,
    updateAppointmentStatus,
    getPatientById,
    currentUser,
    setCurrentUser,
    users: mockUsers
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
