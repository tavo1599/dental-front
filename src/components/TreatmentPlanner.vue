<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'; // Importa hooks
import { useTreatmentsStore } from '@/stores/treatments';
import { usePlannedTreatmentsStore } from '@/stores/plannedTreatments';
import { storeToRefs } from 'pinia';
import type { Treatment } from '@/types';
import SearchableDropdown from './SearchableDropdown.vue';

const props = defineProps<{
  patientId: string;
  toothSurfaceStateId: string;
}>();

const emit = defineEmits(['close']);

const treatmentsStore = useTreatmentsStore();
const { treatments } = storeToRefs(treatmentsStore);
const plannedTreatmentsStore = usePlannedTreatmentsStore();

const selectedTreatmentId = ref<string | null>(null);

// --- Lógica para "Cerrar al hacer Clic Afuera" ---
const plannerEl = ref<HTMLDivElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  if (plannerEl.value && !plannerEl.value.contains(event.target as Node)) {
    emit('close');
  }
};

onMounted(() => {
  if (treatments.value.length === 0) {
    treatmentsStore.fetchTreatments();
  }
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
// --- Fin de la lógica ---

function planSelectedTreatment() {
  if (!selectedTreatmentId.value) return;

  plannedTreatmentsStore.create({
    patientId: props.patientId,
    toothSurfaceStateId: props.toothSurfaceStateId,
    treatmentId: selectedTreatmentId.value,
  });
  emit('close');
}
</script>

<template>
  <div ref="plannerEl" class="fixed bg-white rounded-lg shadow-xl border p-4 z-50 w-72 space-y-3">
    <h4 class="font-bold text-sm text-text-dark border-b pb-2">Planear Tratamiento</h4>
    
    <div>
      <label class="block text-sm font-medium text-text-light mb-1">Buscar Tratamiento</label>
      <SearchableDropdown 
        v-model="selectedTreatmentId"
        :items="treatments"
        placeholder="Escribe para buscar..."
        display-key="name"
      />
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <button @click="emit('close')" type="button" class="btn-secondary">Cancelar</button>
      <button @click="planSelectedTreatment" type="button" class="btn-primary" :disabled="!selectedTreatmentId">
        Añadir al Plan
      </button>
    </div>
  </div>
</template>

<style scoped>
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold text-sm; }
.btn-secondary { @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold text-sm; }
</style>