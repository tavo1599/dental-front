<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useCashManagementStore } from '@/stores/cashManagement';
import { storeToRefs } from 'pinia';

const cashManagementStore = useCashManagementStore();
const { summary, isLoading } = storeToRefs(cashManagementStore);

// --- FUNCIÓN CORREGIDA PARA LA FECHA DE HOY ---
// Esta función crea la fecha de hoy respetando tu zona horaria local para el input
const getTodayStringForInput = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const selectedDate = ref(getTodayStringForInput());

onMounted(() => {
  cashManagementStore.fetchDailySummary(selectedDate.value);
});

watch(selectedDate, (newDate) => {
  cashManagementStore.fetchDailySummary(newDate);
});

// Esta función se mantiene igual para mostrar las fechas de los registros
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-PE', { timeZone: 'UTC' });
</script>
<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <h1 class="text-3xl font-bold text-text-dark">Gestión de Caja Diaria</h1>
      <div>
        <label for="summaryDate" class="text-sm font-medium text-text-light">Seleccionar Fecha:</label>
        <input v-model="selectedDate" type="date" id="summaryDate" class="input-style ml-2" />
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12">Cargando resumen...</div>
    <div v-else-if="summary" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 class="text-text-light font-semibold">Total Ingresos</h3>
          <p class="text-2xl font-bold text-green-600 mt-2">S/. {{ summary.totalIncome.toFixed(2) }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 class="text-text-light font-semibold">Total Gastos</h3>
          <p class="text-2xl font-bold text-danger mt-2">- S/. {{ summary.totalExpenses.toFixed(2) }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 class="text-text-light font-semibold">Balance del Día</h3>
          <p class="text-2xl font-bold mt-2" :class="summary.balance >= 0 ? 'text-primary' : 'text-danger'">
            S/. {{ summary.balance.toFixed(2) }}
          </p>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold text-text-dark mb-4">Detalle de Ingresos (Pagos)</h3>
          <ul v-if="summary.payments.length > 0" class="space-y-2">
            <li v-for="p in summary.payments" :key="p.id" class="flex justify-between text-sm border-b pb-1">
              <span>{{ p.budget?.patient?.fullName || 'Pago' }}</span>
              <span class="font-semibold">S/. {{ Number(p.amount).toFixed(2) }}</span>
            </li>
          </ul>
          <p v-else class="text-text-light text-sm">No hay ingresos registrados para esta fecha.</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold text-text-dark mb-4">Detalle de Egresos (Gastos)</h3>
          <ul v-if="summary.expenses.length > 0" class="space-y-2">
            <li v-for="e in summary.expenses" :key="e.id" class="flex justify-between text-sm border-b pb-1">
              <span>{{ e.description }}</span>
              <span class="font-semibold">- S/. {{ Number(e.amount).toFixed(2) }}</span>
            </li>
          </ul>
          <p v-else class="text-text-light text-sm">No hay gastos registrados para esta fecha.</p>
        </div>
      </div>
    </div>
  </div>
</template>