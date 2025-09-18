import apiClient from './api';
import type { Expense } from '@/types';

export const getExpenses = () => {
  return apiClient.get<Expense[]>('/expenses');
};

export const createExpense = (data: Omit<Expense, 'id'>) => {
  return apiClient.post<Expense>('/expenses', data);
};

export const updateExpense = (id: string, data: Partial<Expense>) => {
  return apiClient.patch<Expense>(`/expenses/${id}`, data);
};

export const deleteExpense = (id: string) => {
  return apiClient.delete(`/expenses/${id}`);
};