<script setup lang="ts">
import { ref } from 'vue';
import { ToothStatus, type ToothState } from '@/types';
import { translateStatus, getStatusButtonClass } from '@/utils/formatters';

const props = defineProps<{
  // 1. AÑADIMOS LA NUEVA PROP
  // Recibe la lista de estados del "Top Box" que ya tiene el diente
  existingStates: ToothState[];
}>();

const emit = defineEmits(['select-status', 'select-state', 'delete-state', 'close']);

// Estado local para los botones (bueno/malo)
const currentCondition = ref<'bueno' | 'malo'>('bueno');

// Evento para el "Top Box" (Tratamiento Pulpar)
function selectToothState(condition: string, sub_type: string, abbreviation: string) {
  const payload: Partial<ToothState> = {
    condition: condition,
    sub_type: sub_type,
    abbreviation: abbreviation,
    status: currentCondition.value,
  };
  emit('select-state', payload);
}

// Evento para las Superficies (Caries, Resina)
function selectSurfaceStatus(status: ToothStatus) {
  emit('select-status', status);
}

// Listas de estados (de tu código anterior)
const surfaceStatuses = [ 
  ToothStatus.HEALTHY, ToothStatus.CARIES, ToothStatus.FILLED, 
  ToothStatus.FILLED_DEFECTIVE, ToothStatus.SEALANT, 
  ToothStatus.SEALANT_DEFECTIVE, ToothStatus.FRACTURE, ToothStatus.DISCHROMIA
];
const wholeToothStatuses = [ 
  ToothStatus.CROWN, ToothStatus.CROWN_DEFECTIVE, ToothStatus.TEMPORARY_CROWN,
  ToothStatus.ENDODONTICS, ToothStatus.IMPLANT, ToothStatus.PONTIC, 
  ToothStatus.EXTRACTION_NEEDED, ToothStatus.EXTRACTED, ToothStatus.SUPERNUMERARY
];
</script>

<template>
  <div class="fixed bg-white rounded-lg shadow-xl border z-50 w-96">
    <div class="flex">
      <button
        @click="currentCondition = 'bueno'"
        :class="['flex-1 p-2 text-sm font-semibold', currentCondition === 'bueno' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700']"
      >
        Buen Estado
      </button>
      <button
        @click="currentCondition = 'malo'"
        :class="['flex-1 p-2 text-sm font-semibold', currentCondition === 'malo' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700']"
      >
        Mal Estado
      </button>
    </div>

    <div class="p-3">
      <div v-if="existingStates && existingStates.length > 0">
        <h4 class="text-xs font-bold text-gray-400 px-2 py-1 border-b">Estados Actuales (Top Box)</h4>
        <div class="max-h-24 overflow-y-auto">
          <div v-for="state in existingStates" :key="state.id" class="flex justify-between items-center group pr-1">
            <span 
              :class="['text-sm p-1.5', state.status === 'bueno' ? 'text-blue-600' : 'text-red-600']"
            >
              {{ state.abbreviation }} - {{ state.sub_type }}
            </span>
            <button 
              @click="emit('delete-state', state)" 
              class="p-1 rounded-full text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-100"
              title="Eliminar este estado"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <hr class="my-2">
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <h4 class="text-xs font-bold text-gray-400 px-2 py-1 border-b">Tratamiento Pulpar</h4>
          <button @click="selectToothState('Tratamiento Pulpar', 'T. de Conducto', 'TC')" class="palette-btn-new">T. de Conducto (TC)</button>
          <button @click="selectToothState('Tratamiento Pulpar', 'Pulpotomía', 'PP')" class="palette-btn-new">Pulpotomía (PP)</button>
          <button @click="selectToothState('Tratamiento Pulpar', 'Necropulpectomía', 'N')" class="palette-btn-new">Necropulpectomía (N)</button>
          <button @click="selectToothState('Tratamiento Pulpar', 'Biopulpectomía', 'B')" class="palette-btn-new">Biopulpectomía (B)</button>
          
          <h4 class="text-xs font-bold text-gray-400 px-2 py-1 border-b mt-2">Superficies</h4>
          <button v-for="status in surfaceStatuses" :key="status" @click="selectSurfaceStatus(status)"
            class="w-full px-3 py-1.5 text-sm text-left rounded-md whitespace-nowrap transition-colors"
            :class="getStatusButtonClass(status)">
            {{ translateStatus(status) }}
          </button>
        </div>
        <div>
          <h4 class="text-xs font-bold text-gray-400 px-2 py-1 border-b">Diente Completo</h4>
          <button v-for="status in wholeToothStatuses" :key="status" @click="selectSurfaceStatus(status)"
            class="w-full px-3 py-1.5 text-sm text-left rounded-md whitespace-nowrap transition-colors"
            :class="getStatusButtonClass(status)">
            {{ translateStatus(status) }}
          </button>
        </div>
      </div>
    </div>
    <button @click="emit('close')" class="w-full p-1 text-xs text-text-light hover:underline bg-gray-50">Cerrar</button>
  </div>
</template>

<style scoped>
.palette-btn-new {
  @apply w-full px-3 py-1.5 text-sm text-left rounded-md whitespace-nowrap transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200;
}
/* Estilos para que los botones de tu sistema antiguo se vean bien */
.palette-btn {
  @apply p-2 rounded-md text-white font-semibold text-xs shadow-sm hover:opacity-80;
}
</style>