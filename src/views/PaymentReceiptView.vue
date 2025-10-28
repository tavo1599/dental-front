<script setup lang="ts">
import { onMounted, nextTick, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useBudgetsStore } from '@/stores/budgets';
import { storeToRefs } from 'pinia';
import { PaymentMethod } from '@/types';

const route = useRoute();
const budgetsStore = useBudgetsStore();
const { selectedPayment, isLoading } = storeToRefs(budgetsStore);

const logoSrc = computed(() => {
  if (selectedPayment.value?.budget.tenant.logoUrl) {
    return `${import.meta.env.VITE_API_BASE_URL}${selectedPayment.value.budget.tenant.logoUrl}`;
  }
  return null;
});

onMounted(async () => {
  const paymentId = route.params.id as string;
  if (paymentId) {
    await budgetsStore.fetchPaymentForReceipt(paymentId);
    await nextTick();
    window.print();
  }
});

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

const translatePaymentMethod = (method: PaymentMethod) => {
  const translations: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: 'Efectivo',
    [PaymentMethod.YAPE]: 'Yape', // <-- AÑADIDO
    [PaymentMethod.CARD]: 'Tarjeta',
    [PaymentMethod.TRANSFER]: 'Transferencia',
    [PaymentMethod.OTHER]: 'Otro',
  };
  return translations[method] || method;
};
</script>

<template>
  <div class="p-4 md:p-8 bg-gray-100 font-sans">
    <div v-if="isLoading" class="text-center py-12">Cargando boleta...</div>
    <div v-else-if="selectedPayment" class="max-w-3xl mx-auto bg-white shadow-lg p-10">
      
      <header class="flex justify-between items-start pb-6 border-b-2 border-primary">
        <div>
          <h1 class="text-3xl font-bold text-primary">{{ selectedPayment.budget.tenant.name }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ selectedPayment.budget.tenant.address }}</p>
          <p class="text-sm text-gray-500">{{ selectedPayment.budget.tenant.phone }}</p>
          <p class="text-sm text-gray-500">{{ selectedPayment.budget.tenant.email }}</p>
        </div>
        <div v-if="selectedPayment.budget.tenant.logoUrl" class="w-24 h-24 flex-shrink-0">
          <img :src="selectedPayment.budget.tenant.logoUrl" alt="Logo de la Clínica" class="max-h-24 max-w-24 object-contain" />
        </div>
      </header>

      <section class="mt-8 grid grid-cols-2 gap-8">
        <div>
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Recibo para</h3>
          <p class="font-bold text-lg text-text-dark">{{ selectedPayment.budget.patient.fullName }}</p>
          <p class="text-text-light">DNI: {{ selectedPayment.budget.patient.dni }}</p>
        </div>
        <div class="text-right">
          <h2 class="text-2xl font-bold text-gray-800">RECIBO DE PAGO</h2>
          <p class="text-gray-600 mt-1">N°: {{ selectedPayment.id.substring(0, 8) }}</p>
        </div>
      </section>

      <section class="my-8">
        <h3 class="text-md font-semibold text-gray-700 mb-2">Tratamientos del Presupuesto Asociado</h3>
        <table class="w-full text-left text-sm">
          <thead class="border-b-2 border-gray-300">
            <tr>
              <th class="p-3 text-sm font-semibold text-gray-500 uppercase">Descripción</th>
              <th class="p-3 text-center text-sm font-semibold text-gray-500 uppercase">Cant.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in selectedPayment.budget.items" :key="item.id" class="border-b border-gray-100">
              <td class="p-3">{{ item.treatmentName || item.treatment?.name || 'Sin Tratamiento' }}</td>
              <td class="p-3 text-center">{{ item.quantity }}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section class="my-8">
        <table class="w-full text-left">
          <thead class="border-b-2 border-gray-300">
            <tr>
              <th class="p-3 text-sm font-semibold text-gray-500 uppercase">Detalle del Pago</th>
              <th class="p-3 text-right text-sm font-semibold text-gray-500 uppercase">Fecha</th>
              <th class="p-3 text-right text-sm font-semibold text-gray-500 uppercase">Monto Pagado</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-100">
              <td class="p-3">Abono a presupuesto N° {{ selectedPayment.budget.id.substring(0, 8) }}</td>
              <td class="p-3 text-right">{{ formatDate(selectedPayment.paymentDate) }}</td>
              <td class="p-3 text-right font-semibold">S/. {{ Number(selectedPayment.amount).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </section>
      
      <footer class="mt-12">
        <div class="flex justify-end">
          <div class="w-full sm:w-2/5 text-right">
            <div class="flex justify-between font-bold text-xl text-primary border-t-2 border-primary pt-2">
              <span>PAGO REALIZADO:</span>
              <span>S/. {{ Number(selectedPayment.amount).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div class="mt-20 pt-10 border-t text-center w-1/2 mx-auto">
          <p class="text-sm">Recibí Conforme</p>
          <p class="text-sm mt-1">{{ selectedPayment.budget.patient.fullName }}</p>
        </div>
      </footer>
    </div>
  </div>
</template>