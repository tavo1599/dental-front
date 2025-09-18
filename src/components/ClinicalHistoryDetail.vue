<script setup lang="ts">
import type { ClinicalHistoryEntry } from '@/types';

defineProps<{
  entry: ClinicalHistoryEntry | null;
}>();

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('es-PE', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
};
</script>

<template>
  <div v-if="entry" class="space-y-4 text-sm">
    <div class="p-3 bg-light-gray rounded-md">
      <p><strong class="text-text-light w-32 inline-block">Fecha:</strong> {{ formatDate(entry.entryDate) }}</p>
      <p><strong class="text-text-light w-32 inline-block">Atendido por:</strong> Dr(a). {{ entry.user.fullName }}</p>
    </div>

    <div>
      <h4 class="font-semibold text-text-dark">Descripción / Motivo de Consulta</h4>
      <p class="text-text-light mt-1">{{ entry.description }}</p>
    </div>
    <div v-if="entry.diagnosis">
      <h4 class="font-semibold text-text-dark">Diagnóstico</h4>
      <p class="text-text-light mt-1">{{ entry.diagnosis }}</p>
    </div>
    <div v-if="entry.treatmentPerformed">
      <h4 class="font-semibold text-text-dark">Tratamiento Realizado</h4>
      <p class="text-text-light mt-1">{{ entry.treatmentPerformed }}</p>
    </div>
    <div v-if="entry.prescription">
      <h4 class="font-semibold text-text-dark">Prescripción</h4>
      <p class="text-text-light mt-1">{{ entry.prescription }}</p>
    </div>
    <div v-if="entry.indications">
      <h4 class="font-semibold text-text-dark">Indicaciones</h4>
      <p class="text-text-light mt-1">{{ entry.indications }}</p>
    </div>
  </div>
</template>