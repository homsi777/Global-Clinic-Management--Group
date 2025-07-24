'use client';

import React, { useState } from 'react';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { PlusCircle, Receipt } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AddEditExpenseSheet from '@/components/dashboard/add-edit-expense-sheet';


export default function ExpensesPage() {
  const { locale } = useLocale();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const expenses = useLiveQuery(
    () => db.expenses.orderBy('date').reverse().toArray(),
    []
  );

  const categoryTranslations: { [key: string]: { en: string; ar: string } } = {
    'Rent': { en: 'Rent', ar: 'إيجار' },
    'Salaries': { en: 'Salaries', ar: 'رواتب' },
    'Supplies': { en: 'Supplies', ar: 'مستلزمات' },
    'Utilities': { en: 'Utilities', ar: 'خدمات' },
    'Marketing': { en: 'Marketing', ar: 'تسويق' },
    'Maintenance': { en: 'Maintenance', ar: 'صيانة' },
    'Other': { en: 'Other', ar: 'أخرى' },
  }

  return (
    <>
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="h-8 w-8 text-primary" />
            {locale === 'ar' ? 'المصاريف' : 'Expenses'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'تتبع وإدارة مصاريف العيادة.' : 'Track and manage clinic expenses.'}
          </p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)}>
            <PlusCircle className="mr-2" />
            {locale === 'ar' ? 'إضافة مصروف جديد' : 'Add New Expense'}
        </Button>
      </header>
      
      <Card>
        <CardHeader>
            <CardTitle>{locale === 'ar' ? 'سجل المصاريف' : 'Expenses Log'}</CardTitle>
            <CardDescription>{locale === 'ar' ? 'قائمة بجميع المصروفات المسجلة.' : 'A list of all recorded expenses.'}</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{locale === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                        <TableHead>{locale === 'ar' ? 'الوصف' : 'Description'}</TableHead>
                        <TableHead>{locale === 'ar' ? 'الفئة' : 'Category'}</TableHead>
                        <TableHead>{locale === 'ar' ? 'المسجل' : 'Recorded By'}</TableHead>
                        <TableHead className="text-right">{locale === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses?.map(expense => (
                        <TableRow key={expense._id}>
                            <TableCell>{new Date(expense.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</TableCell>
                            <TableCell className="font-medium">{expense.description}</TableCell>
                            <TableCell>
                                <Badge variant="outline">
                                    {categoryTranslations[expense.category]?.[locale] || expense.category}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{expense.recordedBy}</TableCell>
                            <TableCell className="text-right font-mono text-red-600 dark:text-red-400">
                                {locale === 'ar' ? `-${expense.amount.toFixed(2)} ل.س` : `-SYP ${expense.amount.toFixed(2)}`}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {expenses?.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    {locale === 'ar' ? 'لم يتم تسجيل أي مصاريف بعد.' : 'No expenses recorded yet.'}
                </div>
            )}
        </CardContent>
      </Card>

    </div>
    <AddEditExpenseSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
