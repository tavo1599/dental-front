import apiClient from './api';
import type { Payment } from '@/types';

export const getPaymentsForBudget = (budgetId: string) => {
  return apiClient.get<Payment[]>(`/budgets/${budgetId}/payments`);
};

export const createPayment = (budgetId: string, data: any) => {
  return apiClient.post(`/budgets/${budgetId}/payments`, data);
};