'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import type { Invoice } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClinicContext } from '@/components/app-provider';
import { Calendar as CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


const invoiceItemSchema = z.object({
  serviceName: z.string().min(1, 'Service name is required.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  unitPrice: z.coerce.number().min(0, 'Unit price cannot be negative.'),
  total: z.coerce.number(),
});

const invoiceFormSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient.'),
  invoiceNumber: z.string().optional(),
  date: z.date(),
  dueDate: z.date(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required.'),
  discount: z.coerce.number().min(0).optional().default(0),
  tax: z.coerce.number().min(0).optional().default(0),
  status: z.enum(['Pending', 'Paid', 'Partial', 'Canceled']),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface AddEditInvoiceSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invoice?: Invoice;
}

export default function AddEditInvoiceSheet({
  isOpen,
  onOpenChange,
  invoice,
}: AddEditInvoiceSheetProps) {
  const { locale } = useLocale();
  const { toast } = useToast();
  const { patients } = useClinicContext();
  const isEditing = !!invoice;

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      patientId: invoice?.patientId || '',
      invoiceNumber: invoice?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      date: invoice ? new Date(invoice.date) : new Date(),
      dueDate: invoice ? new Date(invoice.dueDate) : new Date(new Date().setDate(new Date().getDate() + 30)),
      items: invoice?.items || [{ serviceName: '', quantity: 1, unitPrice: 0, total: 0 }],
      discount: invoice?.discount || 0,
      tax: invoice?.tax || 0,
      status: invoice?.status || 'Pending',
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchItems = form.watch('items');
  const watchDiscount = form.watch('discount');
  const watchTax = form.watch('tax');

  const subTotal = React.useMemo(() => 
    watchItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0),
    [watchItems]
  );
  
  const totalAmount = React.useMemo(() => {
      const discountedTotal = subTotal - (watchDiscount || 0);
      return discountedTotal + (discountedTotal * (watchTax || 0) / 100);
  }, [subTotal, watchDiscount, watchTax]);

  async function onSubmit(data: InvoiceFormValues) {
    const selectedPatient = patients.find(p => p.patientId === data.patientId);
    if(!selectedPatient) return;
    
    try {
        const invoiceData: Omit<Invoice, '_id'> = {
            ...data,
            date: data.date.getTime(),
            dueDate: data.dueDate.getTime(),
            patientName: selectedPatient.patientName,
            subTotal: subTotal,
            totalAmount: totalAmount,
            paidAmount: 0, // Assume 0 for new invoices
            outstandingAmount: totalAmount,
            recordedBy: 'Admin', // Replace with actual user
        };

        if(isEditing && invoice?._id) {
            await db.invoices.update(invoice._id, invoiceData);
             toast({ title: locale === 'ar' ? 'تم تحديث الفاتورة' : 'Invoice Updated', description: locale === 'ar' ? 'تم تحديث الفاتورة بنجاح.' : 'The invoice has been updated successfully.' });
        } else {
            await db.invoices.add(invoiceData as Invoice);
            toast({ title: locale === 'ar' ? 'تم إنشاء الفاتورة' : 'Invoice Created', description: locale === 'ar' ? 'تم إنشاء الفاتورة الجديدة بنجاح.' : 'The new invoice has been created successfully.' });
        }
        form.reset();
        onOpenChange(false);
    } catch (error) {
        console.error("Failed to save invoice:", error);
         toast({ variant: 'destructive', title: locale === 'ar' ? 'حدث خطأ' : 'An error occurred', description: locale === 'ar' ? 'فشل حفظ الفاتورة. الرجاء المحاولة مرة أخرى.' : 'Failed to save the invoice. Please try again.' });
    }
  }
  
  const title = isEditing ? (locale === 'ar' ? 'تعديل فاتورة' : 'Edit Invoice') : (locale === 'ar' ? 'إنشاء فاتورة جديدة' : 'Create New Invoice');

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{locale === 'ar' ? 'أملأ تفاصيل الفاتورة أدناه.' : 'Fill out the invoice details below.'}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{locale === 'ar' ? 'الحالة' : 'Status'}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Pending">{locale === 'ar' ? 'معلقة' : 'Pending'}</SelectItem>
                                    <SelectItem value="Paid">{locale === 'ar' ? 'مدفوعة' : 'Paid'}</SelectItem>
                                    <SelectItem value="Partial">{locale === 'ar' ? 'مدفوعة جزئياً' : 'Partial'}</SelectItem>
                                    <SelectItem value="Canceled">{locale === 'ar' ? 'ملغاة' : 'Canceled'}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="date" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>{locale === 'ar' ? 'تاريخ الفاتورة' : 'Invoice Date'}</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild><FormControl>
                                    <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
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
                    <FormField control={form.control} name="dueDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>{locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild><FormControl>
                                    <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
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
                </div>
                
                <div className="space-y-4">
                    <Label className='text-lg font-semibold'>{locale === 'ar' ? 'بنود الفاتورة' : 'Invoice Items'}</Label>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-md">
                           <div className='col-span-5'>
                               <Label className="text-xs">{locale === 'ar' ? 'الخدمة' : 'Service'}</Label>
                               <Input {...form.register(`items.${index}.serviceName`)} placeholder={locale === 'ar' ? 'اسم الخدمة' : 'Service Name'}/>
                           </div>
                           <div className='col-span-2'>
                               <Label className="text-xs">{locale === 'ar' ? 'الكمية' : 'Qty'}</Label>
                               <Input type="number" {...form.register(`items.${index}.quantity`)} placeholder="1"/>
                           </div>
                           <div className='col-span-2'>
                               <Label className="text-xs">{locale === 'ar' ? 'السعر' : 'Price'}</Label>
                               <Input type="number" {...form.register(`items.${index}.unitPrice`)} placeholder="0.00"/>
                           </div>
                           <div className='col-span-2'>
                                <Label className="text-xs">{locale === 'ar' ? 'الإجمالي' : 'Total'}</Label>
                                <p className='font-medium h-10 flex items-center'>{`SYP ${(watchItems[index]?.quantity * watchItems[index]?.unitPrice || 0).toFixed(2)}`}</p>
                           </div>
                           <div className='col-span-1'>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                           </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ serviceName: '', quantity: 1, unitPrice: 0, total: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {locale === 'ar' ? 'إضافة بند' : 'Add Item'}
                    </Button>
                </div>
                
                <div className="flex justify-end">
                    <div className="w-full max-w-sm space-y-4">
                        <div className="flex justify-between">
                            <Label>{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</Label>
                            <span>SYP {subTotal.toFixed(2)}</span>
                        </div>
                         <FormField control={form.control} name="discount" render={({ field }) => (
                            <FormItem className="flex justify-between items-center">
                                <FormLabel>{locale === 'ar' ? 'الخصم' : 'Discount'}</FormLabel>
                                <FormControl><Input type="number" className="w-24" placeholder="0.00" {...field} /></FormControl>
                            </FormItem>
                         )} />
                        <FormField control={form.control} name="tax" render={({ field }) => (
                            <FormItem className="flex justify-between items-center">
                                <FormLabel>{locale === 'ar' ? 'الضريبة (%)' : 'Tax (%)'}</FormLabel>
                                <FormControl><Input type="number" className="w-24" placeholder="0" {...field} /></FormControl>
                            </FormItem>
                        )} />
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <Label>{locale === 'ar' ? 'الإجمالي الكلي' : 'Total Amount'}</Label>
                            <span>SYP {totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="button" variant="outline">{locale === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                    </SheetClose>
                    <Button type="submit">{locale === 'ar' ? 'حفظ الفاتورة' : 'Save Invoice'}</Button>
                </SheetFooter>
            </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
