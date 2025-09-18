import apiClient from './api';
import type { PlannedTreatment } from '@/types';

export const getPlannedTreatments = (patientId: string) => {
  return apiClient.get<PlannedTreatment[]>(`/planned-treatments/patient/${patientId}`);
};

export const createPlannedTreatment = (data: any) => {
  return apiClient.post<PlannedTreatment>('/planned-treatments', data);
};

export const deletePlannedTreatment = (id: string) => {
  return apiClient.delete(`/planned-treatments/${id}`);
};