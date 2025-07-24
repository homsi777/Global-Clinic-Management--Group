export interface Patient {
  _id: string;
  patientName: string;
  patientId: string; // Unique ID
  startDate: string; // Using string for simplicity with new Date()
  currentStatus: string;
  totalSessions: number;
  completedSessions: number;
  notes: string;
  avatarUrl: string;
}

export interface Room {
  _id: string;
  roomNumber: number;
  isOccupied: boolean;
  currentPatientId?: string;
  patientName?: string;
}

export type AppointmentStatus = 'Waiting' | 'InRoom' | 'Completed' | 'Canceled';

export interface Appointment {
  _id:string;
  patientId: string;
  status: AppointmentStatus;
  assignedRoomNumber?: number;
  calledTime?: string;
  completedTime?: string;
  queueTime: string;
}

export interface Visit {
  _id: string;
  patientId: string;
  visitDate: string;
  doctorNotes: string;
  proceduresPerformed: string;
  sessionNumber: number;
}

export interface Transaction {
  _id: string;
  patientId: string;
  patientName: string;
  date: string;
  description: string;
  amount: number;
  type: 'Payment' | 'Charge';
  status: 'Paid' | 'Pending';
}

export type UserRole = 'Admin' | 'Nurse' | 'DoctorAssistant';

export interface User {
  _id: string;
  name: string;
  role: UserRole;
}
