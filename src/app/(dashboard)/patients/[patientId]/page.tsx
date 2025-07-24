'use client';

import { useClinicContext } from '@/components/app-provider';
import { useLocale } from '@/components/locale-provider';
import { useRouter, useParams } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, FileText, BriefcaseMedical, TrendingUp, AlertTriangle, Award, DoorOpen, PlusCircle, DollarSign, Activity, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Patient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinancialsTable from '@/components/dashboard/financials-table';
import AddNewPaymentForm from '@/components/dashboard/add-new-payment-form';


export default function PatientDetailPage() {
  const { getPatientById, appointments, transactions } = useClinicContext();
  const { locale } = useLocale();
  const router = useRouter();
  const params = useParams();
  const patientId = typeof params.patientId === 'string' ? params.patientId : '';

  const patient = getPatientById(patientId);
  
  const patientTransactions = transactions.filter(tx => tx.patientId === patientId);


  const statusTranslations: { [key in Patient['currentStatus']]: { en: string, ar: string } } = {
    'Active Treatment': { en: 'Active Treatment', ar: 'علاج فعال' },
    'Final Phase': { en: 'Final Phase', ar: 'المرحلة النهائية' },
    'Retention Phase': { en: 'Retention Phase', ar: 'مرحلة التثبيت' },
    'Completed': { en: 'Completed', ar: 'مكتمل' }
  };

  const patientAppointment = appointments.find(
    (apt) => apt.patientId === patient?.patientId && apt.status === 'InRoom'
  );

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{locale === 'ar' ? 'المريض غير موجود.' : 'Patient not found.'}</p>
      </div>
    );
  }
  
  const currentStatusText = statusTranslations[patient.currentStatus][locale];
  const progressValue = (patient.completedSessions / patient.totalSessions) * 100;
  
  const totalPaid = patientTransactions
    .filter(tx => tx.type === 'Payment')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalCharges = patientTransactions
    .filter(tx => tx.type === 'Charge')
    .reduce((sum, tx) => sum + tx.amount, 0);


  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className={cn(locale === 'ar' && 'transform rotate-180')} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{patient.patientName}</h1>
          <p className="text-muted-foreground">{patient.patientId}</p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
               <Avatar className="h-16 w-16">
                <AvatarImage src={patient.avatarUrl} alt={patient.patientName} data-ai-hint="person portrait" />
                <AvatarFallback>{patient.patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className='w-full'>
                <CardTitle className="text-xl">{patient.patientName}</CardTitle>
                <div className="flex justify-between items-center mt-1">
                    <CardDescription>{patient.patientId}</CardDescription>
                    <Button variant="ghost" size="sm"><Edit className="h-4 w-4 mr-2" /> {locale === 'ar' ? 'تعديل' : 'Edit'}</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                {patientAppointment && (
                    <div className="mb-4 p-3 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-500/50 flex items-center gap-3">
                        <DoorOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-blue-800 dark:text-blue-200">
                            {locale === 'ar' ? `حالياً في الغرفة: ${patientAppointment.assignedRoomNumber}` : `Currently in Room: ${patientAppointment.assignedRoomNumber}`}
                        </span>
                    </div>
                )}
                <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> <span>{patient.phone}</span></div>
                    <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> <span>{patient.email}</span></div>
                    <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> <span>{patient.address}</span></div>
                    <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-primary" /> <span>{locale === 'ar' ? 'تاريخ الميلاد: ' : 'DOB: '} {new Date(patient.dateOfBirth).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span></div>
                </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BriefcaseMedical className="h-5 w-5 text-primary" /> {locale === 'ar' ? 'الشكوى الرئيسية' : 'Chief Complaint'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{patient.chiefComplaint}</p>
                </CardContent>
            </Card>
        </div>
      </div>

      <Tabs defaultValue="treatment-status">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="treatment-status">{locale === 'ar' ? 'الحالة العلاجية' : 'Treatment Status'}</TabsTrigger>
            <TabsTrigger value="financials">{locale === 'ar' ? 'المالية' : 'Financials'}</TabsTrigger>
        </TabsList>
        <TabsContent value="treatment-status" className='mt-6'>
            <Card>
                <CardHeader>
                    <CardTitle>{locale === 'ar' ? 'تفاصيل حالة العلاج' : 'Treatment Status Details'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium">{locale === 'ar' ? 'تقدم العلاج' : 'Progress'}</span>
                            <span className="text-muted-foreground">{patient.completedSessions} / {patient.totalSessions} {locale === 'ar' ? 'جلسة' : 'Sessions'}</span>
                        </div>
                        <Progress value={progressValue} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                            <TrendingUp className="h-6 w-6 text-primary" />
                            <div>
                                <div className="text-muted-foreground">{locale === 'ar' ? 'الحالة الحالية' : 'Current Status'}</div>
                                <div className="font-semibold text-lg">{currentStatusText}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                            <Calendar className="h-6 w-6 text-primary" />
                            <div>
                                <div className="text-muted-foreground">{locale === 'ar' ? 'تاريخ البدء' : 'Start Date'}</div>
                                <div className="font-semibold text-lg">{new Date(patient.startDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="financials" className='mt-6'>
            <div className="flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{locale === 'ar' ? 'إجمالي الرسوم' : 'Total Charges'}</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{locale === 'ar' ? `${totalCharges.toFixed(2)} ل.س` : `SYP ${totalCharges.toFixed(2)}`}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{locale === 'ar' ? 'إجمالي المدفوع' : 'Total Paid'}</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{locale === 'ar' ? `${totalPaid.toFixed(2)} ل.س` : `SYP ${totalPaid.toFixed(2)}`}</div>
                        </CardContent>
                    </Card>
                    <Card className={cn(patient.outstandingBalance > 0 ? 'border-destructive' : 'border-green-500')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{locale === 'ar' ? 'الرصيد المستحق' : 'Outstanding Balance'}</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={cn("text-2xl font-bold", patient.outstandingBalance > 0 ? 'text-destructive' : 'text-green-600')}>
                                {locale === 'ar' ? `${patient.outstandingBalance.toFixed(2)} ل.س` : `SYP ${patient.outstandingBalance.toFixed(2)}`}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <FinancialsTable transactions={patientTransactions} />
                    <AddNewPaymentForm />
                </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
