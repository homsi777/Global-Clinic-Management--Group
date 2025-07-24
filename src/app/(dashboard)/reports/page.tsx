'use client';

import { useLocale } from '@/components/locale-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, CartesianGrid, XAxis, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useClinicContext } from '@/components/app-provider';
import type { Patient } from '@/lib/types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';


const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
  patients: {
    label: 'Patients',
    color: 'hsl(var(--chart-2))',
  },
};


export default function ReportsPage() {
  const { locale } = useLocale();
  const { patients } = useClinicContext();

  const monthlyRevenueData = useLiveQuery(async () => {
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const targetMonth = subMonths(now, i);
        const monthStart = startOfMonth(targetMonth).getTime();
        const monthEnd = endOfMonth(targetMonth).getTime();

        const transactions = await db.transactions
            .where('date').between(monthStart, monthEnd)
            .and(tx => tx.type === 'Payment')
            .toArray();
        
        const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        
        data.push({
            month: format(targetMonth, 'MMM'),
            total: total
        });
    }
    return data;
  }, []);

  const statusTranslations: { [key in Patient['currentStatus']]: { en: string, ar: string } } = {
    'Active Treatment': { en: 'Active Treatment', ar: 'علاج فعال' },
    'Final Phase': { en: 'Final Phase', ar: 'المرحلة النهائية' },
    'Retention Phase': { en: 'Retention Phase', ar: 'مرحلة التثبيت' },
    'Completed': { en: 'Completed', ar: 'مكتمل' }
  };
  
  const statusData = (Object.keys(statusTranslations) as Array<Patient['currentStatus']>).map(status => {
      const count = patients.filter(p => p.currentStatus === status).length;
      return { name: status, value: count, label: statusTranslations[status][locale] }
  }).filter(item => item.value > 0);


  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {locale === 'ar' ? 'التقارير والإحصائيات' : 'Reports & Analytics'}
        </h1>
        <p className="text-muted-foreground">
          {locale === 'ar' ? 'نظرة شاملة على أداء العيادة.' : 'A comprehensive overview of the clinic\'s performance.'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>{locale === 'ar' ? 'توزيع حالات المرضى' : 'Patient Status Distribution'}</CardTitle>
                <CardDescription>{locale === 'ar' ? 'يعرض هذا المخطط توزيع المرضى الحاليين حسب حالة علاجهم.' : 'This chart shows the distribution of current patients by their treatment status.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                    <Legend verticalAlign="bottom" height={36}/>
                    <Pie data={statusData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{locale === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}</CardTitle>
                <CardDescription>{locale === 'ar' ? 'إجمالي الإيرادات (المدفوعات) خلال آخر 6 أشهر.' : 'Total revenue (payments) over the last 6 months.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart data={monthlyRevenueData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <ChartTooltip 
                        cursor={false}
                        content={<ChartTooltipContent 
                            hideLabel 
                            formatter={(value) => locale === 'ar' ? `${Number(value).toFixed(2)} ل.س` : `SYP ${Number(value).toFixed(2)}`}
                        />} 
                    />
                    <Bar dataKey="total" fill="var(--color-revenue)" radius={4} />
                </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>{locale === 'ar' ? 'تفصيل حالات المرضى' : 'Patient Status Breakdown'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{locale === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead className="text-center">{locale === 'ar' ? 'عدد المرضى' : 'Number of Patients'}</TableHead>
                <TableHead className="text-center">{locale === 'ar' ? 'النسبة المئوية' : 'Percentage'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statusData.map((item, index) => (
                <TableRow key={item.name}>
                  <TableCell>
                    <Badge variant="outline" style={{ borderLeftColor: COLORS[index % COLORS.length], borderLeftWidth: '4px' }}>
                        {statusTranslations[item.name as Patient['currentStatus']][locale]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">{item.value}</TableCell>
                  <TableCell className="text-center">{patients.length > 0 ? ((item.value / patients.length) * 100).toFixed(1) : 0}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
