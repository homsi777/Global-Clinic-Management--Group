
'use client';

import PatientQueue from '@/components/dashboard/patient-queue';
import ClinicRooms from '@/components/dashboard/clinic-rooms';
import { useLocale } from '@/components/locale-provider';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { isToday } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, CalendarDays, DoorOpen } from 'lucide-react';

export default function DashboardPage() {
  const { locale } = useLocale();

  const waitingPatientsCount = useLiveQuery(
    () => db.appointments.where('status').equals('Waiting').count(),
    []
  );

  const inRoomPatientsCount = useLiveQuery(
    () => db.appointments.where('status').equals('InRoom').count(),
    []
  );

  const dailyRevenue = useLiveQuery(async () => {
    const todayTransactions = await db.transactions
      .where('type').equals('Payment')
      .toArray();
    return todayTransactions
      .filter(tx => tx.date && isToday(new Date(tx.date)))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, []);

  const dailyAppointmentsCount = useLiveQuery(async () => {
    const todayAppointments = await db.appointments.toArray();
    return todayAppointments
      .filter(apt => apt.queueTime && isToday(new Date(apt.queueTime)))
      .length;
  }, []);


  const summaryCards = [
      {
          title: "المرضى في الانتظار",
          titleEn: "Waiting Patients",
          value: waitingPatientsCount,
          description: "مريض حالياً",
          descriptionEn: "Currently waiting",
          icon: <Users className="h-5 w-5 text-muted-foreground" />
      },
      {
          title: "المرضى في الغرف",
          titleEn: "Patients In-Room",
          value: inRoomPatientsCount,
          description: "مريض حالياً",
          descriptionEn: "Currently in room",
          icon: <DoorOpen className="h-5 w-5 text-muted-foreground" />
      },
      {
          title: "إيرادات اليوم",
          titleEn: "Today's Revenue",
          value: dailyRevenue,
          description: "ل.س",
          descriptionEn: "SYP",
          isCurrency: true,
          icon: <DollarSign className="h-5 w-5 text-muted-foreground" />
      },
      {
          title: "مواعيد اليوم",
          titleEn: "Today's Appointments",
          value: dailyAppointmentsCount,
          description: "موعد مجدول",
          descriptionEn: "Scheduled appointment",
          icon: <CalendarDays className="h-5 w-5 text-muted-foreground" />
      }
  ]

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
            {locale === 'ar' ? 'لوحة تحكم العيادة' : 'Clinic Dashboard'}
        </h1>
        <p className="text-muted-foreground">
            {locale === 'ar' ? 'نظرة شاملة على العمليات اليومية.' : 'A comprehensive overview of daily operations.'}
        </p>
      </header>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card, index) => (
            <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{locale === 'ar' ? card.title : card.titleEn}</CardTitle>
                    {card.icon}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {card.isCurrency ? (card.value?.toFixed(2) ?? '0.00') : (card.value ?? 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {locale === 'ar' ? card.description : card.descriptionEn}
                    </p>
                </CardContent>
            </Card>
          ))}
      </div>

      <ClinicRooms />
      <PatientQueue />
    </div>
  );
}
