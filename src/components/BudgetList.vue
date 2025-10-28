<script setup lang="ts">
import type { Budget } from '@/types';
import { computed, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { updateBudgetDiscount } from '@/services/budgetService';
import { deleteBudget } from '@/services/budgetService';

const props = defineProps<{
  budgets: Budget[];
}>();

const emit = defineEmits(['manage-payments', 'print-budget', 'discount-updated', 'budget-deleted']);

const toast = useToast();

// UI state for editing discounts
const editingDiscountId = ref<string | null>(null);
const discountInput = ref<number>(0);

function startEditDiscount(budget: Budget) {
  editingDiscountId.value = budget.id;
  discountInput.value = Number(budget.discountAmount || 0);
}

function cancelEditDiscount() {
  editingDiscountId.value = null;
  discountInput.value = 0;
}

async function saveDiscount(budget: Budget) {
  try {
    const parsed = Number(discountInput.value) || 0;
    await updateBudgetDiscount(budget.id, parsed);
    toast.success('Descuento actualizado.');
    editingDiscountId.value = null;
    // Inform parent to refresh the budgets
    emit('discount-updated', budget.id);
  } catch (error) {
    toast.error('No se pudo actualizar el descuento.');
  }
}

async function confirmAndDelete(budget: Budget) {
  const confirmed = window.confirm('¿Eliminar presupuesto? Esta acción no se puede deshacer.');
  if (!confirmed) return;
  try {
    await deleteBudget(budget.id);
    toast.success('Presupuesto eliminado.');
    // Inform parent para recargar la lista
    emit('budget-deleted', budget.id);
  } catch (error) {
    toast.error('No se pudo eliminar el presupuesto.');
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

// --- CÁLCULOS CORREGIDOS CON TUS NOMBRES ---
// Tu 'paidAmount' ya viene calculado desde el backend.
const calculatePaidAmount = (budget: Budget) => {
  return Number(budget.paidAmount) || 0;
};

// El total final es el subtotal menos el descuento
const calculateFinalTotal = (budget: Budget) => {
  return Number(budget.totalAmount) - Number(budget.discountAmount || 0);
};

// El saldo es el total final menos lo pagado
const calculateBalance = (budget: Budget) => {
  const finalTotal = calculateFinalTotal(budget);
  const paidAmount = calculatePaidAmount(budget);
  // Prevenir saldos negativos si se paga de más
  const balance = finalTotal - paidAmount;
  return balance < 0 ? 0 : balance;
};
// --- FIN ---

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
      No hay presupuestos que coincidan con los filtros seleccionados.
    </div>
    
    <div v-for="budget in budgets" :key="budget.id" class="p-4 border rounded-lg bg-white shadow-sm">
      <div class="flex justify-between items-start">
        <div>
          <p class="font-bold text-primary">Presupuesto del {{ formatDate(budget.creationDate) }}</p>
          <span :class="getStatusClass(budget.status)" class="px-2 py-1 text-xs font-semibold rounded-full capitalize">{{ budget.status.replace('_', ' ') }}</span>
          
          <p v-if="budget.doctor" class="text-xs text-gray-500 mt-2">
            <span class="font-semibold">Atendido por:</span> {{ budget.doctor.fullName }}
          </p>
        </div>
        <!-- Acciones: menú pequeño con borrar (tres puntos en esquina) -->
        
        <!-- --- SECCIÓN DE TOTALES CORREGIDA --- -->
        <div class="text-right flex-shrink-0" style="min-width: 190px;">

          <!-- 1. Subtotal (tu 'totalAmount') -->
          <p class="text-sm text-text-light text-right">
            Subtotal: S/. {{ Number(budget.totalAmount).toFixed(2) }}
          </p>

          <!-- 2. Descuento y edición -->
          <div class="mt-1">
            <template v-if="editingDiscountId === budget.id">
              <div class="flex justify-end items-center gap-2">
                <input v-model.number="discountInput" type="number" min="0" step="0.01" class="input-style w-28 text-right font-bold text-red-600 py-1" />
                <button @click="saveDiscount(budget)" class="btn-primary">Guardar</button>
                <button @click="cancelEditDiscount" class="btn-secondary">Cancelar</button>
              </div>
            </template>
            <template v-else>
              <div class="flex justify-end items-center gap-2">
                <p v-if="Number(budget.discountAmount) > 0" class="text-sm text-red-600 text-right">
                  Descuento: - S/. {{ Number(budget.discountAmount).toFixed(2) }}
                </p>
                <button v-if="Number(budget.discountAmount) > 0" @click="startEditDiscount(budget)" class="text-sm underline text-primary">Editar</button>
                <button v-else @click="startEditDiscount(budget)" class="btn-secondary">Agregar Descuento</button>
              </div>
            </template>
          </div>

          <!-- 3. Total Final (calculado) -->
          <p class="text-lg font-bold text-text-dark text-right mt-2">
            Total: S/. {{ calculateFinalTotal(budget).toFixed(2) }}
          </p>

          <!-- 4. Pagado (tu 'paidAmount') -->
          <p class="text-sm text-green-600 text-right">
            Pagado: S/. {{ calculatePaidAmount(budget).toFixed(2) }}
          </p>

          <!-- 5. Saldo (calculado) -->
          <p class="text-sm text-red-600 font-semibold text-right">
            Saldo: S/. {{ calculateBalance(budget).toFixed(2) }}
          </p>

        </div>
        <!-- --- FIN DE LA CORRECCIÓN --- -->
        
      </div>
      
      <div class="mt-4 border-t pt-4">
        <h4 class="font-semibold text-sm text-text-dark mb-2">Tratamientos Incluidos:</h4>
        <ul class="list-disc list-inside text-text-light text-sm space-y-1">
          <li v-for="item in budget.items" :key="item.id">
            {{ item.treatment.name }} (x{{ item.quantity }})
          </li>
        </ul>
      </div>

      <div class="mt-4 border-t pt-4 flex justify-end items-center">
        <div class="mx-4 flex items-start">
          <button @click="confirmAndDelete(budget)" title="Más opciones" class="p-1 rounded hover:bg-gray-100">
            <!-- icono tres puntos verticales -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
        <div class="flex space-x-2">
          <button @click="emit('print-budget', budget.id)" class="btn-secondary">Imprimir</button>
          <button @click="emit('manage-payments', budget.id)" class="btn-primary">Gestionar Pagos</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold text-sm; }
.btn-secondary { @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold text-sm; }
</style>