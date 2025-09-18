<script setup lang="ts">
import type { Budget } from '@/types';
import { computed } from 'vue';

const props = defineProps<{
  budgets: Budget[];
}>();

// 1. Definimos el evento que este componente puede emitir hacia su padre
const emit = defineEmits(['manage-payments', 'print-budget']);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-PE');
};

const getStatusClass = (status: string) => {
  const classes: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};
</script>

<template>
  <div class="space-y-4">
    <div v-if="budgets.length === 0" class="text-center py-8 text-text-light">
      No hay presupuestos registrados para este paciente.
    </div>
    <div v-for="budget in budgets" :key="budget.id" class="p-4 border rounded-lg bg-gray-50">
      <div class="flex justify-between items-start">
        <div>
          <p class="font-bold text-primary">Presupuesto del {{ formatDate(budget.creationDate) }}</p>
          <span :class="getStatusClass(budget.status)" class="px-2 py-1 text-xs font-semibold rounded-full capitalize">{{ budget.status.replace('_', ' ') }}</span>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold text-text-dark">S/. {{ Number(budget.totalAmount).toFixed(2) }}</p>
          <p class="text-sm text-green-600">Pagado: S/. {{ Number(budget.paidAmount).toFixed(2) }}</p>
          <p class="text-sm text-red-600 font-semibold">Saldo: S/. {{ (budget.totalAmount - budget.paidAmount).toFixed(2) }}</p>
        </div>
      </div>
      
      <div class="mt-4 border-t pt-2 flex justify-between items-center">
        <div>
          <h4 class="font-semibold text-sm text-text-dark">Tratamientos Incluidos:</h4>
          <ul class="list-disc list-inside text-text-light text-sm">
            <li v-for="item in budget.items" :key="item.id">
              {{ item.treatment.name }} (x{{ item.quantity }})
            </li>
          </ul>
        </div>
        <div class="mt-4 border-t pt-2 flex justify-between items-center">
  <div class="flex space-x-2">
    <button @click="emit('print-budget', budget.id)" class="btn-secondary">Imprimir</button>
    <button @click="emit('manage-payments', budget.id)" class="btn-secondary">Gestionar Pagos</button>
  </div>
</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-secondary { @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold text-sm; }
</style>