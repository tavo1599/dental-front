import apiClient from './api';
import type { Treatment } from '@/types';

export const getTreatments = () => {
  return apiClient.get<Treatment[]>('/treatments');
};

export const createTreatment = (treatmentData: Omit<Treatment, 'id'>) => {
  return apiClient.post('/treatments', treatmentData);
};

export const updateTreatment = (id: string, treatmentData: Partial<Treatment>) => {
  return apiClient.patch(`/treatments/${id}`, treatmentData);
};

export const deleteTreatment = (id: string) => {
  return apiClient.delete(`/treatments/${id}`);
};