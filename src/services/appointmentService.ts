import apiClient from './api';
import type { Appointment } from '@/types';
import type { AppointmentStatus } from '@/types';

export const getAppointments = () => {
  return apiClient.get<Appointment[]>('/appointments');
};

export const createAppointment = (data: any) => {
  return apiClient.post('/appointments', data);
};

// --- FUNCIÓN CORREGIDA ---
// Añadimos '?' para indicar que endTime es opcional
export const updateAppointmentTime = (id: string, data: { startTime: string; endTime?: string }) => {
  return apiClient.patch(`/appointments/${id}/time`, data);
};
// --- FIN DE LA CORRECCIÓN ---

export const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
  return apiClient.patch(`/appointments/${id}/status`, { status });
};

export const getAppointmentsForPatient = (patientId: string) => {
  return apiClient.get<Appointment[]>(`/appointments/patient/${patientId}`);
};

export const getNextDayPending = () => {
  return apiClient.get<Appointment[]>('/appointments/pending/next-day');
};

export const deleteAppointment = (id: string) => {
  return apiClient.delete(`/appointments/${id}`);
};