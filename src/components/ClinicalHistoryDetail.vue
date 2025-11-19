<script setup lang="ts">
import type { ClinicalHistoryEntry } from '@/types';

defineProps<{
  entry: ClinicalHistoryEntry | null;
}>();

const emit = defineEmits(['edit']); // Nuevo evento

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('es-PE', { dateStyle: 'full', timeStyle: 'short' });
};

const formatNextDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};
</script>

<template>
  <div v-if="entry" class="space-y-4 text-sm relative">
    
    <!-- Botón Flotante de Editar en el Detalle -->
    <div class="absolute top-0 right-0">
      <button 
        @click="emit('edit', entry)"
        class="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-transparent hover:border-blue-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span class="font-medium">Editar</span>
      </button>
    </div>

    <!-- Encabezado -->
    <div class="p-3 bg-gray-50 rounded-md border border-gray-200 pr-20"> <!-- pr-20 para dejar espacio al botón -->
      <p class="mb-1"><strong class="text-gray-600 w-32 inline-block">Fecha:</strong> <span class="text-gray-900">{{ formatDate(entry.entryDate) }}</span></p>
      <p><strong class="text-gray-600 w-32 inline-block">Atendido por:</strong> <span class="text-gray-900">Dr(a). {{ entry.user.fullName }}</span></p>
    </div>

    <!-- ... (Resto del contenido: Motivo, Evolución, Diagnóstico, Tratamiento...) -->
    <!-- El resto del template se mantiene igual que la versión anterior -->
    
    <!-- Motivo -->
    <div>
      <h4 class="font-bold text-gray-800 border-b pb-1 mb-2">Descripción / Motivo de Consulta</h4>
      <p class="text-gray-700 leading-relaxed">{{ entry.description }}</p>
    </div>
    
    <!-- Evolución -->
    <div v-if="entry.evolution">
      <h4 class="font-bold text-gray-800 border-b pb-1 mb-2">Evolución (SOAP)</h4>
      <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ entry.evolution }}</p>
    </div>

    <!-- Diagnóstico -->
    <div v-if="entry.diagnosis">
      <h4 class="font-bold text-gray-800 border-b pb-1 mb-2">Diagnóstico</h4>
      <p class="text-gray-700">{{ entry.diagnosis }}</p>
    </div>

    <!-- Tratamiento -->
    <div v-if="entry.treatmentPerformed">
      <h4 class="font-bold text-gray-800 border-b pb-1 mb-2">Tratamiento Realizado</h4>
      <p class="text-gray-700">{{ entry.treatmentPerformed }}</p>
    </div>

    <!-- Prescripción -->
    <div v-if="entry.prescription">
      <h4 class="font-bold text-gray-800 border-b pb-1 mb-2">Prescripción</h4>
      <div class="bg-yellow-50 p-3 rounded-md border border-yellow-100 text-gray-700 whitespace-pre-wrap font-medium">
        {{ entry.prescription }}
      </div>
    </div>

    <!-- Indicaciones -->
    <div v-if="entry.indications">
      <h4 class="font-bold text-gray-800 border-b pb-1 mb-2">Indicaciones</h4>
      <p class="text-gray-700 whitespace-pre-wrap">{{ entry.indications }}</p>
    </div>

    <!-- Próxima Cita -->
    <div v-if="entry.nextAppointmentPlan || entry.nextAppointmentDate" class="mt-6 pt-4 border-t-2 border-dashed border-gray-200">
      <h4 class="font-bold text-blue-700 mb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Planificación para la Próxima Cita
      </h4>
      
      <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div v-if="entry.nextAppointmentPlan" class="mb-2">
          <span class="text-xs font-bold text-blue-500 uppercase tracking-wide block mb-1">Lo que se hará:</span>
          <p class="text-gray-800 font-medium">{{ entry.nextAppointmentPlan }}</p>
        </div>
        
        <div v-if="entry.nextAppointmentDate" class="mt-3 flex items-center gap-2">
           <span class="text-xs font-bold text-blue-500 uppercase tracking-wide">Fecha sugerida:</span>
           <span class="bg-white text-blue-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-blue-100">
             {{ formatNextDate(entry.nextAppointmentDate) }}
           </span>
        </div>
      </div>
    </div>

  </div>
</template>