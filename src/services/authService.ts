import apiClient from './api';

export const login = (email: string, password: string) => {
  return apiClient.post('/auth/login', { email, password });
};

export const forgotPassword = (email: string) => {
  return apiClient.post('/auth/forgot-password', { email });
};

export const resetPassword = (token: string, password: string) => {
  return apiClient.post('/auth/reset-password', { token, password });
};