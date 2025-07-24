import { useState, useEffect } from 'react';
import { useClinicContext } from '@/components/app-provider';
import type { Patient } from '@/lib/types';

export const usePatientData = (patientId: string | null) => {
  const { getPatientById } = useClinicContext();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!patientId) {
      setPatient(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const fetchPatient = () => {
      try {
        const fetchedPatient = getPatientById(patientId);
        setPatient(fetchedPatient || null);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch patient:", err);
        setError(err);
        setPatient(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId, getPatientById]);

  return { patient, isLoading, error };
};
