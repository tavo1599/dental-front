import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { getDashboardSummary, getMonthlyRevenue, getAppointmentStatusSummary } from '@/services/dashboardService';

export const useDashboardStore = defineStore('dashboard', () => {
  const toast = useToast();
  const summary = ref<any>({});
  const monthlyRevenueChartData = ref<{ labels: string[], data: number[] }>({ labels: [], data: [] });
  const appointmentStatusChartData = ref<{ labels: string[], data: number[] }>({ labels: [], data: [] }); // <-- Nuevo estado
  const isLoading = ref(false);

  async function fetchSummary() {
    isLoading.value = true;
    try {
      // Hacemos las tres llamadas a la API en paralelo para más velocidad
      const [summaryRes, revenueRes, statusRes] = await Promise.all([
        getDashboardSummary(),
        getMonthlyRevenue(),
        getAppointmentStatusSummary()
      ]);

      summary.value = summaryRes.data;
      monthlyRevenueChartData.value = revenueRes.data;
      appointmentStatusChartData.value = statusRes.data; // <-- Guarda los nuevos datos

    } catch (error) {
      toast.error('No se pudo cargar el resumen del dashboard.');
    } finally {
      isLoading.value = false;
    }
  }

  return { summary, monthlyRevenueChartData, appointmentStatusChartData, isLoading, fetchSummary }; // <-- Exporta lo nuevo
});