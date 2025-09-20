import apiClient from './api';
import type { AuditLog } from '@/types';

export const getAuditLogs = () => {
  return apiClient.get<AuditLog[]>('/audit');
};