import apiClient from './api';
import type { Payment } from '@/types';

// Obtiene todos los pagos de un presupuesto
export const getPaymentsForBudget = (budgetId: string) => {
  return apiClient.get<Payment[]>(`/payments/budget/${budgetId}`);
};

// Crea un nuevo pago
export const createPayment = (data: any) => {
  return apiClient.post<Payment>('/payments', data);
};

// Obtiene un pago específico por su ID
export const getPaymentById = (paymentId: string) => {
  return apiClient.get<Payment>(`/payments/${paymentId}`);
};