import apiClient from './api';
import type { ToothSurfaceState } from '@/types';

export const getOdontogram = (patientId: string) => {
  return apiClient.get(`/patients/${patientId}/odontogram`);
};

export const updateOdontogram = (patientId: string, updates: any) => {
  return apiClient.patch(`/patients/${patientId}/odontogram`, { updates });
};