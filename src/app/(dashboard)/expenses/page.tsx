'use client';

import React, { useState, useMemo } from 'react';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { PlusCircle, Receipt, Search } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ExpensesPage() {
  const { locale } = useLocale();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const expenses = useLiveQuery(
    () => db.expenses.orderBy('date').reverse().toArray(),
    []
  );

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter(expense => {
      const searchMatch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
      const categoryMatch = categoryFilter === 'All' || expense.category === categoryFilter;
      return searchMatch && categoryMatch;
    });
  }, [expenses, searchQuery, categoryFilter]);

  const categoryTranslations: { [key: string]: { en: string; ar: string } } = {
    'Rent': { en: 'Rent', ar: 'إيجار' },
    'Salaries': { en: 'Salaries', ar: 'رواتب' },
    'Supplies': { en: 'Supplies', ar: 'مستلزمات' },
    'Utilities': { en: 'Utilities', ar: 'خدمات' },
    'Marketing': { en: 'Marketing', ar: 'تسويق' },
    'Maintenance': { en: 'Maintenance', ar: 'صيانة' },
    'Other': { en: 'Other', ar: 'أخرى' },
  };

  const categories = ['All', 'Rent', 'Salaries', 'Supplies', 'Utilities', 'Marketing', 'Maintenance', 'Other'];

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
            <CardDescription>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground rtl:left-auto rtl:right-3" />
                  <Input
                    placeholder={locale === 'ar' ? 'ابحث بالوصف...' : 'Search by description...'}
                    className="pl-10 rtl:pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select onValueChange={setCategoryFilter} defaultValue="All">
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder={locale === 'ar' ? 'تصفية حسب الفئة' : 'Filter by Category'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'All' ? (locale === 'ar' ? 'كل الفئات' : 'All Categories') : (categoryTranslations[cat]?.[locale] || cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardDescription>
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
                {filteredExpenses?.map(expense => (
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
            {filteredExpenses?.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                {locale === 'ar' ? 'لم يتم العثور على مصاريف تطابق معايير البحث.' : 'No expenses found matching the criteria.'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <AddEditExpenseSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
