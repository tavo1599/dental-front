<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTreatmentsStore } from '@/stores/treatments';
import { storeToRefs } from 'pinia';
import type { BudgetItem, Budget } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { useUsersStore } from '@/stores/users';

const props = defineProps<{
  initialData?: Partial<Budget> & { patientId?: string, prefilledItems?: any[] };
  loading: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

const treatmentsStore = useTreatmentsStore();
const { treatments } = storeToRefs(treatmentsStore);
const authStore = useAuthStore();
const usersStore = useUsersStore();
const { doctors } = storeToRefs(usersStore);

// --- ESTADOS ---
const budgetType = ref<'standard' | 'ortho'>('standard');
const selectedTreatmentId = ref('');
const items = ref<Partial<BudgetItem>[]>([]);
const discount = ref(0);
const selectedDoctorId = ref<string>('');

// --- CAMPOS ESPECÍFICOS DE ORTODONCIA ---
const orthoType = ref<'preventive' | 'corrective'>('corrective');
const baseTreatmentCost = ref(0);
const initialPayment = ref(0);
const installments = ref(12);

onMounted(async () => {
  if (treatments.value.length === 0) {
    await treatmentsStore.fetchTreatments();
  }
  
  if (authStore.user?.role !== 'dentist') {
     await usersStore.fetchDoctors();
  } else {
     selectedDoctorId.value = authStore.user?.id || '';
  }

  if (props.initialData) {
    if (props.initialData.isOrthodontic) {
        budgetType.value = 'ortho';
        orthoType.value = props.initialData.orthoType as 'preventive' | 'corrective' || 'corrective';
        baseTreatmentCost.value = Number(props.initialData.baseTreatmentCost) || 0;
        initialPayment.value = Number(props.initialData.initialPayment) || 0;
        installments.value = Number(props.initialData.installments) || 12;
    }
    
    if (props.initialData.items) {
      items.value = props.initialData.items.map(i => ({
        treatment: i.treatment,
        quantity: i.quantity,
        priceAtTimeOfBudget: i.priceAtTimeOfBudget
      }));
    } else if (props.initialData.prefilledItems) {
      items.value = [...props.initialData.prefilledItems];
    }
    
    discount.value = Number(props.initialData.discountAmount) || 0;
    if (props.initialData.doctor) {
        selectedDoctorId.value = props.initialData.doctor.id;
    }
  }
});

// --- CÁLCULOS MATEMÁTICOS ---

const itemsTotal = computed(() => {
  return items.value.reduce((sum, item) => {
    return sum + (Number(item.priceAtTimeOfBudget) * (item.quantity || 1));
  }, 0);
});

const grandTotal = computed(() => {
  if (budgetType.value === 'ortho') {
    return baseTreatmentCost.value + itemsTotal.value;
  }
  return itemsTotal.value;
});

const financingBalance = computed(() => {
    const total = grandTotal.value - discount.value;
    return Math.max(0, total - initialPayment.value);
});

const monthlyPaymentCalc = computed(() => {
    if (installments.value <= 0) return 0;
    return financingBalance.value / installments.value;
});

// --- ACCIONES ---

function addItem() {
  if (!selectedTreatmentId.value) return;
  const treatment = treatments.value.find(t => t.id === selectedTreatmentId.value);
  if (treatment) {
    const existing = items.value.find(i => i.treatment?.id === treatment.id);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        items.value.push({
          treatment: treatment,
          quantity: 1,
          priceAtTimeOfBudget: treatment.price
        });
    }
    selectedTreatmentId.value = '';
  }
}

function removeItem(index: number) {
  items.value.splice(index, 1);
}

function handleSubmit() {
  const payload: any = {
    patientId: props.initialData?.patientId || props.initialData?.patient?.id,
    doctorId: authStore.user?.id, 
    items: items.value.map(i => ({
      treatmentId: i.treatment?.id,
      quantity: Math.max(1, Math.round(Number(i.quantity))),
      priceAtTimeOfBudget: Number(i.priceAtTimeOfBudget)
    })),
    discountAmount: Number(discount.value) || 0,
    totalAmount: Number(grandTotal.value), 
    isOrthodontic: budgetType.value === 'ortho',
  };

  if (budgetType.value === 'ortho') {
      payload.orthoType = orthoType.value;
      payload.baseTreatmentCost = Number(baseTreatmentCost.value) || 0;
      payload.initialPayment = Number(initialPayment.value) || 0;
      payload.installments = Math.max(1, Math.round(Number(installments.value) || 12));
      payload.monthlyPayment = Number(monthlyPaymentCalc.value.toFixed(2));
  }

  if (props.initialData?.id) {
      payload.id = props.initialData.id;
  }

  emit('submit', payload);
}
</script>

<template>
  <div class="bg-white p-2 rounded-lg w-full">
    
    <!-- 1. TABS DE SELECCIÓN -->
    <div class="flex justify-center mb-6 border-b border-gray-200 pb-2">
        <div class="inline-flex rounded-md shadow-sm" role="group">
            <button 
                type="button" 
                @click="budgetType = 'standard'"
                :class="['px-6 py-2.5 text-sm font-medium border rounded-l-lg transition-colors focus:outline-none', 
                  budgetType === 'standard' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300']">
                Estándar
            </button>
            <button 
                type="button" 
                @click="budgetType = 'ortho'"
                :class="['px-6 py-2.5 text-sm font-medium border rounded-r-lg transition-colors focus:outline-none', 
                  budgetType === 'ortho' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300']">
                Ortodoncia
            </button>
        </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">

      <!-- 2. CAMPOS ESPECÍFICOS DE ORTODONCIA -->
      <div v-if="budgetType === 'ortho'" class="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm space-y-5">
          <h3 class="text-sm font-bold text-blue-900 uppercase border-b border-blue-200 pb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
            Plan de Ortodoncia
          </h3>
          
          <!-- Tipo -->
          <div>
              <span class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Tratamiento</span>
              <div class="flex gap-6">
                  <label class="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-blue-100 shadow-sm w-full md:w-auto hover:bg-blue-50 transition-colors">
                      <input type="radio" v-model="orthoType" value="preventive" class="text-primary focus:ring-primary h-4 w-4">
                      <span class="text-sm font-medium text-gray-700">Preventiva</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-blue-100 shadow-sm w-full md:w-auto hover:bg-blue-50 transition-colors">
                      <input type="radio" v-model="orthoType" value="corrective" class="text-primary focus:ring-primary h-4 w-4">
                      <span class="text-sm font-medium text-gray-700">Correctiva</span>
                  </label>
              </div>
          </div>

          <!-- Costos Base y Pagos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Costo Base -->
              <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Costo Base del Tratamiento</label>
                  <div class="relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-gray-500 sm:text-sm font-bold"></span>
                      </div>
                      <!-- 'pl-10' o 'pl-12' para asegurar espacio para 'S/.' -->
                      <input 
                        v-model.number="baseTreatmentCost" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        class="input-style w-full pl-12 text-gray-900 font-bold"
                        placeholder="0.00"
                      >
                  </div>
              </div>
              
              <!-- Cuota Inicial -->
              <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Cuota Inicial (Adelanto)</label>
                  <div class="relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-green-600 sm:text-sm font-bold"></span>
                      </div>
                      <input 
                        v-model.number="initialPayment" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        class="input-style w-full pl-12 text-green-700 font-bold border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50"
                        placeholder="0.00"
                      >
                  </div>
              </div>

              <!-- Cuotas -->
              <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Número de Cuotas (Meses)</label>
                  <input v-model.number="installments" type="number" min="1" max="60" class="input-style w-full text-center font-semibold">
              </div>
              
              <!-- Mensualidad Calculada -->
              <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Cuota Mensual Estimada</label>
                  <div class="relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-gray-500 sm:text-sm font-bold"></span>
                      </div>
                      <input 
                        :value="monthlyPaymentCalc.toFixed(2)" 
                        disabled 
                        type="text" 
                        class="input-style w-full pl-12 bg-gray-100 text-gray-500 font-bold border-gray-200 cursor-not-allowed"
                      >
                  </div>
              </div>
          </div>
      </div>

      <!-- 3. SELECCIÓN DE TRATAMIENTOS / APARATOLOGÍA -->
      <div class="space-y-3">
        <h3 class="text-sm font-bold text-gray-800 border-b pb-2">
            {{ budgetType === 'ortho' ? 'Aparatología y Adicionales' : 'Detalle del Presupuesto' }}
        </h3>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-grow">
            <select v-model="selectedTreatmentId" class="input-style w-full appearance-none bg-white pr-8">
              <option value="" disabled>Seleccione un tratamiento...</option>
              <option v-for="treatment in treatments" :key="treatment.id" :value="treatment.id">
                {{ treatment.name }} - S/. {{ Number(treatment.price).toFixed(2) }}
              </option>
            </select>
            <!-- Icono flecha -->
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <button type="button" @click="addItem" class="btn-secondary h-[42px] px-6 whitespace-nowrap flex items-center justify-center font-semibold">
             Añadir Item
          </button>
        </div>

        <!-- Tabla de Items (Responsiva) -->
        <div class="border rounded-lg overflow-hidden border-gray-200 bg-white shadow-sm mt-2">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tratamiento</th>
                  <th scope="col" class="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Cant.</th>
                  <th scope="col" class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-32">P. Unit</th>
                  <th scope="col" class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Subtotal</th>
                  <th scope="col" class="px-2 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="items.length === 0">
                  <td colspan="5" class="px-6 py-6 text-center text-gray-400 text-sm italic">
                    No se han agregado items.
                  </td>
                </tr>
                <tr v-for="(item, index) in items" :key="index" class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3 text-sm text-gray-900 font-medium align-middle">
                    {{ item.treatment?.name }}
                  </td>
                  <td class="px-2 py-3 text-center align-middle">
                      <input v-model.number="item.quantity" type="number" min="1" class="w-16 border-gray-300 rounded px-2 py-1 text-center text-sm focus:ring-primary focus:border-primary shadow-sm border">
                  </td>
                  <td class="px-4 py-3 text-right text-sm text-gray-500 align-middle">
                      <div class="relative rounded-md shadow-sm">
                          <input v-model.number="item.priceAtTimeOfBudget" type="number" step="0.01" class="w-24 border-gray-300 rounded px-2 py-1 text-right text-sm focus:ring-primary focus:border-primary border">
                      </div>
                  </td>
                  <td class="px-4 py-3 text-right text-sm font-bold text-gray-800 align-middle">
                      S/. {{ ((item.priceAtTimeOfBudget || 0) * (item.quantity || 1)).toFixed(2) }}
                  </td>
                  <td class="px-2 py-3 text-center align-middle">
                    <button type="button" @click="removeItem(index)" class="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 4. TOTALES -->
      <div class="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-3 shadow-sm">
         <div class="flex justify-between text-sm items-center">
             <span class="text-gray-600 font-medium">Subtotal Items:</span>
             <span class="font-bold text-gray-800">S/. {{ itemsTotal.toFixed(2) }}</span>
         </div>
         
         <div v-if="budgetType === 'ortho'" class="flex justify-between text-sm items-center text-blue-700 bg-blue-50/50 p-2 -mx-2 rounded">
             <span class="font-medium">Costo Base Tratamiento:</span>
             <span class="font-bold">+ S/. {{ baseTreatmentCost.toFixed(2) }}</span>
         </div>

         <div class="flex justify-between items-center text-sm py-1">
             <span class="text-gray-700 font-medium">Descuento General:</span>
             <div class="relative w-40 rounded-md shadow-sm">
                 <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-red-500 font-bold sm:text-sm">- S/.</span>
                 </div>
                 <input 
                    v-model.number="discount" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    class="input-style w-full pl-12 text-right text-red-600 font-bold border-red-200 focus:border-red-500 focus:ring-red-500"
                    placeholder="0.00"
                 >
             </div>
         </div>

         <div class="border-t border-gray-300 pt-4 mt-2 flex justify-between items-center">
             <span class="font-extrabold text-lg text-gray-900">TOTAL PRESUPUESTO:</span>
             <span class="font-extrabold text-2xl text-primary">S/. {{ (grandTotal - discount).toFixed(2) }}</span>
         </div>

         <!-- Resumen Financiero (Solo Ortho) -->
         <div v-if="budgetType === 'ortho'" class="mt-4 pt-4 border-t border-dashed border-gray-300">
             <h4 class="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wide">Resumen del Plan</h4>
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                 <div class="flex justify-between items-center">
                     <span class="text-gray-600">A Pagar Inicial:</span>
                     <span class="font-bold text-green-600 text-lg">S/. {{ initialPayment.toFixed(2) }}</span>
                 </div>
                 <div class="flex justify-between items-center">
                     <span class="text-gray-600">Saldo a Financiar:</span>
                     <span class="font-bold text-gray-800 text-lg">S/. {{ financingBalance.toFixed(2) }}</span>
                 </div>
                 <div class="sm:col-span-2 pt-2 mt-2 border-t border-gray-100 flex justify-between items-center bg-blue-50 -mx-3 -mb-3 p-3 rounded-b-lg">
                     <span class="font-medium text-blue-900 flex items-center gap-2">
                        {{ installments }} cuotas de:
                     </span>
                     <span class="font-bold text-blue-700 text-xl">S/. {{ monthlyPaymentCalc.toFixed(2) }}</span>
                 </div>
             </div>
         </div>
      </div>

      <!-- BOTONES -->
      <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button type="button" @click="emit('cancel')" class="btn-secondary px-6 py-2.5">Cancelar</button>
        <button type="submit" class="btn-primary px-8 py-2.5" :disabled="loading">
          <span v-if="loading" class="flex items-center gap-2">
             <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             Guardando...
          </span>
          <span v-else>Guardar Presupuesto</span>
        </button>
      </div>

    </form>
  </div>
</template>

<style scoped>
/* Estilo base para todos los inputs */
.input-style { 
  @apply border border-gray-300 rounded-lg shadow-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all bg-white; 
}

/* Botón Primario */
.btn-primary { 
  @apply bg-primary text-white rounded-lg hover:bg-opacity-90 font-semibold shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed; 
}

/* Botón Secundario */
.btn-secondary { 
  @apply bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm transition-all duration-200; 
}
</style>