<script setup lang="ts">
import { useTreatmentsStore } from '@/stores/treatments';
import { usePlannedTreatmentsStore } from '@/stores/plannedTreatments';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import SearchableDropdown from './SearchableDropdown.vue'; // 1. Importa el componente de búsqueda

const props = defineProps<{
  patientId: string;
  toothSurfaceStateId: string;
}>();
const emit = defineEmits(['close']);

const treatmentsStore = useTreatmentsStore();
const { treatments } = storeToRefs(treatmentsStore);
const plannedTreatmentsStore = usePlannedTreatmentsStore();

const selectedTreatmentId = ref<string | null>(null); // 2. Estado para el tratamiento seleccionado

onMounted(() => {
  if (treatments.value.length === 0) {
    treatmentsStore.fetchTreatments();
  }
});

// 3. La función ahora se llama desde un botón
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
  <div class="fixed bg-white rounded-lg shadow-xl border p-4 z-50 w-72 space-y-3">
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