import apiClient from './api';
import type { Cie10Code } from '@/types';

// Para la búsqueda en el historial clínico
export const searchCie10 = (term: string) => {
  return apiClient.get<Cie10Code[]>(`/cie10/search?term=${term}`);
};

// --- NUEVAS FUNCIONES DE GESTIÓN ---
export const getAllCie10 = () => {
  return apiClient.get<Cie10Code[]>('/cie10/search?term='); // Búsqueda vacía trae todos
};

export const createCie10 = (data: Omit<Cie10Code, 'id'>) => {
  return apiClient.post<Cie10Code>('/cie10', data);
};

export const updateCie10 = (id: string, data: Omit<Cie10Code, 'id'>) => {
  return apiClient.patch<Cie10Code>(`/cie10/${id}`, data);
};

export const deleteCie10 = (id: string) => {
  return apiClient.delete(`/cie10/${id}`);
};