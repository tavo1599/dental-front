import apiClient from './api';
import type { DailySummary } from '@/types';

export const getDailySummary = (date: string) => {
  // Enviamos la fecha como un parámetro de la URL, ej: ?date=2025-08-15
  return apiClient.get<DailySummary>('/cash-management/daily-summary', {
    params: { date }
  });
};