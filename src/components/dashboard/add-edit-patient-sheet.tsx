'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '../locale-provider';
import { Textarea } from '../ui/textarea';
import type { Patient } from '@/lib/types';

interface AddEditPatientSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patient?: Patient; 
}

export default function AddEditPatientSheet({
  isOpen,
  onOpenChange,
  patient,
}: AddEditPatientSheetProps) {
  const { locale } = useLocale();
  const isEditing = !!patient;

  const title = isEditing
    ? locale === 'ar'
      ? 'تعديل بيانات المريض'
      : 'Edit Patient'
    : locale === 'ar'
    ? 'إضافة مريض جديد'
    : 'Add New Patient';

  const description = isEditing
    ? locale === 'ar'
      ? 'قم بتحديث معلومات المريض هنا.'
      : 'Update the patient information here.'
    : locale === 'ar'
    ? 'أدخل تفاصيل المريض الجديد أدناه.'
    : 'Enter the new patient details below.';

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-6">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right rtl:text-left">
              {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
            </Label>
            <Input id="name" defaultValue={patient?.patientName} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="patientId" className="text-right rtl:text-left">
              {locale === 'ar' ? 'الرقم التعريفي' : 'Patient ID'}
            </Label>
            <Input id="patientId" defaultValue={patient?.patientId} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dob" className="text-right rtl:text-left">
              {locale === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}
            </Label>
            <Input id="dob" type="date" defaultValue={patient?.dateOfBirth} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right rtl:text-left">
              {locale === 'ar' ? 'الهاتف' : 'Phone'}
            </Label>
            <Input id="phone" defaultValue={patient?.phone} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right rtl:text-left">
              {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </Label>
            <Input id="email" type="email" defaultValue={patient?.email} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right rtl:text-left">
              {locale === 'ar' ? 'العنوان' : 'Address'}
            </Label>
            <Input id="address" defaultValue={patient?.address} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="complaint" className="text-right rtl:text-left pt-2">
              {locale === 'ar' ? 'الشكوى الرئيسية' : 'Chief Complaint'}
            </Label>
            <Textarea id="complaint" defaultValue={patient?.chiefComplaint} className="col-span-3" />
          </div>
        </div>
        <SheetFooter>
            <SheetClose asChild>
                <Button type="button" variant="outline">
                    {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
            </SheetClose>
            <Button type="submit">
                {locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
