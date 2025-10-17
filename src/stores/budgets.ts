import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { 
  getBudgetsForPatient, 
  createBudget as createApi, 
  getBudgetById as getByIdApi 
} from '@/services/budgetService';
import type { Budget, Payment } from '@/types';
import { getPaymentById } from '@/services/paymentService';

export const useBudgetsStore = defineStore('budgets', () => {
  const toast = useToast();
  const budgets = ref<Budget[]>([]);
  const selectedBudget = ref<Budget | null>(null);
  const isLoading = ref(false);
  const selectedPayment = ref<Payment | null>(null);

 async function fetchBudgets(patientId: string, doctorId?: string) { // <-- Acepta un 'doctorId' opcional
    isLoading.value = true;
    try {
      // Pasa ambos argumentos al servicio
      const response = await getBudgetsForPatient(patientId, doctorId);
      budgets.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar los presupuestos.');
    } finally {
      isLoading.value = false;
    }
  }

async function createBudget(payload: any) {
    isLoading.value = true;
    try {
      await createApi(payload);
      toast.success('Presupuesto creado con éxito.');
      // Llama a fetchBudgets de forma simple, el filtro se aplicará desde la vista si es necesario
      await fetchBudgets(payload.patientId);
      return true;
    } catch (error) {
      toast.error('Error al crear el presupuesto.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchBudgetForPrint(id: string) {
    isLoading.value = true;
    selectedBudget.value = null; 
    try {
      const response = await getByIdApi(id);
      selectedBudget.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar el presupuesto para imprimir.');
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchPaymentForReceipt(paymentId: string) {
    isLoading.value = true;
    selectedPayment.value = null;
    try {
      const response = await getPaymentById(paymentId);
      selectedPayment.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar el pago para la boleta.');
    } finally {
      isLoading.value = false;
    }
  }

  return { 
    budgets, 
    isLoading, 
    selectedBudget,
    fetchBudgets, 
    createBudget, 
    fetchBudgetForPrint,
    selectedPayment,
    fetchPaymentForReceipt,
  };
});