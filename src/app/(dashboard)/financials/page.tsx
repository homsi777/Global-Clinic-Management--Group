'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinancialsTable from '@/components/dashboard/financials-table';
import { useLocale } from '@/components/locale-provider';
import { Activity, CreditCard, DollarSign, PlusCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddNewPaymentForm from '@/components/dashboard/add-new-payment-form';
import InvoicesTable from '@/components/dashboard/invoices-table';
import AddEditInvoiceSheet from '@/components/dashboard/add-edit-invoice-sheet';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';


export default function FinancialsPage() {
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = React.useState('transactions');
  const [isInvoiceSheetOpen, setIsInvoiceSheetOpen] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState('this_month');


  const dateRange = React.useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case 'today':
        return { from: startOfDay(now), to: endOfDay(now) };
      case 'last_7_days':
        return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
      case 'this_month':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'this_year':
        return { from: startOfYear(now), to: endOfYear(now) };
      default:
        return { from: startOfMonth(now), to: endOfMonth(now) };
    }
  }, [timeRange]);

  const financialSummary = useLiveQuery(async () => {
    const from = dateRange.from.getTime();
    const to = dateRange.to.getTime();

    const revenue = await db.transactions
        .where('date').between(from, to, true, true)
        .and(tx => tx.type === 'Payment')
        .toArray();
    const totalRevenue = revenue.reduce((sum, tx) => sum + tx.amount, 0);

    const expenses = await db.expenses
        .where('date').between(from, to, true, true)
        .toArray();
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const netProfit = totalRevenue - totalExpenses;

    return { totalRevenue, totalExpenses, netProfit };
  }, [dateRange]);


  const handleTabChange = (value: string) => {
    setActiveTab(value);
  }

  return (
    <>
    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col gap-6">
       <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">
            {locale === 'ar' ? 'المالية والمحاسبة' : 'Financials & Billing'}
            </h1>
            <p className="text-muted-foreground">
            {locale === 'ar'
                ? 'إدارة الفواتير والمدفوعات والسجلات المالية.'
                : 'Manage billing, payments, and financial records.'}
            </p>
        </div>
         {activeTab === 'transactions' && (
            <Button onClick={() => setActiveTab('new-payment')}>
                <PlusCircle className="mr-2" />
                {locale === 'ar' ? 'إضافة دفعة جديدة' : 'Add New Payment'}
            </Button>
         )}
         {activeTab === 'invoices' && (
            <Button onClick={() => setIsInvoiceSheetOpen(true)}>
                <PlusCircle className="mr-2" />
                {locale === 'ar' ? 'إنشاء فاتورة جديدة' : 'Create New Invoice'}
            </Button>
         )}
      </header>
      
      <Card>
          <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{locale === 'ar' ? 'ملخص مالي' : 'Financial Summary'}</CardTitle>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder={locale === 'ar' ? 'اختر الفترة' : 'Select Period'} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">{locale === 'ar' ? 'اليوم' : 'Today'}</SelectItem>
                        <SelectItem value="last_7_days">{locale === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days'}</SelectItem>
                        <SelectItem value="this_month">{locale === 'ar' ? 'هذا الشهر' : 'This Month'}</SelectItem>
                        <SelectItem value="this_year">{locale === 'ar' ? 'هذه السنة' : 'This Year'}</SelectItem>
                    </SelectContent>
                </Select>
              </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{locale === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</CardTitle>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{locale === 'ar' ? `${financialSummary?.totalRevenue.toFixed(2) ?? '0.00'} ل.س` : `SYP ${financialSummary?.totalRevenue.toFixed(2) ?? '0.00'}`}</div>
                  </CardContent>
              </Card>
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{locale === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}</CardTitle>
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{locale === 'ar' ? `${financialSummary?.totalExpenses.toFixed(2) ?? '0.00'} ل.س` : `SYP ${financialSummary?.totalExpenses.toFixed(2) ?? '0.00'}`}</div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{locale === 'ar' ? 'صافي الربح' : 'Net Profit'}</CardTitle>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{locale === 'ar' ? `${financialSummary?.netProfit.toFixed(2) ?? '0.00'} ل.س` : `SYP ${financialSummary?.netProfit.toFixed(2) ?? '0.00'}`}</div>
                  </CardContent>
              </Card>
          </CardContent>
      </Card>
      
      <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">{locale === 'ar' ? 'سجل المعاملات' : 'Transaction History'}</TabsTrigger>
            <TabsTrigger value="invoices">{locale === 'ar' ? 'الفواتير' : 'Invoices'}</TabsTrigger>
            <TabsTrigger value="new-payment">{locale === 'ar' ? 'إضافة دفعة جديدة' : 'Add New Payment'}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="transactions">
        <FinancialsTable />
      </TabsContent>
       <TabsContent value="invoices">
        <InvoicesTable />
      </TabsContent>
      <TabsContent value="new-payment">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AddNewPaymentForm />
            <Card>
                 <CardHeader>
                    <CardTitle>{locale === 'ar' ? 'التعليمات' : 'Instructions'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-16">
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h3 className="text-2xl font-bold tracking-tight">
                                {locale === 'ar' ? 'مكان الإيصال والمعاينة' : 'Receipt & Preview Area'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {locale === 'ar' ? 'بعد تسجيل الدفعة، ستظهر هنا خيارات طباعة الإيصال أو إرساله.' : 'After recording a payment, options to print or send the receipt will appear here.'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </TabsContent>
    </Tabs>
    <AddEditInvoiceSheet isOpen={isInvoiceSheetOpen} onOpenChange={setIsInvoiceSheetOpen} />
    </>
  );
}
