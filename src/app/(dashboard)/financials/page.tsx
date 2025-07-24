'use client';

import FinancialsTable from '@/components/dashboard/financials-table';
import { useLocale } from '@/components/locale-provider';


export default function FinancialsPage() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
            {locale === 'ar' ? 'المالية' : 'Financials'}
        </h1>
        <p className="text-muted-foreground">
            {locale === 'ar' ? 'عرض وإدارة السجلات المالية للمرضى.' : 'View and manage patient financial records.'}
        </p>
      </header>
      <FinancialsTable />
    </div>
  );
}
