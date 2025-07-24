import Dexie, { type Table } from 'dexie';
import type { Patient, Appointment, Transaction, Expense, Invoice } from './types';

export interface AppState {
  id: string; // Should be "current"
  currentCalledPatientId: string | null;
  assignedRoomNumber: number | null;
  calledTime: string | null;
}

class ClinicDatabase extends Dexie {
  patients!: Table<Patient>;
  appointments!: Table<Appointment>;
  transactions!: Table<Transaction>;
  expenses!: Table<Expense>;
  invoices!: Table<Invoice>;
  appState!: Table<AppState>;

  constructor() {
    super('clinicDatabase');
    this.version(3).stores({
      patients: '++_id, patientId, patientName, currentStatus, outstandingBalance',
      appointments: '++_id, patientId, queueTime, status, assignedRoomNumber',
      transactions: '++_id, patientId, date, type, status',
      expenses: '++_id, date, category',
      invoices: '++_id, invoiceNumber, patientId, date, status',
      appState: '&id',
    });
  }
}

export const db = new ClinicDatabase();

// Function to populate the database with mock data if it's empty
export async function populate() {
    const patientCount = await db.patients.count();
    if (patientCount > 0) {
        // Database is already populated
        return;
    }
    
    const { mockPatients, mockAppointments, mockTransactions } = await import('@/lib/data');

    await db.transaction('rw', db.patients, db.appointments, db.transactions, db.appState, async () => {
        await db.patients.bulkAdd(mockPatients);
        await db.appointments.bulkAdd(mockAppointments);
        await db.transactions.bulkAdd(mockTransactions);
        await db.appState.add({ id: 'current', currentCalledPatientId: null, assignedRoomNumber: null, calledTime: null });
    });
    console.log('Database populated with mock data.');
}
