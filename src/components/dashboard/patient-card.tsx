'use client';

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { useLocale } from '../locale-provider';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface PatientCardProps {
  patient: Patient;
}

export default function PatientCard({ patient }: PatientCardProps) {
  const { locale } = useLocale();

  const progressValue = (patient.completedSessions / patient.totalSessions) * 100;
  
  const statusColors: { [key in Patient['currentStatus']]: string } = {
    'Active Treatment': 'border-l-4 border-l-yellow-500',
    'Final Phase': 'border-l-4 border-l-blue-500',
    'Retention Phase': 'border-l-4 border-l-green-500',
  };

  const statusTranslations: { [key in Patient['currentStatus']]: { en: string, ar: string } } = {
    'Active Treatment': { en: 'Active Treatment', ar: 'علاج فعال' },
    'Final Phase': { en: 'Final Phase', ar: 'المرحلة النهائية' },
    'Retention Phase': { en: 'Retention Phase', ar: 'مرحلة التثبيت' },
  };

  const currentStatusText = statusTranslations[patient.currentStatus][locale];


  return (
    <Link href={`/patients/${patient.patientId}`} className="group">
        <Card className={cn("flex flex-col h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1", statusColors[patient.currentStatus])}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar className="h-12 w-12">
                <AvatarImage src={patient.avatarUrl} alt={patient.patientName} data-ai-hint="person portrait" />
                <AvatarFallback>{patient.patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="w-full overflow-hidden">
                <CardTitle className="text-base truncate">{patient.patientName}</CardTitle>
                <CardDescription className="truncate">{patient.patientId}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{locale === 'ar' ? 'تقدم الجلسات' : 'Session Progress'}</span>
                        <span>{patient.completedSessions}/{patient.totalSessions}</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground justify-between items-center">
                <span>{currentStatusText}</span>
                <ArrowRight className={cn("h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity", locale === 'ar' && 'transform rotate-180')} />
            </CardFooter>
        </Card>
    </Link>
  );
}
