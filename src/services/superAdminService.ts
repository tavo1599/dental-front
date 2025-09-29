import apiClient from './api';
import type { Tenant, TenantStatus } from '@/types';

export const getTenants = () => {
  return apiClient.get<Tenant[]>('/super-admin/tenants');
};

export const createTenant = (data: any) => {
  return apiClient.post('/super-admin/tenants', data);
};

// --- AÑADE ESTA FUNCIÓN ---
export const updateTenantStatus = (tenantId: string, status: TenantStatus) => {
  return apiClient.patch(`/super-admin/tenants/${tenantId}/status`, { status });
};

export const getTenantGrowth = () => {
  return apiClient.get('/super-admin/analytics/tenant-growth');
};

export const impersonateUser = (userId: string) => {
  return apiClient.post<{ access_token: string }>(`/super-admin/impersonate/${userId}`);
};

// --- AÑADE ESTAS DOS FUNCIONES ---
export const postAnnouncement = (message: string) => {
  return apiClient.post('/super-admin/announcement', { message });
};

export const clearAnnouncement = () => {
  return apiClient.delete('/super-admin/announcement');
};

export const getSystemKpis = () => {
  return apiClient.get('/super-admin/analytics/kpis');
};

export const getActiveAnnouncement = () => {
  return apiClient.get('/announcements/active');
};

export const updateTenantPlan = (tenantId: string, data: { plan: string; maxUsers: number }) => {
  return apiClient.patch(`/super-admin/tenants/${tenantId}/plan`, data);
};

export const renewSubscription = (tenantId: string) => {
  return apiClient.patch(`/super-admin/tenants/${tenantId}/renew`);
};