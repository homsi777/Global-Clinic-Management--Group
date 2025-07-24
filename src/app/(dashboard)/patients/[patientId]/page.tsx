'use client';

import { useClinicContext } from '@/components/app-provider';
import { useLocale } from '@/components/locale-provider';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, FileText, BriefcaseMedical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Patient } from '@/lib/types';


export default function PatientDetailPage({ params }: { params: { patientId: string } }) {
  const { getPatientById } = useClinicContext();
  const { locale } = useLocale();
  const router = useRouter();

  const patient = getPatientById(params.patientId);

    const statusTranslations: { [key in Patient['currentStatus']]: { en: string, ar: string } } = {
    'Active Treatment': { en: 'Active Treatment', ar: 'علاج فعال' },
    'Final Phase': { en: 'Final Phase', ar: 'المرحلة النهائية' },
    'Retention Phase': { en: 'Retention Phase', ar: 'مرحلة التثبيت' },
  };

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{locale === 'ar' ? 'المريض غير موجود.' : 'Patient not found.'}</p>
      </div>
    );
  }
  
  const currentStatusText = statusTranslations[patient.currentStatus][locale];
  const progressValue = (patient.completedSessions / patient.totalSessions) * 100;


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
        {/* Left Column - Patient Info & Status */}
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
                <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> <span>{patient.phone}</span></div>
                    <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> <span>{patient.email}</span></div>
                    <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> <span>{patient.address}</span></div>
                    <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-primary" /> <span>{locale === 'ar' ? 'تاريخ الميلاد: ' : 'DOB: '} {new Date(patient.dateOfBirth).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span></div>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BriefcaseMedical className="h-5 w-5 text-primary" /> {locale === 'ar' ? 'الحالة العلاجية' : 'Treatment Status'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-medium">{locale === 'ar' ? 'تقدم العلاج' : 'Progress'}</span>
                        <span className="text-muted-foreground">{patient.completedSessions} / {patient.totalSessions} {locale === 'ar' ? 'جلسة' : 'Sessions'}</span>
                    </div>
                    <Progress value={progressValue} />
                </div>
                <div className="text-sm">
                    <p><span className="font-medium text-muted-foreground">{locale === 'ar' ? 'الحالة: ' : 'Status: '}</span>{currentStatusText}</p>
                    <p><span className="font-medium text-muted-foreground">{locale === 'ar' ? 'تاريخ البدء: ' : 'Start Date: '}</span>{new Date(patient.startDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</p>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Visit History & Notes */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="flex-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> {locale === 'ar' ? 'الشكوى الرئيسية و سجل الزيارات' : 'Chief Complaint & Visit History'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 p-4 bg-secondary rounded-lg">
                        <h4 className="font-semibold mb-2">{locale === 'ar' ? 'الشكوى الرئيسية' : 'Chief Complaint'}</h4>
                        <p className="text-sm text-muted-foreground">{patient.chiefComplaint}</p>
                    </div>
                    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-16">
                        <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            {locale === 'ar' ? 'سجل الزيارات قيد الإنشاء' : 'Visit History is Under Construction'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {locale === 'ar' ? 'تحقق مرة أخرى في وقت لاحق للحصول على التحديثات.' : 'Check back later for updates.'}
                        </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
