import apiClient from './api';

export const getFinancialReport = (startDate: string, endDate: string) => {
  return apiClient.get('/reports/financial', {
    params: { startDate, endDate }
  });
};