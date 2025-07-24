import PatientsTable from '@/components/dashboard/patients-table';

export default function PatientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
        <p className="text-muted-foreground">
          View and manage all patient records.
        </p>
      </header>
      <PatientsTable />
    </div>
  );
}
