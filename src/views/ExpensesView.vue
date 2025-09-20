<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useExpensesStore } from '@/stores/expenses';
import { storeToRefs } from 'pinia';
import Modal from '@/components/Modal.vue';
import ExpenseForm from '@/components/ExpenseForm.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import type { Expense } from '@/types';
import { ExpenseCategory } from '@/types'; // <-- 1. Importa el enum

const expensesStore = useExpensesStore();
const { expenses, isLoading } = storeToRefs(expensesStore);

const isModalOpen = ref(false);
const isConfirmModalOpen = ref(false);
const formData = ref<Partial<Expense>>({});
const expenseToDelete = ref<Expense | null>(null);

onMounted(() => {
  expensesStore.fetchExpenses();
});

function openCreateModal() {
  // --- 2. ESTA ES LA LÍNEA CORREGIDA ---
  formData.value = { 
    date: new Date().toISOString().split('T')[0], 
    category: ExpenseCategory.OTHER // Usamos el valor del enum, no el texto 'otros'
  };
  isModalOpen.value = true;
}

function openEditModal(expense: Expense) {
  formData.value = { ...expense };
  isModalOpen.value = true;
}

function openDeleteModal(expense: Expense) {
  expenseToDelete.value = expense;
  isConfirmModalOpen.value = true;
}

async function handleSave(data: any) {
  let success = false;
  if (data.id) {
    success = await expensesStore.editExpense(data.id, data);
  } else {
    success = await expensesStore.addExpense(data);
  }
  if (success) {
    isModalOpen.value = false;
  }
}

async function handleDelete() {
  if (expenseToDelete.value) {
    await expensesStore.removeExpense(expenseToDelete.value.id);
  }
  isConfirmModalOpen.value = false;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-PE', { timeZone: 'UTC' });
</script>
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-text-dark">Gestión de Gastos</h1>
      <button @click="openCreateModal" class="btn-primary">+ Nuevo Gasto</button>
    </div>
    <div class="bg-white rounded-lg shadow-md p-6">
      <div v-if="isLoading && expenses.length === 0">Cargando...</div>
      <table v-else-if="expenses.length > 0" class="w-full text-left">
        <thead>
          <tr class="border-b-2">
            <th class="py-3 px-4">Fecha</th>
            <th class="py-3 px-4">Descripción</th>
            <th class="py-3 px-4">Categoría</th>
            <th class="py-3 px-4 text-right">Monto</th>
            <th class="py-3 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in expenses" :key="expense.id" class="border-b hover:bg-light-gray">
            <td class="py-3 px-4">{{ formatDate(expense.date) }}</td>
            <td class="py-3 px-4">{{ expense.description }}</td>
            <td class="py-3 px-4 capitalize">{{ expense.category.replace('_', ' ') }}</td>
            <td class="py-3 px-4 text-right font-semibold text-danger">- S/. {{ Number(expense.amount).toFixed(2) }}</td>
            <td class="py-3 px-4 text-center space-x-4">
              <button @click="openEditModal(expense)" class="text-primary hover:underline">Editar</button>
              <button @click="openDeleteModal(expense)" class="text-danger hover:underline">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="text-center py-8 text-text-light">No hay gastos registrados.</div>
    </div>
    <Modal :isOpen="isModalOpen" @close="isModalOpen = false">
      <template #header>{{ formData.id ? 'Editar Gasto' : 'Nuevo Gasto' }}</template>
      <template #default>
        <ExpenseForm v-if="isModalOpen" :initial-data="formData" :loading="isLoading" @submit="handleSave" @cancel="isModalOpen = false" />
      </template>
    </Modal>
    <ConfirmationModal :isOpen="isConfirmModalOpen" title="Confirmar Eliminación" :message="`¿Seguro que deseas eliminar '${expenseToDelete?.description}'?`" confirmButtonText="Sí, Eliminar" @confirm="handleDelete" @cancel="isConfirmModalOpen = false">
      <template #icon><img src="@/assets/warning-icon.png" alt="Icono de advertencia" /></template>
    </ConfirmationModal>
  </div>
</template>