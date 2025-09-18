import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { getPaymentsForBudget, createPayment as createApi } from '@/services/paymentService';
import type { Payment } from '@/types';

export const usePaymentsStore = defineStore('payments', () => {
  const toast = useToast();
  const payments = ref<Payment[]>([]);
  const isLoading = ref(false);

  async function fetchPayments(budgetId: string) {
    isLoading.value = true;
    try {
      const response = await getPaymentsForBudget(budgetId);
      payments.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar la lista de pagos.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createPayment(budgetId: string, data: any) {
    isLoading.value = true;
    try {
      await createApi(budgetId, data);
      toast.success('Pago registrado con éxito.');
      await fetchPayments(budgetId); // Refresca la lista de pagos
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar el pago.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return { payments, isLoading, fetchPayments, createPayment };
});