'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar, DollarSign, CreditCard, Activity } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useClinicContext } from '@/components/app-provider';
import { useLocale } from '@/components/locale-provider';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Patient } from '@/lib/types';

const paymentFormSchema = z.object({
  patientId: z.string().min(1, { message: 'Please select a patient.' }),
  amount: z.coerce.number().min(0.01, { message: 'Amount must be greater than 0.' }),
  description: z.string().min(3, { message: 'Description must be at least 3 characters.' }),
  date: z.date(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface FinancialSummary {
    totalCharges: number;
    totalPaid: number;
    outstandingBalance: number;
}

export default function AddNewPaymentForm() {
  const { patients, transactions } = useClinicContext();
  const { locale } = useLocale();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [financialSummary, setFinancialSummary] = React.useState<FinancialSummary | null>(null);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      patientId: '',
      amount: 0,
      description: '',
      date: new Date(),
    },
  });

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.patientId === patientId);
    if (patient) {
        setSelectedPatient(patient);
        const patientTransactions = transactions.filter(tx => tx.patientId === patientId);
        
        const totalPaid = patientTransactions
            .filter(tx => tx.type === 'Payment')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const totalCharges = patientTransactions
            .filter(tx => tx.type === 'Charge')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const outstandingBalance = totalCharges - totalPaid;
        
        setFinancialSummary({ totalCharges, totalPaid, outstandingBalance });

        form.setValue('patientId', patientId);
        form.setValue('amount', outstandingBalance > 0 ? outstandingBalance : 0);

    } else {
        setSelectedPatient(null);
        setFinancialSummary(null);
    }
  }


  const onSubmit = (data: PaymentFormValues) => {
    // In a real app, you would send this data to your backend to create a transaction.
    console.log(data);
    toast({
        title: locale === 'ar' ? 'تم تسجيل الدفعة بنجاح' : 'Payment Recorded Successfully',
        description: locale === 'ar' ? `تم تسجيل دفعة بقيمة ${data.amount} للمريض المحدد.` : `A payment of ${data.amount} has been recorded for the selected patient.`,
    })
    form.reset();
    setSelectedPatient(null);
    setFinancialSummary(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{locale === 'ar' ? 'تسجيل دفعة جديدة' : 'Record New Payment'}</CardTitle>
        <CardDescription>
          {locale === 'ar'
            ? 'أدخل تفاصيل الدفعة أدناه لإضافتها إلى سجلات المريض المالية.'
            : 'Enter payment details below to add it to the patient\'s financial records.'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{locale === 'ar' ? 'اختر المريض' : 'Select Patient'}</FormLabel>
                  <Select onValueChange={handlePatientChange} defaultValue={field.value}>
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
              )}
            />

            {selectedPatient && (
              <div className='space-y-4'>
                {financialSummary && (
                  <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">{locale === 'ar' ? 'إجمالي الرسوم' : 'Total Charges'}</CardTitle>
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-lg font-bold">{locale === 'ar' ? `${financialSummary.totalCharges.toFixed(2)} ل.س` : `SYP ${financialSummary.totalCharges.toFixed(2)}`}</div>
                          </CardContent>
                      </Card>
                      <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">{locale === 'ar' ? 'إجمالي المدفوع' : 'Total Paid'}</CardTitle>
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-lg font-bold">{locale === 'ar' ? `${financialSummary.totalPaid.toFixed(2)} ل.س` : `SYP ${financialSummary.totalPaid.toFixed(2)}`}</div>
                          </CardContent>
                      </Card>
                      <Card className={cn(financialSummary.outstandingBalance > 0 ? 'border-destructive' : 'border-green-500')}>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">{locale === 'ar' ? 'الرصيد المستحق' : 'Outstanding Balance'}</CardTitle>
                              <Activity className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                              <div className={cn("text-lg font-bold", financialSummary.outstandingBalance > 0 ? 'text-destructive' : 'text-green-600')}>
                                  {locale === 'ar' ? `${financialSummary.outstandingBalance.toFixed(2)} ل.س` : `SYP ${financialSummary.outstandingBalance.toFixed(2)}`}
                              </div>
                          </CardContent>
                      </Card>
                  </div>
                )}
                <div className='border-t pt-4 space-y-6'>
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>{locale === 'ar' ? 'مبلغ الدفعة' : 'Payment Amount'}</FormLabel>
                              <FormControl>
                                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>{locale === 'ar' ? 'الوصف' : 'Description'}</FormLabel>
                              <FormControl>
                                  <Textarea placeholder={locale === 'ar' ? 'مثال: دفعة شهرية...' : 'e.g., Monthly payment...'} {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                    <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{locale === 'ar' ? 'تاريخ الدفعة' : 'Payment Date'}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-[240px] pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>{locale === 'ar' ? 'اختر تاريخ' : 'Pick a date'}</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!selectedPatient}>{locale === 'ar' ? 'تسجيل الدفعة' : 'Record Payment'}</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
