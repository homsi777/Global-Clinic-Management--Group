'use client';

import PatientsTable from '@/components/dashboard/patients-table';
import { useLocale } from '@/components/locale-provider';

export default function PatientsPage() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {locale === 'ar' ? 'المرضى' : 'Patients'}
        </h1>
        <p className="text-muted-foreground">
          {locale === 'ar' ? 'عرض وإدارة جميع سجلات المرضى.' : 'View and manage all patient records.'}
        </p>
      </header>
      <PatientsTable />
    </div>
  );
}
