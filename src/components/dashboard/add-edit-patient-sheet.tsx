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
import { useLocale } from '@/components/locale-provider';
import { Textarea } from '@/components/ui/textarea';
import type { Patient } from '@/lib/types';
import { Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClinicContext } from '@/components/app-provider';
import React from 'react';


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
  const { rooms } = useClinicContext();
  const [date, setDate] = React.useState<Date | undefined>(
    patient ? new Date(patient.dateOfBirth) : undefined
  );
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
  
  const availableRooms = rooms.filter(room => !room.isOccupied);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-6">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right rtl:text-left">
                {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </Label>
                <Input id="name" defaultValue={patient?.patientName} className="col-span-3" placeholder={locale === 'ar' ? 'مثال: أحمد العلي' : 'e.g., John Doe'} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="patientId" className="text-right rtl:text-left">
                {locale === 'ar' ? 'الرقم التعريفي' : 'Patient ID'}
                </Label>
                <Input id="patientId" defaultValue={patient?.patientId} className="col-span-3" placeholder={locale === 'ar' ? 'سيتم إنشاؤه تلقائياً' : 'Auto-generated if empty'} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right rtl:text-left">
                {locale === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={'outline'}
                        className={cn(
                            'col-span-3 justify-start text-left font-normal',
                            !date && 'text-muted-foreground'
                        )}
                        >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : <span>{locale === 'ar' ? 'اختر تاريخ' : 'Pick a date'}</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right rtl:text-left">
                {locale === 'ar' ? 'الهاتف' : 'Phone'}
                </Label>
                <Input id="phone" defaultValue={patient?.phone} className="col-span-3" placeholder="+963 912 345 678" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right rtl:text-left">
                {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input id="email" type="email" defaultValue={patient?.email} className="col-span-3" placeholder="user@example.com"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right rtl:text-left">
                {locale === 'ar' ? 'العنوان' : 'Address'}
                </Label>
                <Input id="address" defaultValue={patient?.address} className="col-span-3" placeholder={locale === 'ar' ? 'مثال: دمشق، المزة' : 'e.g., Damascus, Mezzeh'}/>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="complaint" className="text-right rtl:text-left pt-2">
                {locale === 'ar' ? 'الشكوى الرئيسية' : 'Chief Complaint'}
                </Label>
                <Textarea id="complaint" defaultValue={patient?.chiefComplaint} className="col-span-3" placeholder={locale === 'ar' ? 'اكتب شكوى المريض هنا...' : 'Type patient complaint here...'} />
            </div>

            {!isEditing && (
                <div className="grid grid-cols-4 items-center gap-4 border-t pt-4 mt-4">
                    <Label htmlFor="initialRoom" className="text-right rtl:text-left col-span-4 mb-2 text-base font-semibold">
                        {locale === 'ar' ? 'إجراءات سريعة (اختياري)' : 'Quick Actions (Optional)'}
                    </Label>
                    <Label htmlFor="initialRoom" className="text-right rtl:text-left">
                        {locale === 'ar' ? 'تعيين غرفة' : 'Assign Room'}
                    </Label>
                    <Select>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder={locale === 'ar' ? 'اختر غرفة لإدخال المريض مباشرة' : 'Select room to admit patient'} />
                        </SelectTrigger>
                        <SelectContent>
                            {availableRooms.map(room => (
                                <SelectItem key={room._id} value={room._id.toString()}>
                                    {locale === 'ar' ? `غرفة ${room.roomNumber}` : `Room ${room.roomNumber}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
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
