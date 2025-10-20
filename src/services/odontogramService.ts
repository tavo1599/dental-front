import apiClient from './api';
// 1. Importa los tipos correctos
import type { OdontogramData, ToothState, ToothUpdate } from '@/types';

/**
 * Obtiene todos los datos del odontograma (antiguos y nuevos).
 */
export const getOdontogram = (patientId: string) => {
  return apiClient.get<OdontogramData>(`/patients/${patientId}/odontogram`);
};

/**
 * [LEGACY] Actualiza el estado de las superficies o del diente completo (tabla 'tooth').
 */
export const updateOdontogram = (patientId: string, updates: ToothUpdate[]) => {
  return apiClient.patch<OdontogramData>(`/patients/${patientId}/odontogram`, { updates });
};

// --- NUEVAS FUNCIONES PARA EL "TOP BOX" ---
export const saveToothState = (patientId: string, data: Partial<ToothState>) => {
  return apiClient.post<ToothState>(`/patients/${patientId}/odontogram/state`, data);
};
export const clearToothState = (patientId: string, stateId: string) => {
  return apiClient.delete(`/patients/${patientId}/odontogram/state/${stateId}`);
};