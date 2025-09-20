import apiClient from './api';
import type { PeriodontalMeasurement } from '@/types';

export const getPeriodontogram = (patientId: string) => {
  return apiClient.get<PeriodontalMeasurement[]>(`/patients/${patientId}/periodontogram`);
};

export const updatePeriodontogram = (patientId: string, updates: any[]) => {
  return apiClient.patch(`/patients/${patientId}/periodontogram`, { updates });
};