<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useTreatmentsStore } from '@/stores/treatments';
import { storeToRefs } from 'pinia';
import type { Treatment } from '@/types';

const props = defineProps<{
  initialData?: any; // Puede recibir un presupuesto existente o items pre-cargados
  loading: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

const treatmentsStore = useTreatmentsStore();
const { treatments } = storeToRefs(treatmentsStore);

const selectedTreatmentId = ref('');
const budgetItems = ref<{ treatment: Treatment; quantity: number, priceAtTimeOfBudget: number }[]>([]);

// Si vienen items pre-cargados del plan de tratamiento, los usamos
onMounted(() => {
  if (props.initialData?.prefilledItems) {
    budgetItems.value = props.initialData.prefilledItems;
  }
  if (treatments.value.length === 0) {
    treatmentsStore.fetchTreatments();
  }
});

// Calcula el total del presupuesto
const totalAmount = computed(() => {
  return budgetItems.value.reduce((sum, item) => sum + (item.priceAtTimeOfBudget * item.quantity), 0);
});

function addTreatment() {
  if (!selectedTreatmentId.value) return;
  const treatment = treatments.value.find(t => t.id === selectedTreatmentId.value);
  if (treatment) {
    const existingItem = budgetItems.value.find(item => item.treatment.id === treatment.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      budgetItems.value.push({
        treatment,
        quantity: 1,
        priceAtTimeOfBudget: treatment.price // Guardamos el precio actual
      });
    }
    selectedTreatmentId.value = '';
  }
}

function removeItem(treatmentId: string) {
  budgetItems.value = budgetItems.value.filter(item => item.treatment.id !== treatmentId);
}

function handleSubmit() {
  const itemsPayload = budgetItems.value.map(item => ({
    treatmentId: item.treatment.id,
    quantity: item.quantity,
  }));
  emit('submit', { items: itemsPayload });
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-6">
      <div>
        <label for="treatment" class="block text-sm font-medium text-text-light">Añadir Tratamiento Manualmente</label>
        <div class="mt-1 flex gap-2 items-center">
          <select v-model="selectedTreatmentId" id="treatment" class="flex-grow input-style">
            <option disabled value="">Seleccione un tratamiento...</option>
            <option v-for="treatment in treatments" :key="treatment.id" :value="treatment.id">
              {{ treatment.name }} - S/. {{ Number(treatment.price).toFixed(2) }}
            </option>
          </select>
          <button @click="addTreatment" type="button" class="btn-secondary flex-shrink-0">Añadir</button>
        </div>
      </div>

      <div v-if="budgetItems.length > 0">
        <h4 class="text-md font-semibold text-text-dark mb-2">Tratamientos en el Plan:</h4>
        <div class="border rounded-lg p-4 space-y-3 bg-gray-50">
          <div v-for="item in budgetItems" :key="item.treatment.id" class="flex justify-between items-center pb-3 border-b last:border-b-0 last:pb-0">
            <div>
              <p class="font-semibold text-text-dark">{{ item.treatment.name }}</p>
              <p class="text-sm text-text-light">S/. {{ Number(item.priceAtTimeOfBudget).toFixed(2) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-text-light">Cant:</span>
              <input v-model.number="item.quantity" type="number" min="1" class="w-16 text-center input-style py-1" />
              <button @click="removeItem(item.treatment.id)" type="button" class="text-danger p-1 rounded-full hover:bg-red-100">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div class="pt-3 text-right">
            <p class="text-xl font-bold text-text-dark">Total: S/. {{ totalAmount.toFixed(2) }}</p>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-6 text-text-light bg-gray-50 rounded-lg border">
        Añade tratamientos para crear el presupuesto.
      </div>
    </div>

    <div class="flex justify-end space-x-4 pt-6 mt-6 border-t">
      <button @click="emit('cancel')" type="button" class="btn-secondary">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="loading || budgetItems.length === 0">
        {{ loading ? 'Guardando...' : 'Guardar Presupuesto' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.input-style { 
  @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; 
}
.btn-primary { 
  @apply px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold disabled:bg-opacity-50 disabled:cursor-not-allowed; 
}
.btn-secondary { 
  @apply px-6 py-2.5 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; 
}
</style>