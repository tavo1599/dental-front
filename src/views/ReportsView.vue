<script setup lang="ts">
import { ref } from 'vue';
import { useReportsStore } from '@/stores/reports';
import { storeToRefs } from 'pinia';

const reportsStore = useReportsStore();
const { financialReport, isLoading } = storeToRefs(reportsStore);

// Establece las fechas por defecto para el mes actual
const getMonthRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { firstDay, lastDay };
};

const startDate = ref(getMonthRange().firstDay);
const endDate = ref(getMonthRange().lastDay);

function generateReport() {
  reportsStore.fetchFinancialReport(startDate.value, endDate.value);
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-PE', { timeZone: 'UTC' });
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-text-dark">Reportes Financieros</h1>
    
    <div class="bg-white p-4 rounded-lg shadow-md flex items-end gap-4">
      <div>
        <label for="startDate" class="block text-sm font-medium text-text-light">Fecha de Inicio</label>
        <input v-model="startDate" type="date" id="startDate" class="input-style mt-1">
      </div>
      <div>
        <label for="endDate" class="block text-sm font-medium text-text-light">Fecha de Fin</label>
        <input v-model="endDate" type="date" id="endDate" class="input-style mt-1">
      </div>
      <button @click="generateReport" class="btn-primary" :disabled="isLoading">
        {{ isLoading ? 'Generando...' : 'Generar Reporte' }}
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-12">Generando reporte...</div>
    <div v-else-if="financialReport" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 class="text-text-light font-semibold">Total Ingresos</h3>
          <p class="text-2xl font-bold text-green-600 mt-2">S/. {{ financialReport.summary.totalIncome.toFixed(2) }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 class="text-text-light font-semibold">Total Gastos</h3>
          <p class="text-2xl font-bold text-danger mt-2">- S/. {{ financialReport.summary.totalExpenses.toFixed(2) }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 class="text-text-light font-semibold">Balance Neto</h3>
          <p class="text-2xl font-bold mt-2" :class="financialReport.summary.netProfit >= 0 ? 'text-primary' : 'text-danger'">
            S/. {{ financialReport.summary.netProfit.toFixed(2) }}
          </p>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold text-text-dark mb-4">Detalle de Ingresos</h3>
          <div class="overflow-y-auto max-h-96">
            <table v-if="financialReport.payments.length > 0" class="w-full text-sm text-left">
              <thead>
                <tr class="border-b">
                  <th class="py-2">Fecha</th>
                  <th class="py-2">Paciente</th>
                  <th class="py-2 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in financialReport.payments" :key="payment.id" class="border-b">
                  <td class="py-2">{{ formatDate(payment.paymentDate) }}</td>
                  <td class="py-2">{{ payment.budget?.patient?.fullName || 'N/A' }}</td>
                  <td class="py-2 text-right font-semibold text-green-600">+ S/. {{ Number(payment.amount).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="text-text-light">No hay ingresos en este período.</p>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold text-text-dark mb-4">Detalle de Gastos</h3>
          <div class="overflow-y-auto max-h-96">
            <table v-if="financialReport.expenses.length > 0" class="w-full text-sm text-left">
              <thead>
                <tr class="border-b">
                  <th class="py-2">Fecha</th>
                  <th class="py-2">Descripción</th>
                  <th class="py-2 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="expense in financialReport.expenses" :key="expense.id" class="border-b">
                  <td class="py-2">{{ formatDate(expense.date) }}</td>
                  <td class="py-2">{{ expense.description }}</td>
                  <td class="py-2 text-right font-semibold text-danger">- S/. {{ Number(expense.amount).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="text-text-light">No hay gastos en este período.</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-12 bg-white rounded-lg shadow-md">
      <p class="text-text-light">Selecciona un rango de fechas y haz clic en "Generar Reporte".</p>
    </div>
  </div>
</template>