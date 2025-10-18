import apiClient from './api';
import type { PatientDocument } from '@/types';

// Obtiene todos los documentos de un paciente específico
export const getDocuments = (patientId: string) => {
  return apiClient.get<PatientDocument[]>(`/documents/patient/${patientId}`);
};

export const deleteDocument = (documentId: string) => {
  return apiClient.delete(`/documents/${documentId}`);
};

// Sube un nuevo documento para un paciente
export const uploadDocument = (patientId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post<PatientDocument>(`/documents/upload/${patientId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};