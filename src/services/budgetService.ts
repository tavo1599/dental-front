import apiClient from './api';
import type { Budget } from '@/types';

// Ahora solo pide los presupuestos de un paciente, sin más filtros.
export const getBudgetsForPatient = (patientId: string, doctorId?: string) => {
  let url = `/budgets/patient/${patientId}`;
  if (doctorId) {
    url += `?doctorId=${doctorId}`;
  }
  return apiClient.get<Budget[]>(url);
};

export const createBudget = (data: any) => {
  return apiClient.post('/budgets', data);
};

export const getBudgetById = (id: string) => {
  return apiClient.get<Budget>(`/budgets/${id}`);
};

// Actualiza (o establece) el descuento fijo de un presupuesto
export const updateBudgetDiscount = (id: string, discountAmount: number) => {
  return apiClient.patch(`/budgets/${id}/discount`, { discountAmount });
};

// Elimina un presupuesto por su id
export const deleteBudget = (id: string) => {
  return apiClient.delete(`/budgets/${id}`);
};