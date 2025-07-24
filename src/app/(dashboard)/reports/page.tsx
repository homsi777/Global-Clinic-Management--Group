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
import { BarChart, CartesianGrid, XAxis, Bar, PieChart, Pie, Cell } from 'recharts';
import { useClinicContext } from '@/components/app-provider';
import type { Patient } from '@/lib/types';


// Sample data for charts
const chartData = [
  { month: 'January', total: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'February', total: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'March', total: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'April', total: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'June', total: Math.floor(Math.random() * 5000) + 1000 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
};


export default function ReportsPage() {
  const { locale } = useLocale();
  const { patients } = useClinicContext();

  const statusData = patients.reduce((acc, patient) => {
    const status = patient.currentStatus;
    const existing = acc.find(item => item.name === status);
    if(existing) {
        existing.value += 1;
    } else {
        acc.push({ name: status, value: 1 });
    }
    return acc;
  }, [] as { name: Patient['currentStatus'], value: number }[]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const statusTranslations: { [key in Patient['currentStatus']]: { en: string, ar: string } } = {
    'Active Treatment': { en: 'Active Treatment', ar: 'علاج فعال' },
    'Final Phase': { en: 'Final Phase', ar: 'المرحلة النهائية' },
    'Retention Phase': { en: 'Retention Phase', ar: 'مرحلة التثبيت' },
    'Completed': { en: 'Completed', ar: 'مكتمل' }
  };


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
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
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
                <CardTitle>{locale === 'ar' ? 'الإيرادات الشهرية (نموذج)' : 'Monthly Revenue (Sample)'}</CardTitle>
                <CardDescription>{locale === 'ar' ? 'يناير - يونيو 2024' : 'January - June 2024'}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="total" fill="var(--color-desktop)" radius={4} />
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
                        {statusTranslations[item.name][locale]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">{item.value}</TableCell>
                  <TableCell className="text-center">{((item.value / patients.length) * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
