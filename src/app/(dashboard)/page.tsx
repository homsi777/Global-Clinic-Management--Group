'use client';

import PatientQueue from '@/components/dashboard/patient-queue';
import ClinicRooms from '@/components/dashboard/clinic-rooms';
import { useLocale } from '@/components/locale-provider';

export default function DashboardPage() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
            {locale === 'ar' ? 'لوحة تحكم العيادة' : 'Clinic Dashboard'}
        </h1>
        <p className="text-muted-foreground">
            {locale === 'ar' ? 'إدارة طابور المرضى وعرض التقدم اليومي.' : 'Manage patient queue and view daily progress.'}
        </p>
      </header>
      <ClinicRooms />
      <PatientQueue />
    </div>
  );
}
