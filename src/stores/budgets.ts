import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { getBudgetsForPatient, createBudget as createApi, getBudgetById as getByIdApi } from '@/services/budgetService';
import type { Budget } from '@/types';

export const useBudgetsStore = defineStore('budgets', () => {
  const toast = useToast();
  const budgets = ref<Budget[]>([]);
  const isLoading = ref(false);

  async function fetchBudgets(patientId: string) {
    isLoading.value = true;
    try {
      const response = await getBudgetsForPatient(patientId);
      budgets.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar los presupuestos.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createBudget(data: any) {
  isLoading.value = true;
  try {
    await createApi(data);
    toast.success('Presupuesto creado con éxito.');
    await fetchBudgets(data.patientId);
    return true;
  } catch (error) {
    toast.error('Error al crear el presupuesto.');
    return false;
  } finally {
    isLoading.value = false;
  }
}

async function fetchBudgetById(id: string) {
  isLoading.value = true;
  try {
    const response = await getByIdApi(id);
    return response.data; // Devuelve el presupuesto encontrado
  } catch (error) {
    toast.error('No se pudo cargar el presupuesto.');
  } finally {
    isLoading.value = false;
  }
}

  return { budgets, isLoading, fetchBudgets, createBudget, fetchBudgetById };
});