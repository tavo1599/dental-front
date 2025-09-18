import apiClient from './api';

export const getDashboardSummary = () => {
  return apiClient.get('/dashboard/summary');
};

export const getMonthlyRevenue = () => {
  return apiClient.get('/dashboard/monthly-revenue');
};

export const getAppointmentStatusSummary = () => {
  return apiClient.get('/dashboard/appointment-status');
};