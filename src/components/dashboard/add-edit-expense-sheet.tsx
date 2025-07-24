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
import type { Expense } from '@/lib/types';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';


interface AddEditExpenseSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  expense?: Expense;
}

export default function AddEditExpenseSheet({
  isOpen,
  onOpenChange,
  expense,
}: AddEditExpenseSheetProps) {
  const { locale } = useLocale();
  const [date, setDate] = React.useState<Date | undefined>(
    expense ? new Date(expense.date) : new Date()
  );
  const isEditing = !!expense;

  const title = isEditing
    ? locale === 'ar'
      ? 'تعديل مصروف'
      : 'Edit Expense'
    : locale === 'ar'
    ? 'إضافة مصروف جديد'
    : 'Add New Expense';

  const description = isEditing
    ? locale === 'ar'
      ? 'قم بتحديث معلومات المصروف هنا.'
      : 'Update the expense information here.'
    : locale === 'ar'
    ? 'أدخل تفاصيل المصروف الجديد أدناه.'
    : 'Enter the new expense details below.';
  
  const categories = ['Rent', 'Salaries', 'Supplies', 'Utilities', 'Marketing', 'Maintenance', 'Other'];
  
  const categoryTranslations: { [key: string]: { en: string; ar: string } } = {
    'Rent': { en: 'Rent', ar: 'إيجار' },
    'Salaries': { en: 'Salaries', ar: 'رواتب' },
    'Supplies': { en: 'Supplies', ar: 'مستلزمات' },
    'Utilities': { en: 'Utilities', ar: 'خدمات' },
    'Marketing': { en: 'Marketing', ar: 'تسويق' },
    'Maintenance': { en: 'Maintenance', ar: 'صيانة' },
    'Other': { en: 'Other', ar: 'أخرى' },
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-6">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right rtl:text-left">
                    {locale === 'ar' ? 'التاريخ' : 'Date'}
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
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : <span>{locale === 'ar' ? 'اختر تاريخ' : 'Pick a date'}</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right rtl:text-left">
                {locale === 'ar' ? 'الوصف' : 'Description'}
                </Label>
                <Input id="description" defaultValue={expense?.description} className="col-span-3" placeholder={locale === 'ar' ? 'مثال: فاتورة كهرباء' : 'e.g., Electricity Bill'} />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right rtl:text-left">
                {locale === 'ar' ? 'المبلغ' : 'Amount'}
                </Label>
                <Input id="amount" type="number" defaultValue={expense?.amount} className="col-span-3" placeholder="0.00" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right rtl:text-left">
                {locale === 'ar' ? 'الفئة' : 'Category'}
                </Label>
                 <Select defaultValue={expense?.category}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={locale === 'ar' ? 'اختر فئة' : 'Select a category'} />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                                {categoryTranslations[cat][locale] || cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recordedBy" className="text-right rtl:text-left">
                {locale === 'ar' ? 'سجل بواسطة' : 'Recorded By'}
                </Label>
                <Input id="recordedBy" defaultValue={expense?.recordedBy} className="col-span-3" placeholder={locale === 'ar' ? 'اسم المستخدم' : 'Username'} />
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
