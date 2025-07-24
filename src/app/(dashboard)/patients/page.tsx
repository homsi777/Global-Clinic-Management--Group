'use client';

import React, { useState } from 'react';
import { useClinicContext } from '@/components/app-provider';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import PatientCard from '@/components/dashboard/patient-card';
import AddEditPatientSheet from '@/components/dashboard/add-edit-patient-sheet';

export default function PatientsPage() {
  const { patients } = useClinicContext();
  const { locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {locale === 'ar' ? 'سجلات المرضى' : 'Patient Records'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'عرض وإدارة جميع سجلات المرضى.' : 'View and manage all patient records.'}
            </p>
          </div>
          <Button onClick={() => setIsSheetOpen(true)}>
            <PlusCircle className="mr-2" />
            {locale === 'ar' ? 'إضافة مريض جديد' : 'Add New Patient'}
          </Button>
        </header>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input
            placeholder={locale === 'ar' ? 'ابحث بالاسم أو الرقم التعريفي...' : 'Search by name or ID...'}
            className="pl-10 rtl:pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient._id} patient={patient} />
          ))}
        </div>
        {filteredPatients.length === 0 && (
            <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">{locale === 'ar' ? 'لم يتم العثور على مرضى.' : 'No patients found.'}</p>
            </div>
        )}
      </div>
      <AddEditPatientSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
