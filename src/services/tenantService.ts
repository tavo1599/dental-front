import apiClient from './api';

export const uploadLogo = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post('/tenants/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};