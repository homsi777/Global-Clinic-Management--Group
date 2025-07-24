'use client';

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useLocale } from '@/components/locale-provider';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, AlertTriangle, CheckCircle2, Award, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AddEditPatientSheet from './add-edit-patient-sheet';


interface PatientCardProps {
  patient: Patient;
}

export default function PatientCard({ patient }: PatientCardProps) {
  const { locale } = useLocale();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const progressPercentage = patient.totalSessions > 0 ? (patient.completedSessions / patient.totalSessions) * 100 : 0;
  
  const hasPaymentDue = patient.outstandingBalance > 0;
  const isNearCompletion = patient.remainingSessions <= 3 && patient.remainingSessions > 0;
  const isTreatmentCompleted = patient.remainingSessions === 0 && patient.totalSessions > 0;

  let cardBorderColor = 'border-border';
  if(hasPaymentDue) cardBorderColor = 'border-destructive/80';
  else if(isNearCompletion) cardBorderColor = 'border-orange-400/80';
  else if(isTreatmentCompleted) cardBorderColor = 'border-green-500/80';

  const statusTranslations: { [key in Patient['currentStatus']]: { en: string, ar: string } } = {
    'Active Treatment': { en: 'Active Treatment', ar: 'علاج فعال' },
    'Final Phase': { en: 'Final Phase', ar: 'المرحلة النهائية' },
    'Retention Phase': { en: 'Retention Phase', ar: 'مرحلة التثبيت' },
    'Completed': { en: 'Completed', ar: 'مكتمل' },
  };

  const currentStatusText = statusTranslations[patient.currentStatus][locale];
  
  const handleDropdownSelect = (e: Event) => {
    e.stopPropagation();
  };

  const handleDelete = () => {
    // In a real app, you'd show a confirmation dialog and then call a function to delete from the DB.
    alert(`Delete action for ${patient.patientName} triggered. This is a placeholder.`);
  }

  return (
    <>
    <TooltipProvider>
    <Card className={cn("flex flex-col h-full interactive-element transition-all border-2 group", cardBorderColor)}>
        <CardHeader className="flex-row items-start gap-4 space-y-0 pb-2">
            <Avatar className="h-12 w-12">
            <AvatarImage src={patient.avatarUrl} alt={patient.patientName} data-ai-hint="person portrait" />
            <AvatarFallback>{patient.patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="w-full overflow-hidden flex-1">
                <CardTitle className="text-base truncate">{patient.patientName}</CardTitle>
                <CardDescription className="truncate">{patient.patientId}</CardDescription>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => e.preventDefault()}>
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">{locale === 'ar' ? 'فتح القائمة' : 'Open menu'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onSelect={handleDropdownSelect}>
                <DropdownMenuItem onClick={() => router.push(`/patients/${patient.patientId}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>{locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSheetOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>{locale === 'ar' ? 'تعديل' : 'Edit'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>{locale === 'ar' ? 'حذف' : 'Delete'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

        </CardHeader>
        <CardContent className="flex-grow pt-2 cursor-pointer" onClick={() => router.push(`/patients/${patient.patientId}`)}>
             <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                {hasPaymentDue && (
                    <Tooltip>
                        <TooltipTrigger><AlertTriangle className="h-5 w-5 text-destructive" /></TooltipTrigger>
                        <TooltipContent><p>{locale === 'ar' ? `عليه ${patient.outstandingBalance} ل.س` : `Due: ${patient.outstandingBalance}`}</p></TooltipContent>
                    </Tooltip>
                )}
                {isNearCompletion && !isTreatmentCompleted && (
                    <Tooltip>
                        <TooltipTrigger><CheckCircle2 className="h-5 w-5 text-orange-400" /></TooltipTrigger>
                        <TooltipContent><p>{locale === 'ar' ? 'قارب على الانتهاء' : 'Near Completion'}</p></TooltipContent>
                    </Tooltip>
                )}
                {isTreatmentCompleted && (
                    <Tooltip>
                        <TooltipTrigger><Award className="h-5 w-5 text-green-500" /></TooltipTrigger>
                        <TooltipContent><p>{locale === 'ar' ? 'العلاج مكتمل' : 'Treatment Completed'}</p></TooltipContent>
                    </Tooltip>
                )}
             </div>
             <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{locale === 'ar' ? 'تقدم الجلسات' : 'Session Progress'}</span>
                    <span>{patient.completedSessions}/{patient.totalSessions}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{locale === 'ar' ? 'الجلسات المتبقية:' : 'Remaining:'} {patient.remainingSessions}</span>
                </div>
            </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground justify-between items-center pt-2 cursor-pointer" onClick={() => router.push(`/patients/${patient.patientId}`)}>
            <span>{currentStatusText}</span>
            <ArrowRight className={cn("h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity", locale === 'ar' && 'transform rotate-180')} />
        </CardFooter>
    </Card>
    </TooltipProvider>
    <AddEditPatientSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} patient={patient} />
    </>
  );
}
