import apiClient from './api';
import type { ConsentTemplate } from '@/types';

export const getConsentTemplates = () => {
  return apiClient.get<ConsentTemplate[]>('/consent-templates');
};

export const generateConsent = (templateId: string, patientId: string) => {
  return apiClient.post<string>('/consent-templates/generate', { templateId, patientId });
};

// Asegúrate de que esta función apunte a la ruta correcta
export const createConsentTemplate = (data: Partial<ConsentTemplate>) => {
  return apiClient.post<ConsentTemplate>('/consent-templates/clinic-template', data);
};

export const updateConsentTemplate = (id: string, data: Partial<ConsentTemplate>) => {
  return apiClient.patch<ConsentTemplate>(`/consent-templates/${id}`, data);
};

export const deleteConsentTemplate = (id: string) => {
  return apiClient.delete(`/consent-templates/${id}`);
};