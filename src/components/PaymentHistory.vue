<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { usePaymentsStore } from '@/stores/payments';
import { useBudgetsStore } from '@/stores/budgets'; // <-- Necesitamos esto para ver los detalles del plan
import { storeToRefs } from 'pinia';
import { PaymentMethod } from '@/types';

const props = defineProps<{
  budgetId: string;
}>();

const emit = defineEmits(['payment-saved', 'print-receipt']);

const paymentsStore = usePaymentsStore();
const budgetsStore = useBudgetsStore();
const { payments, isLoading } = storeToRefs(paymentsStore);
const { selectedBudget } = storeToRefs(budgetsStore); // Usamos el presupuesto seleccionado para ver detalles

const getTodayString = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const todayWithOffset = new Date(today.getTime() - (offset * 60 * 1000));
  return todayWithOffset.toISOString().split('T')[0];
};

const formData = ref({
  amount: null as number | null,
  paymentMethod: PaymentMethod.CASH,
  paymentDate: getTodayString(),
  notes: '',
});

// --- CARGA DE DATOS ---
onMounted(async () => {
  // 1. Cargar el historial de pagos
  await paymentsStore.fetchPayments(props.budgetId);
  // 2. Cargar los detalles del presupuesto (para saber cuotas, saldo, etc.)
  await budgetsStore.fetchBudgetForPrint(props.budgetId);
});

// --- COMPUTADAS DE FINANZAS ---
const budgetTotals = computed(() => {
    const b = selectedBudget.value;
    if (!b) return { total: 0, paid: 0, balance: 0 };

    const total = Number(b.totalAmount) - Number(b.discountAmount || 0);
    // Calculamos lo pagado sumando el historial actual en tiempo real para mayor precisión
    const paid = payments.value.reduce((acc, p) => acc + Number(p.amount), 0);
    const balance = Math.max(0, total - paid);
    
    return { total, paid, balance };
});

const isOrtho = computed(() => {
    const b = selectedBudget.value;
    return !!b?.isOrthodontic || !!b?.orthoType;
});

// --- ACCIONES RÁPIDAS (Helpers) ---
function setAmount(value: number) {
    if (value > 0) formData.value.amount = value;
}

async function handleSubmit() {
  const success = await paymentsStore.createPayment(props.budgetId, formData.value);
  if (success) {
    emit('payment-saved');
    formData.value.amount = null;
    formData.value.notes = '';
    // Recargar pagos y presupuesto para actualizar saldo
    await paymentsStore.fetchPayments(props.budgetId);
    await budgetsStore.fetchBudgetForPrint(props.budgetId);
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-PE', { timeZone: 'UTC' });
};

const translatePaymentMethod = (method: string | PaymentMethod) => {
  const translations: Record<string, string> = {
    [PaymentMethod.CASH]: 'Efectivo',
    [PaymentMethod.YAPE]: 'Yape',
    [PaymentMethod.CARD]: 'Tarjeta',
    [PaymentMethod.TRANSFER]: 'Transferencia',
    [PaymentMethod.OTHER]: 'Otro',
  };
  return translations[method] || method;
};
</script>

<template>
  <div class="space-y-6">
    
    <!-- 1. RESUMEN DE CUENTA -->
    <div v-if="selectedBudget" class="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div class="text-center">
            <p class="text-xs text-gray-500 uppercase font-bold">Total a Pagar</p>
            <p class="text-lg font-bold text-gray-800">S/. {{ budgetTotals.total.toFixed(2) }}</p>
        </div>
        <div class="text-center border-l border-gray-200">
            <p class="text-xs text-gray-500 uppercase font-bold">Abonado</p>
            <p class="text-lg font-bold text-green-600">S/. {{ budgetTotals.paid.toFixed(2) }}</p>
        </div>
        <div class="text-center border-l border-gray-200">
            <p class="text-xs text-gray-500 uppercase font-bold">Saldo Pendiente</p>
            <p class="text-lg font-bold text-red-500">S/. {{ budgetTotals.balance.toFixed(2) }}</p>
        </div>
    </div>

    <!-- 1.5. DETALLE DE ITEMS (RECUPERADO) -->
    <div v-if="selectedBudget && selectedBudget.items && selectedBudget.items.length > 0" class="bg-white border rounded-lg p-3 shadow-sm">
        <h4 class="text-xs font-bold text-gray-500 uppercase mb-2 border-b pb-1">
            {{ isOrtho ? 'Aparatología Adicional' : 'Tratamientos Incluidos' }}
        </h4>
        <ul class="text-sm space-y-1 max-h-32 overflow-y-auto pr-1">
            <li v-for="item in selectedBudget.items" :key="item.id" class="flex justify-between items-center text-gray-700">
                <span>• {{ item.treatment?.name || 'Tratamiento' }} <span class="text-xs text-gray-400">(x{{ item.quantity }})</span></span>
                <!-- Mostramos el total de esa línea (Precio * Cantidad) -->
                <span class="font-medium text-gray-900 text-xs">S/. {{ (Number(item.priceAtTimeOfBudget) * item.quantity).toFixed(2) }}</span>
            </li>
        </ul>
        <div v-if="selectedBudget.discountAmount > 0" class="text-right mt-2 pt-2 border-t text-xs text-red-500">
            Descuento aplicado: - S/. {{ Number(selectedBudget.discountAmount).toFixed(2) }}
        </div>
    </div>

    <!-- 2. BOTONES RÁPIDOS PARA ORTODONCIA -->
    <div v-if="isOrtho && selectedBudget" class="flex flex-wrap gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100 items-center">
        <span class="text-xs font-bold text-blue-800 uppercase mr-1">Opciones:</span>
        
        <button 
           v-if="Number(selectedBudget.initialPayment) > 0"
           @click="setAmount(Number(selectedBudget.initialPayment))"
           class="px-2 py-1 bg-white border border-blue-200 text-blue-700 text-xs rounded hover:bg-blue-100 transition-colors font-medium"
        >
           Inicial ({{ selectedBudget.initialPayment }})
        </button>
        
        <button 
           v-if="Number(selectedBudget.monthlyPayment) > 0"
           @click="setAmount(Number(selectedBudget.monthlyPayment))"
           class="px-2 py-1 bg-white border border-blue-200 text-blue-700 text-xs rounded hover:bg-blue-100 transition-colors font-medium"
        >
           Mensual ({{ selectedBudget.monthlyPayment }})
        </button>

        <button 
           @click="setAmount(budgetTotals.balance)"
           class="px-2 py-1 bg-white border border-red-200 text-red-700 text-xs rounded hover:bg-red-50 transition-colors font-medium ml-auto"
        >
           Pagar Todo
        </button>
    </div>

    <!-- 3. FORMULARIO DE PAGO -->
    <form @submit.prevent="handleSubmit" class="p-4 border rounded-lg bg-white shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        <div>
          <label for="paymentDate" class="block text-sm font-medium text-text-light">Fecha</label>
          <input
            v-model="formData.paymentDate"
            type="date"
            id="paymentDate"
            class="mt-1 block w-full input-style"
            required
          />
        </div>
        <div>
          <label for="amount" class="block text-sm font-medium text-text-light">Monto (S/.)</label>
          <div class="relative mt-1 rounded-md shadow-sm">
             <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
               <span class="text-gray-500 sm:text-sm"></span>
             </div>
             <input
                v-model.number="formData.amount"
                type="number"
                step="0.01"
                id="amount"
                class="block w-full input-style pl-10 font-bold text-gray-900"
                placeholder="0.00"
                required
             />
          </div>
        </div>
        <div>
          <label for="paymentMethod" class="block text-sm font-medium text-text-light">Método</label>
          <select
            v-model="formData.paymentMethod"
            id="paymentMethod"
            class="mt-1 block w-full input-style"
            required
          >
            <option
              v-for="method in Object.values(PaymentMethod)"
              :key="method"
              :value="method"
            >
              {{ translatePaymentMethod(method) }}
            </option>
          </select>
        </div>
        <div class="w-full">
          <button
            type="submit"
            class="btn-primary w-full h-[42px] flex justify-center items-center"
            :disabled="isLoading || !formData.amount || formData.amount <= 0"
          >
            {{ isLoading ? '...' : 'Registrar' }}
          </button>
        </div>
      </div>
    </form>

    <!-- 4. HISTORIAL DE PAGOS -->
    <div>
      <h4 class="font-semibold text-text-dark mb-2 pl-1">Historial de Pagos</h4>
      
      <div v-if="isLoading && payments.length === 0" class="text-center py-4 text-gray-400">Cargando...</div>
      
      <ul v-else-if="payments.length > 0" class="space-y-2 max-h-60 overflow-y-auto pr-1">
        <li
          v-for="payment in payments"
          :key="payment.id"
          class="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div>
            <p class="font-bold text-green-700 text-lg">
              S/. {{ Number(payment.amount).toFixed(2) }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatDate(payment.paymentDate) }} • {{ translatePaymentMethod(payment.paymentMethod) }}
            </p>
          </div>
          <div>
            <button @click="emit('print-receipt', payment.id)" type="button" class="text-primary hover:text-blue-800 text-xs font-bold border border-primary px-3 py-1 rounded hover:bg-blue-50 transition-colors">
              Imprimir Boleta
            </button>
          </div>
        </li>
      </ul>
      
      <p v-else class="text-text-light text-sm text-center py-8 border-2 border-dashed rounded-lg">
        No hay pagos registrados aún.
      </p>
    </div>
  </div>
</template>

<style scoped>
.input-style {
  @apply border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm;
}
.btn-primary {
  @apply bg-primary text-white rounded-lg hover:bg-opacity-90 font-semibold disabled:bg-opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors;
}
</style>