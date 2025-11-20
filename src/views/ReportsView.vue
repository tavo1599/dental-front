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
  <div class="p-4 md:p-6">
    
    <!-- HEADER & FILTROS RESPONSIVOS -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 class="text-2xl md:text-3xl font-bold text-text-dark">Reportes Financieros</h1>
    </div>

    <div class="bg-white p-4 rounded-lg shadow-md mb-6">
      <div class="flex flex-col md:flex-row md:items-end gap-4">
        <div class="w-full md:w-auto">
          <label for="startDate" class="block text-sm font-medium text-text-light mb-1">Fecha de Inicio</label>
          <input v-model="startDate" type="date" id="startDate" class="input-style w-full">
        </div>
        <div class="w-full md:w-auto">
          <label for="endDate" class="block text-sm font-medium text-text-light mb-1">Fecha de Fin</label>
          <input v-model="endDate" type="date" id="endDate" class="input-style w-full">
        </div>
        <button 
          @click="generateReport" 
          class="btn-primary w-full md:w-auto flex justify-center items-center" 
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
          {{ isLoading ? 'Generando...' : 'Generar Reporte' }}
        </button>
      </div>
    </div>

    <!-- CONTENIDO DEL REPORTE -->
    <div v-if="isLoading" class="text-center py-12 text-gray-500">
       <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
       Generando reporte...
    </div>
    
    <div v-else-if="financialReport" class="space-y-6">
      
      <!-- 1. TARJETAS DE RESUMEN (KPIs) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md text-center border-l-4 border-green-500">
          <h3 class="text-gray-500 font-semibold uppercase text-xs tracking-wider">Total Ingresos</h3>
          <p class="text-2xl md:text-3xl font-bold text-gray-800 mt-2">S/. {{ financialReport.summary.totalIncome.toFixed(2) }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md text-center border-l-4 border-red-500">
          <h3 class="text-gray-500 font-semibold uppercase text-xs tracking-wider">Total Gastos</h3>
          <p class="text-2xl md:text-3xl font-bold text-gray-800 mt-2">- S/. {{ financialReport.summary.totalExpenses.toFixed(2) }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md text-center border-l-4" :class="financialReport.summary.netProfit >= 0 ? 'border-blue-500' : 'border-orange-500'">
          <h3 class="text-gray-500 font-semibold uppercase text-xs tracking-wider">Balance Neto</h3>
          <p class="text-2xl md:text-3xl font-bold mt-2" :class="financialReport.summary.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'">
            S/. {{ financialReport.summary.netProfit.toFixed(2) }}
          </p>
        </div>
      </div>

      <!-- 2. DETALLES (GRID 2 COLUMNAS EN DESKTOP) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- DETALLE INGRESOS -->
        <div class="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col h-96">
          <h3 class="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Detalle de Ingresos
          </h3>
          
          <div class="overflow-y-auto flex-1 pr-2">
             <p v-if="financialReport.payments.length === 0" class="text-center text-gray-400 py-8">No hay ingresos en este período.</p>
             
             <!-- TABLA DESKTOP -->
             <table v-else class="w-full text-sm text-left hidden md:table">
              <thead class="sticky top-0 bg-white">
                <tr class="border-b border-gray-200">
                  <th class="py-2 font-semibold text-gray-600">Fecha</th>
                  <th class="py-2 font-semibold text-gray-600">Paciente</th>
                  <th class="py-2 text-right font-semibold text-gray-600">Monto</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="payment in financialReport.payments" :key="payment.id" class="hover:bg-gray-50">
                  <td class="py-2 text-gray-700">{{ formatDate(payment.paymentDate) }}</td>
                  <td class="py-2 text-gray-900 font-medium">{{ payment.budget?.patient?.fullName || 'N/A' }}</td>
                  <td class="py-2 text-right font-bold text-green-600">+ S/. {{ Number(payment.amount).toFixed(2) }}</td>
                </tr>
              </tbody>
             </table>

             <!-- LISTA MÓVIL -->
             <div class="md:hidden space-y-3">
                <div v-for="payment in financialReport.payments" :key="payment.id" class="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-xs text-gray-500">{{ formatDate(payment.paymentDate) }}</span>
                        <span class="font-bold text-green-600">+ S/. {{ Number(payment.amount).toFixed(2) }}</span>
                    </div>
                    <div class="text-sm font-medium text-gray-900">{{ payment.budget?.patient?.fullName || 'N/A' }}</div>
                </div>
             </div>
          </div>
        </div>

        <!-- DETALLE GASTOS -->
        <div class="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col h-96">
          <h3 class="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            Detalle de Gastos
          </h3>
          
          <div class="overflow-y-auto flex-1 pr-2">
            <p v-if="financialReport.expenses.length === 0" class="text-center text-gray-400 py-8">No hay gastos en este período.</p>

            <!-- TABLA DESKTOP -->
            <table v-else class="w-full text-sm text-left hidden md:table">
              <thead class="sticky top-0 bg-white">
                <tr class="border-b border-gray-200">
                  <th class="py-2 font-semibold text-gray-600">Fecha</th>
                  <th class="py-2 font-semibold text-gray-600">Descripción</th>
                  <th class="py-2 text-right font-semibold text-gray-600">Monto</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="expense in financialReport.expenses" :key="expense.id" class="hover:bg-gray-50">
                  <td class="py-2 text-gray-700">{{ formatDate(expense.date) }}</td>
                  <td class="py-2 text-gray-900">{{ expense.description }}</td>
                  <td class="py-2 text-right font-bold text-red-600">- S/. {{ Number(expense.amount).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>

            <!-- LISTA MÓVIL -->
            <div class="md:hidden space-y-3">
                <div v-for="expense in financialReport.expenses" :key="expense.id" class="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-xs text-gray-500">{{ formatDate(expense.date) }}</span>
                        <span class="font-bold text-red-600">- S/. {{ Number(expense.amount).toFixed(2) }}</span>
                    </div>
                    <div class="text-sm text-gray-900">{{ expense.description }}</div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ESTADO INICIAL -->
    <div v-else class="text-center py-16 bg-white rounded-lg shadow-md border border-dashed border-gray-300">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      <p class="text-text-light text-lg">Selecciona un rango de fechas y haz clic en "Generar Reporte".</p>
    </div>
  </div>
</template>

<style scoped>
.input-style { 
  @apply border border-gray-300 rounded-lg shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all; 
}
.btn-primary { 
  @apply px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed; 
}
</style>