
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
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface AddEditPatientSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patient?: Patient;
}

const patientFormSchema = z.object({
    patientName: z.string().min(3, { message: 'Name must be at least 3 characters.'}),
    patientId: z.string().optional(),
    dateOfBirth: z.date(),
    phone: z.string().min(9, { message: 'Phone number is required.' }),
    email: z.string().email({ message: 'Invalid email address.'}).optional().or(z.literal('')),
    address: z.string().optional(),
    chiefComplaint: z.string().optional(),
})

type PatientFormValues = z.infer<typeof patientFormSchema>;


export default function AddEditPatientSheet({
  isOpen,
  onOpenChange,
  patient,
}: AddEditPatientSheetProps) {
  const { locale } = useLocale();
  const { rooms, addOrUpdatePatient } = useClinicContext();
  const isEditing = !!patient;

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: isEditing ? {
        ...patient,
        dateOfBirth: new Date(patient.dateOfBirth),
    } : {
        patientName: '',
        phone: '',
        email: '',
        address: '',
        chiefComplaint: '',
        dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - 20)),
    },
  });

  useEffect(() => {
    if (isOpen) {
        form.reset(isEditing ? {
            ...patient,
            dateOfBirth: new Date(patient!.dateOfBirth),
        } : {
            patientName: '',
            phone: '',
            email: '',
            address: '',
            chiefComplaint: '',
            dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - 20)),
        });
    }
  }, [isOpen, isEditing, patient, form]);


  const handleSubmit = async (data: PatientFormValues) => {
    const patientDataToSave: Partial<Patient> = {
        ...data,
        dateOfBirth: data.dateOfBirth.toISOString(),
    };
    
    if(isEditing) {
        patientDataToSave._id = patient._id;
        patientDataToSave.patientId = patient.patientId;
    }

    await addOrUpdatePatient(patientDataToSave);
    onOpenChange(false);
  }

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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <SheetHeader>
                <SheetTitle>{title}</SheetTitle>
                <SheetDescription>{description}</SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-6">
                    <FormField control={form.control} name="patientName" render={({field}) => (
                        <FormItem>
                            <FormLabel>{locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}</FormLabel>
                            <FormControl><Input {...field} placeholder={locale === 'ar' ? 'مثال: أحمد العلي' : 'e.g., John Doe'} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="dateOfBirth" render={({field}) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>{locale === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && 'text-muted-foreground')}>
                                            {field.value ? format(field.value, 'PPP') : <span>{locale === 'ar' ? 'اختر تاريخ' : 'Pick a date'}</span>}
                                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1930} toYear={new Date().getFullYear()} initialFocus/>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({field}) => (
                        <FormItem>
                            <FormLabel>{locale === 'ar' ? 'الهاتف' : 'Phone'}</FormLabel>
                            <FormControl><Input {...field} placeholder="+963 912 345 678" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="email" render={({field}) => (
                        <FormItem>
                            <FormLabel>{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</FormLabel>
                            <FormControl><Input {...field} type="email" placeholder="user@example.com" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({field}) => (
                        <FormItem>
                            <FormLabel>{locale === 'ar' ? 'العنوان' : 'Address'}</FormLabel>
                            <FormControl><Input {...field} placeholder={locale === 'ar' ? 'مثال: دمشق، المزة' : 'e.g., Damascus, Mezzeh'} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="chiefComplaint" render={({field}) => (
                        <FormItem>
                            <FormLabel>{locale === 'ar' ? 'الشكوى الرئيسية' : 'Chief Complaint'}</FormLabel>
                            <FormControl><Textarea {...field} placeholder={locale === 'ar' ? 'اكتب شكوى المريض هنا...' : 'Type patient complaint here...'} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                   
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
            </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
