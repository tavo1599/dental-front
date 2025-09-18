import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { getDailySummary } from '@/services/cashManagementService';
import type { DailySummary } from '@/types';

export const useCashManagementStore = defineStore('cashManagement', () => {
  const toast = useToast();
  const summary = ref<DailySummary | null>(null);
  const isLoading = ref(false);

  async function fetchDailySummary(date: string) {
    isLoading.value = true;
    summary.value = null; // Limpiamos el resumen anterior
    try {
      const response = await getDailySummary(date);
      summary.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar el resumen de caja.');
    } finally {
      isLoading.value = false;
    }
  }

  return { summary, isLoading, fetchDailySummary };
});