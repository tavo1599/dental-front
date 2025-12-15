<script setup lang="ts">
import type { Budget } from '@/types';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { updateBudgetDiscount, deleteBudget } from '@/services/budgetService';

const props = defineProps<{
  budgets: Budget[];
}>();

const emit = defineEmits(['manage-payments', 'print-budget', 'discount-updated', 'budget-deleted']);

const toast = useToast();

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
    emit('budget-deleted', budget.id);
  } catch (error) {
    toast.error('No se pudo eliminar el presupuesto.');
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

// --- LÓGICA ROBUSTA DE DETECCIÓN DE ORTODONCIA ---
const isOrthoBudget = (budget: Budget) => {
    // Verificamos múltiples condiciones por si el tipo de dato varía
    const flagCheck = budget.isOrthodontic === true || String(budget.isOrthodontic) === 'true';
    const typeCheck = !!budget.orthoType; // Si tiene tipo definido
    const installCheck = Number(budget.installments) > 0; // Si tiene cuotas definidas
    const baseCostCheck = Number(budget.baseTreatmentCost) > 0; // Si tiene costo base
    
    return flagCheck || typeCheck || installCheck || baseCostCheck;
};

// --- CÁLCULOS ---
const calculatePaidAmount = (budget: Budget) => {
  return Number(budget.paidAmount) || 0;
};

const calculateFinalTotal = (budget: Budget) => {
  return Number(budget.totalAmount) - Number(budget.discountAmount || 0);
};

const calculateBalance = (budget: Budget) => {
  const finalTotal = calculateFinalTotal(budget);
  const paidAmount = calculatePaidAmount(budget);
  const balance = finalTotal - paidAmount;
  return balance < 0 ? 0 : balance;
};

const calculateItemsSubtotal = (budget: Budget) => {
    if (isOrthoBudget(budget)) {
        return Number(budget.totalAmount) - (Number(budget.baseTreatmentCost) || 0);
    }
    return Number(budget.totalAmount);
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
    <div v-if="budgets.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
      <p>No hay presupuestos que coincidan con los filtros seleccionados.</p>
    </div>
    
    <div v-for="budget in budgets" :key="budget.id" class="p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      
      <!-- Borde indicador -->
      <div :class="['absolute left-0 top-0 bottom-0 w-1.5', isOrthoBudget(budget) ? 'bg-blue-600' : 'bg-gray-400']"></div>

      <div class="flex flex-col md:flex-row justify-between items-start pl-3 gap-4">
        
        <!-- COLUMNA IZQUIERDA -->
        <div class="flex-1 w-full">
          <div class="flex flex-wrap items-center gap-2 mb-1">
             <p class="font-bold text-lg text-text-dark">Presupuesto del {{ formatDate(budget.creationDate) }}</p>
             
             <!-- Etiqueta Ortodoncia -->
             <span v-if="isOrthoBudget(budget)" class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wide flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
                Ortodoncia {{ budget.orthoType === 'preventive' ? 'Prev.' : 'Corr.' }}
             </span>
          </div>

          <div class="flex items-center gap-2 mb-3">
             <span :class="getStatusClass(budget.status)" class="px-2 py-0.5 text-xs font-semibold rounded-md capitalize border border-black/5">
                {{ budget.status.replace('_', ' ') }}
             </span>
             <p v-if="budget.doctor" class="text-xs text-gray-500">
                <span class="font-semibold">Dr(a):</span> {{ budget.doctor.fullName }}
             </p>
          </div>

          <!-- Items -->
          <div class="mb-3">
            <h4 class="text-xs font-bold text-gray-400 uppercase mb-1">
                {{ isOrthoBudget(budget) ? 'Aparatología y Adicionales' : 'Tratamientos' }}
            </h4>
            <ul v-if="budget.items && budget.items.length > 0" class="list-disc list-inside text-sm text-gray-700 space-y-0.5 ml-1">
              <li v-for="item in budget.items" :key="item.id">
                <span class="font-medium">{{ item.treatment?.name || 'Tratamiento' }}</span> 
                <span class="text-gray-500 text-xs ml-1">(x{{ item.quantity }})</span>
              </li>
            </ul>
            <p v-else class="text-xs text-gray-400 italic">Sin items adicionales.</p>
          </div>

          <!-- PLAN DE PAGOS (SOLO ORTODONCIA) -->
          <div v-if="isOrthoBudget(budget)" class="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 max-w-md shadow-sm">
             <h4 class="text-[10px] font-bold text-blue-800 uppercase mb-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Plan de Financiamiento
             </h4>
             <div class="grid grid-cols-3 gap-2 text-xs">
                <div class="text-center bg-white rounded p-1 border border-blue-100">
                   <div class="text-gray-500 text-[10px] uppercase">Inicial</div>
                   <div class="font-bold text-green-600">S/. {{ Number(budget.initialPayment || 0).toFixed(2) }}</div>
                </div>
                <div class="text-center bg-white rounded p-1 border border-blue-100">
                   <div class="text-gray-500 text-[10px] uppercase">Cuotas</div>
                   <div class="font-bold text-gray-800">{{ budget.installments || 0 }} m.</div>
                </div>
                <div class="text-center bg-white rounded p-1 border border-blue-100">
                   <div class="text-gray-500 text-[10px] uppercase">Mensual</div>
                   <div class="font-bold text-blue-700">S/. {{ Number(budget.monthlyPayment || 0).toFixed(2) }}</div>
                </div>
             </div>
          </div>

        </div>
        
        <!-- COLUMNA DERECHA -->
        <div class="flex flex-col items-end gap-4 w-full md:w-auto mt-4 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0">
           
           <div class="text-right w-full" style="min-width: 200px;">
              
              <!-- DESGLOSE ORTODONCIA -->
              <template v-if="isOrthoBudget(budget)">
                 <p class="text-xs text-gray-500 flex justify-between md:justify-end gap-4">
                    <span>Honorarios Base:</span> 
                    <span class="font-medium text-gray-700">S/. {{ Number(budget.baseTreatmentCost || 0).toFixed(2) }}</span>
                 </p>
                 <p class="text-xs text-gray-500 flex justify-between md:justify-end gap-4">
                    <span>Aparatología:</span> 
                    <span class="font-medium text-gray-700">S/. {{ calculateItemsSubtotal(budget).toFixed(2) }}</span>
                 </p>
                 <div class="h-px bg-gray-200 my-1 w-full ml-auto md:w-full"></div>
              </template>

              <!-- SUBTOTAL -->
              <p class="text-sm text-gray-600 flex justify-between md:justify-end gap-4 font-medium">
                 <span>Subtotal:</span> <span>S/. {{ Number(budget.totalAmount).toFixed(2) }}</span>
              </p>

              <!-- DESCUENTO -->
              <div class="mt-1 flex justify-between md:justify-end gap-2 items-center">
                 <template v-if="editingDiscountId === budget.id">
                    <input v-model.number="discountInput" type="number" min="0" step="0.01" class="input-style w-20 text-right text-xs py-1 h-7 border rounded border-gray-300" />
                    <button @click="saveDiscount(budget)" class="text-green-600 hover:text-green-800 text-xs font-bold">OK</button>
                    <button @click="cancelEditDiscount" class="text-gray-400 hover:text-gray-600 text-xs">X</button>
                 </template>
                 <template v-else>
                    <span v-if="Number(budget.discountAmount) > 0" class="text-sm text-red-500 font-medium">Dscto: - S/. {{ Number(budget.discountAmount).toFixed(2) }}</span>
                    <button @click="startEditDiscount(budget)" class="text-xs text-blue-500 hover:underline ml-2">
                       {{ Number(budget.discountAmount) > 0 ? '(Edit)' : 'Agregar Dscto' }}
                    </button>
                 </template>
              </div>

              <!-- TOTAL FINAL -->
              <p class="text-xl font-bold text-gray-900 mt-2 flex justify-between md:justify-end gap-4">
                 <span class="text-sm font-normal text-gray-500 self-center">Total:</span> 
                 S/. {{ calculateFinalTotal(budget).toFixed(2) }}
              </p>

              <!-- SALDO -->
              <div class="mt-2 pt-2 border-t border-dashed border-gray-300">
                  <p class="text-sm text-green-700 flex justify-between md:justify-end gap-4">
                     <span>Pagado:</span> <span>S/. {{ calculatePaidAmount(budget).toFixed(2) }}</span>
                  </p>
                  <p class="text-sm text-red-600 font-bold flex justify-between md:justify-end gap-4">
                     <span>Saldo:</span> <span>S/. {{ calculateBalance(budget).toFixed(2) }}</span>
                  </p>
              </div>
           </div>

           <!-- ACCIONES -->
           <div class="flex items-center gap-2 w-full justify-end mt-2">
              <button @click="confirmAndDelete(budget)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" title="Eliminar">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              <button @click="emit('print-budget', budget.id)" class="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 flex items-center gap-1 shadow-sm">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                 Imprimir
              </button>
              <button @click="emit('manage-payments', budget.id)" class="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded hover:bg-opacity-90 flex items-center gap-1 shadow-sm">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 Pagos
              </button>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para el input de descuento */
.input-style { 
  @apply border-gray-300 rounded shadow-sm px-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white; 
}
</style>