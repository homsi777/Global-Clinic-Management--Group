
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useClinicContext } from '../app-provider';
import { useToast } from '@/hooks/use-toast';


interface PatientCardProps {
  patient: Patient;
}

export default function PatientCard({ patient }: PatientCardProps) {
  const { locale } = useLocale();
  const router = useRouter();
  const { deletePatient } = useClinicContext();
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

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
    e.preventDefault();
  };

  const handleDelete = async () => {
    try {
        await deletePatient(patient.patientId);
        toast({
            title: locale === 'ar' ? 'تم حذف المريض' : 'Patient Deleted',
            description: locale === 'ar' ? `تم حذف سجل ${patient.patientName} بنجاح.` : `The record for ${patient.patientName} has been deleted.`,
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: locale === 'ar' ? 'خطأ في الحذف' : 'Deletion Error',
            description: locale === 'ar' ? 'فشل حذف سجل المريض.' : 'Failed to delete the patient record.',
        })
    }
  };
  
  const openEditSheet = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsSheetOpen(true);
  }

  const navigateToDetails = (e: React.MouseEvent) => {
      e.preventDefault();
      router.push(`/patients/${patient.patientId}`);
  }

  return (
    <>
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <TooltipProvider>
        <Card className={cn("flex flex-col h-full interactive-element transition-all border-2 group", cardBorderColor)} onClick={navigateToDetails}>
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">{locale === 'ar' ? 'فتح القائمة' : 'Open menu'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onSelect={handleDropdownSelect}>
                    <DropdownMenuItem onClick={navigateToDetails}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>{locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={openEditSheet}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>{locale === 'ar' ? 'تعديل' : 'Edit'}</span>
                    </DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>{locale === 'ar' ? 'حذف' : 'Delete'}</span>
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>

            </CardHeader>
            <CardContent className="flex-grow pt-2 cursor-pointer">
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
            <CardFooter className="text-xs text-muted-foreground justify-between items-center pt-2 cursor-pointer">
                <span>{currentStatusText}</span>
                <ArrowRight className={cn("h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity", locale === 'ar' && 'transform rotate-180')} />
            </CardFooter>
        </Card>
        </TooltipProvider>

        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
            <AlertDialogTitle>{locale === 'ar' ? 'هل أنت متأكد تمامًا؟' : 'Are you absolutely sure?'}</AlertDialogTitle>
            <AlertDialogDescription>
                {locale === 'ar' ? `هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف سجل المريض "${patient.patientName}" بشكل دائم وجميع البيانات المرتبطة به (المواعيد، المعاملات المالية).` : `This action cannot be undone. This will permanently delete the patient record for "${patient.patientName}" and all associated data (appointments, transactions).`}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>{locale === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{locale === 'ar' ? 'نعم، حذف السجل' : 'Yes, delete record'}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <AddEditPatientSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} patient={patient} />
    </>
  );
}
