import PatientQueue from '@/components/dashboard/patient-queue';
import ClinicRooms from '@/components/dashboard/clinic-rooms';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Clinic Dashboard</h1>
        <p className="text-muted-foreground">
          Manage patient queue and view daily progress.
        </p>
      </header>
      <ClinicRooms />
      <PatientQueue />
    </div>
  );
}
