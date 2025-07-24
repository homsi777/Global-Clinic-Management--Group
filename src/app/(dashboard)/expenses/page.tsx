'use client';

import { useLocale } from '@/components/locale-provider';

export default function ExpensesPage() {
  const { locale } = useLocale();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
            {locale === 'ar' ? 'المصاريف' : 'Expenses'}
        </h1>
        <p className="text-muted-foreground">
            {locale === 'ar' ? 'تتبع وإدارة مصاريف العيادة.' : 'Track and manage clinic expenses.'}
        </p>
      </header>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            {locale === 'ar' ? 'صفحة المصاريف قيد الإنشاء' : 'Expenses page is under construction'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {locale === 'ar' ? 'تحقق مرة أخرى في وقت لاحق للحصول على التحديثات.' : 'Check back later for updates.'}
          </p>
        </div>
      </div>
    </div>
  );
}
