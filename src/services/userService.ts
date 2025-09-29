import apiClient from './api';
import type { User } from '@/types';

// Obtiene todos los usuarios de la clínica (admin, doctores, asistentes)
export const getUsers = () => {
  return apiClient.get<User[]>('/users'); // Necesitaremos crear este endpoint
};

// Obtiene solo los doctores (ya lo teníamos)
export const getDoctors = () => {
  return apiClient.get<User[]>('/users/doctors');
};

// Crea un nuevo usuario
export const createUser = (data: any) => {
  return apiClient.post<User>('/users', data);
};

// Actualiza un usuario
export const updateUser = (id: string, data: any) => {
  return apiClient.patch<User>(`/users/${id}`, data);
};

export const changePassword = (data: any) => {
  return apiClient.patch('/users/change-password', data);
};