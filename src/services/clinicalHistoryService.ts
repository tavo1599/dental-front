import apiClient from './api';
import type { ClinicalHistoryEntry } from '@/types';

export const getClinicalHistory = (patientId: string) => {
  return apiClient.get<ClinicalHistoryEntry[]>(`/patients/${patientId}/history`);
};

export const createClinicalHistoryEntry = (patientId: string, data: any) => {
  return apiClient.post(`/patients/${patientId}/history`, data);
};