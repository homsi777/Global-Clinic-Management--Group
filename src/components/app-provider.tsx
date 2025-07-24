'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);

  // Effect to sync appointments to localStorage for cross-tab communication
  useEffect(() => {
    try {
        localStorage.setItem('appointments', JSON.stringify(appointments));
    } catch (error) {
        console.error("Could not write appointments to localStorage", error);
    }
  }, [appointments]);


  const getPatientById = (patientId: string) => {
    return patients.find(p => p.patientId === patientId);
  };
  
  const updateAppointmentStatus = (appointmentId: string, status: AppointmentStatus, roomNumber?: number) => {
    let updatedApt: Appointment | null = null;
    const newAppointments = appointments.map(apt => {
        if (apt._id === appointmentId) {
          updatedApt = {
            ...apt,
            status,
            assignedRoomNumber: roomNumber ?? apt.assignedRoomNumber,
            calledTime: status === 'InRoom' ? new Date().toISOString() : apt.calledTime,
            completedTime: status === 'Completed' ? new Date().toISOString() : apt.completedTime,
          };
          return updatedApt;
        }
        return apt;
      });

    setAppointments(newAppointments);

    // Use localStorage to sync across tabs
    try {
        if (status === 'InRoom' && updatedApt) {
            localStorage.setItem('currentlyCalled', JSON.stringify(updatedApt));
        } else {
            // If another patient is completed, we need to check if they were the one being called
            const currentlyCalled = JSON.parse(localStorage.getItem('currentlyCalled') || 'null');
            if (currentlyCalled?._id === appointmentId) {
                localStorage.removeItem('currentlyCalled');
            }
        }
    } catch (error) {
        console.error("Could not write to localStorage", error);
    }
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
