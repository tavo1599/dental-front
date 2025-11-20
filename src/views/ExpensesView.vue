<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useExpensesStore } from '@/stores/expenses';
import { storeToRefs } from 'pinia';
import Modal from '@/components/Modal.vue';
import ExpenseForm from '@/components/ExpenseForm.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import type { Expense } from '@/types';
import { ExpenseCategory } from '@/types';

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
  formData.value = { 
    date: new Date().toISOString().split('T')[0], 
    category: ExpenseCategory.OTHER 
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

const formatDate = (dateString: string) => {
    if(!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-PE', { timeZone: 'UTC' });
}

// Helper para traducir categorías visualmente
const formatCategory = (cat: string) => {
    const map: Record<string, string> = {
        [ExpenseCategory.SALARIES]: 'Salarios',
        [ExpenseCategory.SUPPLIES]: 'Insumos',
        [ExpenseCategory.RENT]: 'Alquiler',
        [ExpenseCategory.UTILITIES]: 'Servicios',
        [ExpenseCategory.MARKETING]: 'Marketing',
        [ExpenseCategory.OTHER]: 'Otros'
    };
    return map[cat] || cat.replace('_', ' ');
}
</script>

<template>
  <div class="p-4 md:p-6">
    
    <!-- HEADER RESPONSIVO -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 class="text-2xl md:text-3xl font-bold text-text-dark">Gestión de Gastos</h1>
      <button 
        @click="openCreateModal" 
        class="w-full md:w-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold shadow-sm flex justify-center items-center gap-2 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Nuevo Gasto
      </button>
    </div>

    <!-- CONTENIDO -->
    <div>
        
        <!-- LOADING -->
        <div v-if="isLoading && expenses.length === 0" class="text-center py-12 text-gray-500">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            Cargando gastos...
        </div>

        <!-- EMPTY STATE -->
        <div v-else-if="expenses.length === 0" class="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
             <p>No hay gastos registrados.</p>
        </div>

        <div v-else>
            <!-- ========================================== -->
            <!-- VISTA ESCRITORIO (TABLA) - 'hidden md:block' -->
            <!-- ========================================== -->
            <div class="hidden md:block bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Fecha</th>
                        <th class="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Descripción</th>
                        <th class="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Categoría</th>
                        <th class="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Monto</th>
                        <th class="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Acciones</th>
                    </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                    <tr v-for="expense in expenses" :key="expense.id" class="hover:bg-gray-50 transition-colors">
                        <td class="py-4 px-6 text-gray-700">{{ formatDate(expense.date) }}</td>
                        <td class="py-4 px-6 font-medium text-text-dark">{{ expense.description }}</td>
                        <td class="py-4 px-6">
                            <span class="bg-gray-100 text-gray-700 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wide">
                                {{ formatCategory(expense.category) }}
                            </span>
                        </td>
                        <td class="py-4 px-6 text-right font-bold text-red-600">- S/. {{ Number(expense.amount).toFixed(2) }}</td>
                        <td class="py-4 px-6 text-center space-x-4">
                            <button @click="openEditModal(expense)" class="text-primary hover:underline font-semibold">Editar</button>
                            <button @click="openDeleteModal(expense)" class="text-red-500 hover:underline font-semibold">Eliminar</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <!-- ========================================== -->
            <!-- VISTA MÓVIL (TARJETAS) - 'md:hidden' -->
            <!-- ========================================== -->
            <div class="md:hidden space-y-4">
                <div v-for="expense in expenses" :key="expense.id" class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    
                    <div class="flex justify-between items-start mb-2">
                        <div class="text-sm text-gray-500 font-medium">{{ formatDate(expense.date) }}</div>
                        <span class="text-red-600 font-bold text-lg">- S/. {{ Number(expense.amount).toFixed(2) }}</span>
                    </div>

                    <div class="mb-3">
                        <h3 class="text-base font-bold text-gray-900">{{ expense.description }}</h3>
                        <span class="inline-block mt-1 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded uppercase">
                            {{ formatCategory(expense.category) }}
                        </span>
                    </div>

                    <div class="flex gap-3 border-t border-gray-100 pt-3">
                        <button 
                            @click="openEditModal(expense)" 
                            class="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50 flex justify-center items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Editar
                        </button>
                        <button 
                            @click="openDeleteModal(expense)" 
                            class="flex-1 py-2 px-4 bg-red-50 text-red-600 border border-red-100 rounded-lg font-medium text-sm hover:bg-red-100 flex justify-center items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <!-- MODALES -->
    <Modal :isOpen="isModalOpen" @close="isModalOpen = false">
      <template #header>{{ formData.id ? 'Editar Gasto' : 'Nuevo Gasto' }}</template>
      <template #default>
        <ExpenseForm v-if="isModalOpen" :initial-data="formData" :loading="isLoading" @submit="handleSave" @cancel="isModalOpen = false" />
      </template>
    </Modal>

    <ConfirmationModal 
      :isOpen="isConfirmModalOpen" 
      title="Confirmar Eliminación" 
      :message="`¿Seguro que deseas eliminar '${expenseToDelete?.description}'?`" 
      confirmButtonText="Sí, Eliminar" 
      @confirm="handleDelete" 
      @cancel="isConfirmModalOpen = false"
    >
      <template #icon>
          <img src="@/assets/warning-icon.png" alt="Icono de advertencia" class="h-16 w-16 mx-auto" />
      </template>
    </ConfirmationModal>

  </div>
</template>