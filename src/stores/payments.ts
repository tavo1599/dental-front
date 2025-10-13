import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { getPaymentsForBudget, createPayment as createPaymentApi } from '@/services/paymentService';
import type { Payment } from '@/types';

export const usePaymentsStore = defineStore('payments', () => {
  const toast = useToast();
  const payments = ref<Payment[]>([]);
  const isLoading = ref(false);

  async function fetchPayments(budgetId: string) {
    isLoading.value = true;
    try {
      // Llama a la función correcta
      const response = await getPaymentsForBudget(budgetId);
      payments.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar el historial de pagos.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createPayment(budgetId: string, data: any) {
    isLoading.value = true;
    try {
      await createPaymentApi({ ...data, budgetId });
      toast.success('Pago registrado con éxito.');
      await fetchPayments(budgetId);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al registrar el pago.';
      toast.error(message);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return { payments, isLoading, fetchPayments, createPayment };
});