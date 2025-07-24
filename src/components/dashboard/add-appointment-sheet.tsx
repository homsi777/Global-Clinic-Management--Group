'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import type { Appointment } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClinicContext } from '@/components/app-provider';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '../ui/textarea';

const appointmentFormSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient.'),
  date: z.date({ required_error: 'Appointment date is required.' }),
  time: z.string().min(1, 'Appointment time is required.'),
  description: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AddAppointmentSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appointment?: Appointment;
}

export default function AddAppointmentSheet({
  isOpen,
  onOpenChange,
  appointment,
}: AddAppointmentSheetProps) {
  const { locale } = useLocale();
  const { patients, addAppointment } = useClinicContext();
  const isEditing = !!appointment;

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: '',
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
      description: '',
    },
  });

  async function onSubmit(data: AppointmentFormValues) {
    const [hours, minutes] = data.time.split(':').map(Number);
    const queueDateTime = new Date(data.date);
    queueDateTime.setHours(hours, minutes, 0, 0);

    const appointmentData = {
        patientId: data.patientId,
        description: data.description,
        // The queueTime is now being set in the provider, but we could adjust this
    };

    await addAppointment({patientId: data.patientId, description: data.description});
    onOpenChange(false);
    form.reset();
  }

  const title = isEditing
    ? locale === 'ar'
      ? 'تعديل موعد'
      : 'Edit Appointment'
    : locale === 'ar'
    ? 'إضافة موعد جديد'
    : 'Add New Appointment';

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{locale === 'ar' ? 'أدخل تفاصيل الموعد أدناه.' : 'Enter the appointment details below.'}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
                 <FormField control={form.control} name="patientId" render={({field}) => (
                    <FormItem>
                        <FormLabel>{locale === 'ar' ? 'المريض' : 'Patient'}</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={locale === 'ar' ? 'اختر مريضًا...' : 'Select a patient...'} />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {patients.map((patient) => (
                                <SelectItem key={patient._id} value={patient.patientId}>
                                {patient.patientName} ({patient.patientId})
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>{locale === 'ar' ? 'تاريخ الموعد' : 'Appointment Date'}</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild><FormControl>
                                <Button variant="outline" className={cn('pl-3 text-left font-normal',!field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, 'PPP') : <span>{locale === 'ar' ? 'اختر تاريخ' : 'Pick a date'}</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl></PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                 )} />

                 <FormField control={form.control} name="time" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{locale === 'ar' ? 'وقت الموعد' : 'Appointment Time'}</FormLabel>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                                <Input type="time" className="pl-10" {...field} />
                            </FormControl>
                        </div>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({field}) => (
                    <FormItem>
                        <FormLabel>{locale === 'ar' ? 'الوصف (اختياري)' : 'Description (Optional)'}</FormLabel>
                        <FormControl><Textarea {...field} placeholder={locale === 'ar' ? 'مثال: فحص روتيني...' : 'e.g., Routine check-up...'} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="button" variant="outline">
                            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                        </Button>
                    </SheetClose>
                    <Button type="submit">
                        {locale === 'ar' ? 'جدولة الموعد' : 'Schedule Appointment'}
                    </Button>
                </SheetFooter>
            </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
