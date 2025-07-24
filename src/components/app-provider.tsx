
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Patient, Appointment, AppointmentStatus, Transaction, Room, User, UserRole } from '@/lib/types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, populate } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from './locale-provider';

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
  deletePatient: (patientId: string) => Promise<void>;
  addOrUpdatePatient: (patientData: Partial<Patient>) => Promise<void>;
  addAppointment: (appointmentData: Omit<Appointment, '_id' | 'status' | 'queueTime'>) => Promise<void>;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const { toast } = useToast();
  const { locale } = useLocale();
  
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

  const getPatientById = (patientId: string): Patient | undefined => {
    if (!patients) return undefined;
    return patients.find(p => p.patientId === patientId);
  };
  
  const deletePatient = async (patientId: string) => {
    const patientToDelete = await db.patients.where('patientId').equals(patientId).first();
    if (!patientToDelete) return;

    await db.transaction('rw', db.patients, db.appointments, db.transactions, async () => {
        await db.patients.where('patientId').equals(patientId).delete();
        await db.appointments.where('patientId').equals(patientId).delete();
        await db.transactions.where('patientId').equals(patientId).delete();
    });
  };

  const addOrUpdatePatient = async (patientData: Partial<Patient>) => {
    const isEditing = !!patientData._id;

    if(isEditing) {
        await db.patients.update(patientData._id!, patientData);
        toast({
            title: locale === 'ar' ? 'تم تحديث البيانات' : 'Data Updated',
            description: locale === 'ar' ? `تم تحديث بيانات المريض ${patientData.patientName} بنجاح.` : `Patient ${patientData.patientName} has been updated.`,
        });
    } else {
        const newPatient: Patient = {
            _id: `P${Date.now()}`,
            patientId: `P${Date.now().toString().slice(-6)}`,
            patientName: '',
            dateOfBirth: new Date().toISOString(),
            phone: '',
            startDate: new Date().toISOString(),
            currentStatus: 'Active Treatment',
            totalSessions: 24, // default
            completedSessions: 0,
            remainingSessions: 24, // default
            outstandingBalance: 0,
            avatarUrl: `https://placehold.co/100x100.png`,
            ...patientData
        };
        await db.patients.add(newPatient);
        toast({
            title: locale === 'ar' ? 'تمت إضافة المريض' : 'Patient Added',
            description: locale === 'ar' ? `تم إضافة المريض ${newPatient.patientName} بنجاح.` : `Patient ${newPatient.patientName} has been added.`,
        });
    }
  }

  const addAppointment = async (appointmentData: Omit<Appointment, '_id' | 'status' | 'queueTime'>) => {
    const newAppointment: Appointment = {
        _id: `Apt${Date.now()}`,
        status: 'Waiting',
        queueTime: new Date().toISOString(),
        ...appointmentData
    };
    await db.appointments.add(newAppointment);
    const patient = getPatientById(newAppointment.patientId);
    toast({
        title: locale === 'ar' ? 'تمت إضافة الموعد' : 'Appointment Added',
        description: locale === 'ar' ? `تمت جدولة موعد لـ ${patient?.patientName || 'مريض'}.` : `Appointment scheduled for ${patient?.patientName || 'a patient'}.`,
    });
  }


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

    // Update app state for waiting room display
    if (status === 'InRoom') {
        await db.appState.put({ 
            id: 'current', 
            currentCalledPatientId: appointment.patientId,
            assignedRoomNumber: roomNumber,
            calledTime: new Date().toISOString()
        });
    } else if (status === 'Completed' || status === 'Canceled') {
        // If the patient's session is over, clear them from the "current called" state
        const currentAppState = await db.appState.get('current');
        if (currentAppState?.currentCalledPatientId === appointment.patientId) {
            await db.appState.put({ id: 'current', currentCalledPatientId: null, assignedRoomNumber: null, calledTime: null });
        }
    }
  };

  const TOTAL_ROOMS = 5;
  const rooms: Room[] = Array.from({ length: TOTAL_ROOMS }, (_, i) => {
    const roomNumber = i + 1;
    
    const appointmentInRoom = appointments?.find(
        (apt) => apt.assignedRoomNumber === roomNumber && (apt.status === 'InRoom' || apt.status === 'InConsultation')
    );
    
    const patient = appointmentInRoom && patients ? getPatientById(appointmentInRoom.patientId) : undefined;
    
    let status: Room['currentStatus'] = 'Available';
    if (appointmentInRoom) {
        if (appointmentInRoom.status === 'InConsultation') {
            status = 'Occupied';
        } else if (appointmentInRoom.status === 'InRoom') {
            status = 'Assigned';
        }
    }

    return {
      _id: `room-${roomNumber}`,
      roomNumber,
      isOccupied: status === 'Occupied',
      currentStatus: status,
      currentPatientId: patient?.patientId,
      patientName: patient?.patientName,
      currentAppointmentId: appointmentInRoom?._id
    };
  });


  const value: AppContextType = {
    patients: patients || [],
    appointments: appointments || [],
    transactions: transactions || [],
    rooms,
    updateAppointmentStatus,
    getPatientById,
    deletePatient,
    addOrUpdatePatient,
    addAppointment,
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
