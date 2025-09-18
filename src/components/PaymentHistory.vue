<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePaymentsStore } from '@/stores/payments';
import { storeToRefs } from 'pinia';
import { PaymentMethod } from '@/types';
import type { Payment } from '@/types';

const props = defineProps<{
  budgetId: string;
}>();

// 1. Definimos el nuevo evento que el componente puede emitir
const emit = defineEmits(['payment-saved']);

const paymentsStore = usePaymentsStore();
const { payments, isLoading } = storeToRefs(paymentsStore);

const getTodayString = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const todayWithOffset = new Date(today.getTime() - (offset * 60 * 1000));
  return todayWithOffset.toISOString().split('T')[0];
}

const formData = ref({
  amount: null as number | null,
  paymentMethod: PaymentMethod.CASH,
  paymentDate: getTodayString(),
  notes: '',
});

onMounted(() => {
  paymentsStore.fetchPayments(props.budgetId);
});

async function handleSubmit() {
  const success = await paymentsStore.createPayment(props.budgetId, formData.value);
  if (success) {
    // 2. Si el pago se guardó, emitimos el evento para que el padre cierre el modal
    emit('payment-saved');
    // Limpiamos el formulario
    formData.value.amount = null;
    formData.value.notes = '';
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-PE', { timeZone: 'UTC' });
}

// 3. Nueva función para traducir los métodos de pago
const translatePaymentMethod = (method: PaymentMethod) => {
  const translations: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: 'Efectivo',
    [PaymentMethod.CARD]: 'Tarjeta',
    [PaymentMethod.TRANSFER]: 'Transferencia',
    [PaymentMethod.OTHER]: 'Otro',
  };
  return translations[method] || method;
};
</script>

<template>
  <div class="space-y-6">
    <form @submit.prevent="handleSubmit" class="p-4 border rounded-lg bg-gray-50">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        <div>
          <label for="paymentDate" class="block text-sm font-medium text-text-light">Fecha de Pago</label>
          <input v-model="formData.paymentDate" type="date" id="paymentDate" class="mt-1 block w-full input-style" required />
        </div>
        <div>
          <label for="amount" class="block text-sm font-medium text-text-light">Monto (S/.)</label>
          <input v-model.number="formData.amount" type="number" step="0.01" id="amount" class="mt-1 block w-full input-style" placeholder="0.00" required />
        </div>
        <div>
          <label for="paymentMethod" class="block text-sm font-medium text-text-light">Método de Pago</label>
          <select v-model="formData.paymentMethod" id="paymentMethod" class="mt-1 block w-full input-style" required>
            <option v-for="method in PaymentMethod" :key="method" :value="method">{{ translatePaymentMethod(method) }}</option>
          </select>
        </div>
        <div class="w-full">
          <button type="submit" class="btn-primary w-full" :disabled="isLoading || !formData.amount || formData.amount <= 0">
            {{ isLoading ? 'Registrando...' : 'Registrar Pago' }}
          </button>
        </div>
      </div>
    </form>

    <div>
      <h4 class="font-semibold text-text-dark mb-2">Historial de Pagos</h4>
      <div v-if="isLoading && payments.length === 0">Cargando...</div>
      <ul v-else-if="payments.length > 0" class="space-y-2">
        <li v-for="payment in payments" :key="payment.id" class="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
          <div>
            <p class="font-semibold text-green-600">S/. {{ Number(payment.amount).toFixed(2) }}</p>
            <p class="text-xs text-text-light">{{ formatDate(payment.paymentDate) }} - {{ translatePaymentMethod(payment.paymentMethod) }}</p>
          </div>
        </li>
      </ul>
      <p v-else class="text-text-light text-sm text-center py-4">No hay pagos registrados.</p>
    </div>
  </div>
</template>

<style scoped>
.input-style { @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold disabled:bg-opacity-50 disabled:cursor-not-allowed; }
</style>