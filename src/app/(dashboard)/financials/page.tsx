'use client';

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
import { Activity, CreditCard, DollarSign, Users } from 'lucide-react';

export default function FinancialsPage() {
  const { locale } = useLocale();

  const summaryCards = [
    {
      title: 'Total Revenue',
      titleAr: 'إجمالي الإيرادات',
      amount: 'SYP 45,231.89',
      amountAr: '45,231.89 ل.س',
      description: '+20.1% from last month',
      descriptionAr: '+20.1% عن الشهر الماضي',
      icon: <DollarSign className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Outstanding Debt',
      titleAr: 'الديون المستحقة',
      amount: 'SYP 1,250.00',
      amountAr: '1,250.00 ل.س',
      description: '+180.1% from last month',
      descriptionAr: '+180.1% عن الشهر الماضي',
      icon: <CreditCard className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Recent Transactions',
      titleAr: 'المعاملات الأخيرة',
      amount: '+573',
      amountAr: '+573',
      description: '+201 since last hour',
      descriptionAr: '+201 منذ الساعة الماضية',
      icon: <Activity className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {locale === 'ar' ? 'المالية والمحاسبة' : 'Financials & Billing'}
        </h1>
        <p className="text-muted-foreground">
          {locale === 'ar'
            ? 'إدارة الفواتير والمدفوعات والسجلات المالية.'
            : 'Manage billing, payments, and financial records.'}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {locale === 'ar' ? card.titleAr : card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {locale === 'ar' ? card.amountAr : card.amount}
              </div>
              <p className="text-xs text-muted-foreground">
                {locale === 'ar' ? card.descriptionAr : card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">
            {locale === 'ar' ? 'سجل المعاملات' : 'Transaction History'}
          </TabsTrigger>
          <TabsTrigger value="new-payment">
            {locale === 'ar' ? 'إضافة دفعة جديدة' : 'Add New Payment'}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <FinancialsTable />
        </TabsContent>
        <TabsContent value="new-payment">
          <Card>
            <CardHeader>
              <CardTitle>
                {locale === 'ar' ? 'تسجيل دفعة جديدة' : 'Record New Payment'}
              </CardTitle>
              <CardDescription>
                {locale === 'ar'
                  ? 'هذه الميزة قيد التطوير حاليًا.'
                  : 'This feature is currently under development.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-16">
              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                  {locale === 'ar'
                    ? 'قيد الإنشاء'
                    : 'Under Construction'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar'
                    ? 'سيتم هنا عرض واجهة تسجيل المدفوعات.'
                    : 'The payment recording interface will be here.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
