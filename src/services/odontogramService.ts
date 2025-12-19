import apiClient from './api';
import type { OdontogramData, ToothUpdate, ToothState } from '@/types';
// Importamos el enum para usarlo en los tipos si es necesario
import { OdontogramRecordType } from '@/types';

// Ahora acepta el tipo (Initial/Evolution)
export const getOdontogram = (patientId: string, type: OdontogramRecordType) => {
  // Enviamos ?type=initial o ?type=evolution
  return apiClient.get<OdontogramData>(`/patients/${patientId}/odontogram`, {
    params: { type }
  });
};

// Ahora acepta el recordType en el cuerpo
export const updateOdontogram = (patientId: string, updates: ToothUpdate[], recordType: OdontogramRecordType) => {
  return apiClient.patch<OdontogramData>(`/patients/${patientId}/odontogram`, { 
    updates,
    recordType // <-- Se envía al backend
  });
};

export const saveToothState = (patientId: string, data: any) => {
  return apiClient.post<ToothState>(`/patients/${patientId}/odontogram/state`, data);
};

export const clearToothState = (patientId: string, stateId: string) => {
  return apiClient.delete(`/patients/${patientId}/odontogram/state/${stateId}`);
};

export const saveBridge = (patientId: string, data: any) => {
  return apiClient.post(`/patients/${patientId}/odontogram/bridge`, data);
};

export const deleteBridge = (patientId: string, bridgeId: string) => {
  return apiClient.delete(`/patients/${patientId}/odontogram/bridge/${bridgeId}`);
};