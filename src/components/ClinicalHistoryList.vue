<script setup lang="ts">
import type { ClinicalHistoryEntry } from '@/types';

defineProps<{
  entries: ClinicalHistoryEntry[];
}>();

const emit = defineEmits(['view-entry']);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  // Ajuste para evitar problemas de zona horaria si es solo fecha YYYY-MM-DD
  const date = new Date(dateString);
  // Si la fecha viene sin hora (ej. "2023-11-20"), new Date() la asume UTC 00:00
  // y toLocaleDateString en zona horaria local (ej. -5) podría mostrar el día anterior.
  // Este hack simple usa la zona horaria UTC para formatear fechas puras, 
  // o puedes usar date-fns/moment si prefieres algo más robusto.
  // Para este caso simple, usaremos timezone UTC para asegurar que se vea el día correcto si viene como ISO date.
  return date.toLocaleDateString('es-PE', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
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
      class="p-4 border rounded-lg bg-gray-50 cursor-pointer hover:shadow-md hover:border-primary transition-all relative overflow-hidden"
    >
      <!-- Borde izquierdo de color para destacar -->
      <div class="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>

      <!-- Encabezado de la Entrada -->
      <div class="flex justify-between items-center mb-3 pl-3 border-b border-gray-200 pb-2">
        <p class="font-bold text-primary text-lg capitalize">{{ formatDate(entry.entryDate) }}</p>
        <div class="text-right">
           <p class="text-xs text-text-light">Atendido por:</p>
           <p class="text-sm font-medium text-text-dark">{{ entry.user.fullName }}</p>
        </div>
      </div>

      <div class="space-y-3 pl-3">
        <!-- Motivo -->
        <div>
          <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Motivo</h4>
          <p class="text-text-dark font-medium">{{ entry.description }}</p>
        </div>

        <!-- Evolución (Solo si existe) -->
        <div v-if="entry.evolution">
          <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Evolución</h4>
          <p class="text-text-light text-sm line-clamp-3">{{ entry.evolution }}</p>
        </div>

        <!-- Tratamiento (Solo si existe) -->
        <div v-if="entry.treatmentPerformed">
          <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Tratamiento</h4>
          <p class="text-text-light text-sm">{{ entry.treatmentPerformed }}</p>
        </div>

        <!-- --- SECCIÓN NUEVA: PRÓXIMA CITA --- -->
        <div v-if="entry.nextAppointmentPlan || entry.nextAppointmentDate" class="mt-4 pt-3 border-t border-gray-200 bg-blue-50 -mx-4 px-4 py-2 rounded-b-lg">
           <div class="flex items-start gap-2">
             <!-- Icono Calendario -->
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
             <div class="w-full">
               <h4 class="text-sm font-bold text-blue-700 mb-1">Planificación Próxima Cita</h4>
               
               <div v-if="entry.nextAppointmentPlan" class="text-sm text-gray-800 mb-1">
                 {{ entry.nextAppointmentPlan }}
               </div>
               
               <div v-if="entry.nextAppointmentDate" class="text-xs text-blue-600 font-medium flex items-center gap-1">
                 <span>Fecha sugerida:</span>
                 <span class="bg-white px-2 py-0.5 rounded border border-blue-200">
                   {{ formatDate(entry.nextAppointmentDate) }}
                 </span>
               </div>
             </div>
           </div>
        </div>
        <!-- --- FIN SECCIÓN NUEVA --- -->

      </div>
    </div>
  </div>
</template>