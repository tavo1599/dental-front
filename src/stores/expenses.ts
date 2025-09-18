import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '@/services/expenseService';
import type { Expense } from '@/types';

export const useExpensesStore = defineStore('expenses', () => {
  const toast = useToast();
  const expenses = ref<Expense[]>([]);
  const isLoading = ref(false);

  async function fetchExpenses() {
    isLoading.value = true;
    try {
      const response = await getExpenses();
      expenses.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar la lista de gastos.');
    } finally {
      isLoading.value = false;
    }
  }

  async function addExpense(data: Omit<Expense, 'id'>) {
    isLoading.value = true;
    try {
      await createExpense(data);
      toast.success('Gasto registrado con éxito.');
      await fetchExpenses();
      return true;
    } catch (error) {
      toast.error('Error al registrar el gasto.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function editExpense(id: string, data: Partial<Expense>) {
    isLoading.value = true;
    try {
      await updateExpense(id, data);
      toast.success('Gasto actualizado con éxito.');
      await fetchExpenses();
      return true;
    } catch (error) {
      toast.error('Error al actualizar el gasto.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function removeExpense(id: string) {
    isLoading.value = true;
    try {
      await deleteExpense(id);
      toast.success('Gasto eliminado con éxito.');
      await fetchExpenses();
    } catch (error) {
      toast.error('Error al eliminar el gasto.');
    } finally {
      isLoading.value = false;
    }
  }

  return { expenses, isLoading, fetchExpenses, addExpense, editExpense, removeExpense };
});