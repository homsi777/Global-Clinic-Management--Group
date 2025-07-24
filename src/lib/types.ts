export interface Patient {
  _id: string;
  patientName: string;
  patientId: string; // Unique ID
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  startDate: string; 
  currentStatus: 'Active Treatment' | 'Final Phase' | 'Retention Phase'; // e.g., 'Active Treatment', 'Retention Phase'
  totalSessions: number;
  completedSessions: number;
  chiefComplaint: string;
  notes: string;
  avatarUrl: string;
  outstandingBalance: number; // Added for financial status
  remainingSessions: number; // Added for treatment progress
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
  description?: string;
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
