<script setup lang="ts">
import { useTreatmentsStore } from '@/stores/treatments';
import { usePlannedTreatmentsStore } from '@/stores/plannedTreatments';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

const props = defineProps<{
  patientId: string;
  toothSurfaceStateId: string;
}>();
const emit = defineEmits(['close']);

const treatmentsStore = useTreatmentsStore();
const { treatments } = storeToRefs(treatmentsStore);
const plannedTreatmentsStore = usePlannedTreatmentsStore();

onMounted(() => {
  if (treatments.value.length === 0) {
    treatmentsStore.fetchTreatments();
  }
});

function selectTreatment(treatmentId: string) {
  plannedTreatmentsStore.create({
    patientId: props.patientId,
    toothSurfaceStateId: props.toothSurfaceStateId,
    treatmentId: treatmentId,
  });
  emit('close');
}
</script>
<template>
  <div class="fixed bg-white rounded-lg shadow-xl border p-2 z-50 w-64">
    <h4 class="font-bold text-sm px-2 pb-1 border-b">Planear Tratamiento</h4>
    <ul class="max-h-48 overflow-y-auto">
      <li v-for="treatment in treatments" :key="treatment.id" @click="selectTreatment(treatment.id)" class="px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer rounded-md">
        {{ treatment.name }}
      </li>
    </ul>
    <button @click="emit('close')" class="w-full mt-2 text-xs text-text-light hover:underline">Cerrar</button>
  </div>
</template>