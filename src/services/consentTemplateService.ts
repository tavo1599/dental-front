import apiClient from './api';
import type { ConsentTemplate } from '@/types';


export const generateConsent = (templateId: string, patientId: string) => {
  // Esperamos recibir el HTML como texto plano
  return apiClient.get<string>(`/consent-templates/${templateId}/generate/${patientId}`, {
    responseType: 'text'
  });
};
// --- FUNCIÓN 'getConsentTemplates' CORREGIDA ---
// Ahora llama a la ruta pública '/consent-templates'
export const getConsentTemplates = () => {
  return apiClient.get<ConsentTemplate[]>('/consent-templates');
};

// Las funciones de gestión siguen apuntando a las rutas del Super Admin
export const createConsentTemplate = (data: Omit<ConsentTemplate, 'id'>) => {
  return apiClient.post<ConsentTemplate>('/super-admin/consent-templates', data);
};

export const updateConsentTemplate = (id: string, data: Omit<ConsentTemplate, 'id'>) => {
  return apiClient.patch<ConsentTemplate>(`/super-admin/consent-templates/${id}`, data);
};

export const deleteConsentTemplate = (id: string) => {
  return apiClient.delete(`/super-admin/consent-templates/${id}`);
};