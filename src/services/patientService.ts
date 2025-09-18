// src/services/patientService.ts
import apiClient from './api';
import type { Patient } from '@/types';

export const getPatients = () => {
  return apiClient.get<Patient[]>('/patients');
};

export const createPatient = (patientData: Omit<Patient, 'id'>) => {
  return apiClient.post('/patients', patientData);
};

export const updatePatient = (id: string, patientData: Partial<Patient>) => {
  return apiClient.patch(`/patients/${id}`, patientData);
};

export const getPatientById = (id: string) => {
  return apiClient.get<Patient>(`/patients/${id}`);
};

export const lookupDni = (dni: string) => {
  return apiClient.get<{ fullName: string }>(`/utils/dni/${dni}`);
};