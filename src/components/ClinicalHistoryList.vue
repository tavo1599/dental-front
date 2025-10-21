<script setup lang="ts">
import type { ClinicalHistoryEntry } from '@/types';

defineProps<{
  entries: ClinicalHistoryEntry[];
}>();

// 1. Definimos el evento que este componente puede emitir
const emit = defineEmits(['view-entry']);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};
</script>
<template>
  <div class="space-y-6">
    <div v-if="entries.length === 0" class="text-center py-8 text-text-light">
      No hay entradas en el historial clínico para este paciente.
    </div>
    <div 
      v-for="entry in entries" 
      :key="entry.id" 
      @click="emit('view-entry', entry)"
      class="p-4 border rounded-lg bg-gray-50 cursor-pointer hover:shadow-md hover:border-primary transition-all"
    >
      <div class="flex justify-between items-center mb-2">
        <p class="font-bold text-primary">{{ formatDate(entry.entryDate) }}</p>
        <p class="text-sm text-text-light">Atendido por: {{ entry.user.fullName }}</p>
      </div>
      <div class="space-y-3">
        <div>
          <h4 class="font-semibold text-text-dark">Motivo de Consulta</h4>
          <p class="text-text-light truncate">{{ entry.description }}</p>
        </div>

        <div v-if="entry.evolution">
          <h4 class="font-semibold text-text-dark">Evolución</h4>
          <p class="text-text-light truncate">{{ entry.evolution }}</p>
        </div>
        <div v-if="entry.treatmentPerformed">
          <h4 class="font-semibold text-text-dark">Tratamiento Realizado</h4>
          <p class="text-text-light truncate">{{ entry.treatmentPerformed }}</p>
        </div>
      </div>
    </div>
  </div>
</template>