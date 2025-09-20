import apiClient from './api';

export const login = (email: string, password: string) => {
  return apiClient.post('/auth/login', { email, password });
};

// --- AÑADE ESTA FUNCIÓN ---
export const getProfile = () => {
  // Llama al endpoint del backend que devuelve la información del usuario del token
  return apiClient.get('/auth/profile');
};
// --- FIN ---

export const forgotPassword = (email: string) => {
  return apiClient.post('/auth/forgot-password', { email });
};

export const resetPassword = (token: string, password: string) => {
  return apiClient.post('/auth/reset-password', { token, password });
};