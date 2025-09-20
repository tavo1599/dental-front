import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import * as service from '@/services/reportsService';

export const useReportsStore = defineStore('reports', () => {
  const toast = useToast();
  const financialReport = ref<any>(null);
  const isLoading = ref(false);

  async function fetchFinancialReport(startDate: string, endDate: string) {
    isLoading.value = true;
    financialReport.value = null;
    try {
      const response = await service.getFinancialReport(startDate, endDate);
      financialReport.value = response.data;
    } catch (error) {
      toast.error('No se pudo generar el reporte.');
    } finally {
      isLoading.value = false;
    }
  }

  return { financialReport, isLoading, fetchFinancialReport };
});