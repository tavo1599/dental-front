import apiClient from './api';
import type { Budget } from '@/types';

export const getBudgetsForPatient = (patientId: string) => {
  return apiClient.get<Budget[]>(`/patients/${patientId}/budgets`);
};

// --- AÑADE ESTA FUNCIÓN ---
export const createBudget = (data: { patientId: string; items: any[] }) => {
  return apiClient.post('/budgets', data);
};

export const getBudgetById = (id: string) => {
  return apiClient.get<Budget>(`/budgets/${id}`);
};