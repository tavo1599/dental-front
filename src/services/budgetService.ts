import apiClient from './api';
import type { Budget, Payment } from '@/types';

// Obtiene presupuestos de un paciente
export const getBudgetsForPatient = (patientId: string, doctorId?: string) => {
  const params: any = {};
  
  // Si hay doctor seleccionado y no es 'all', lo añadimos a la consulta
  if (doctorId && doctorId !== 'all') {
    params.doctorId = doctorId;
  }

  // --- CORRECCIÓN: Volvemos a la ruta que tu backend reconoce ---
  return apiClient.get<Budget[]>(`/budgets/patient/${patientId}`, { params });
};

export const createBudget = (data: any) => {
  return apiClient.post<Budget>('/budgets', data);
};

export const getBudgetById = (id: string) => {
  return apiClient.get<Budget>(`/budgets/${id}`);
};

export const updateBudgetDiscount = (id: string, discountAmount: number) => {
  return apiClient.patch(`/budgets/${id}/discount`, { discountAmount });
};

export const deleteBudget = (id: string) => {
  return apiClient.delete(`/budgets/${id}`);
};

// --- PAGOS ---
export const createPayment = (paymentData: any) => {
    return apiClient.post<Payment>('/payments', paymentData);
};

export const getPaymentsByBudget = (budgetId: string) => {
    return apiClient.get<Payment[]>(`/payments/budget/${budgetId}`);
};

export const getPaymentById = (paymentId: string) => {
    return apiClient.get(`/payments/${paymentId}`);
};