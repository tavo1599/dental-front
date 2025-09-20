import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { getAuditLogs } from '@/services/auditService';
import type { AuditLog } from '@/types';

export const useAuditStore = defineStore('audit', () => {
  const toast = useToast();
  const logs = ref<AuditLog[]>([]);
  const isLoading = ref(false);

  async function fetchLogs() {
    isLoading.value = true;
    try {
      const response = await getAuditLogs();
      logs.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar el registro de auditoría.');
    } finally {
      isLoading.value = false;
    }
  }

  return { logs, isLoading, fetchLogs };
});