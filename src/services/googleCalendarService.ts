import apiClient from './api';

export const getGoogleCalendarStatus = () => {
  return apiClient.get('/google-calendar/status');
};

export const unlinkGoogleCalendar = () => {
  return apiClient.delete('/google-calendar/integration');
};