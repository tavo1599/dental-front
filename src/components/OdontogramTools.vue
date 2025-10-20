<script setup lang="ts">
import { ref } from 'vue';
import type { ToothStatus, ToothState } from '@/types';
import { ToothStatus as TS } from '@/types';

const emit = defineEmits(['select-surface-status', 'select-tooth-state', 'clear-selection']);

// Estado local para los botones (bueno/malo)
const currentCondition = ref<'bueno' | 'malo'>('bueno');

// Función para los nuevos botones (Tratamiento Pulpar)
function selectToothState(condition: string, sub_type: string, abbreviation: string) {
  const payload: Partial<ToothState> = {
    condition: condition,
    sub_type: sub_type,
    abbreviation: abbreviation,
    status: currentCondition.value,
  };
  emit('select-tooth-state', payload);
}

// Función para los botones del sistema antiguo (Caries, Resina)
function selectSurfaceStatus(status: ToothStatus) {
  emit('select-surface-status', status);
}

function clearSelection() {
  emit('clear-selection');
}
</script>

<template>
  <div class="p-4 bg-white rounded-lg shadow-md">
    <h3 class="text-lg font-semibold text-text-dark mb-4">Herramientas de Diagnóstico</h3>

    <!-- Selector de Estado (Bueno/Malo) -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">1. Seleccione el Estado:</label>
      <div class="flex">
        <button
          @click="currentCondition = 'bueno'"
          :class="['flex-1 p-2 text-sm rounded-l-md transition-colors', currentCondition === 'bueno' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700']"
        >
          Buen Estado
        </button>
        <button
          @click="currentCondition = 'malo'"
          :class="['flex-1 p-2 text-sm rounded-r-md transition-colors', currentCondition === 'malo' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700']"
        >
          Mal Estado / Defectuoso
        </button>
      </div>
    </div>

    <p class="text-sm font-medium text-gray-700 mb-2">2. Seleccione la Condición a aplicar:</p>

    <!-- NUEVA SECCIÓN: TRATAMIENTOS PULPARES -->
    <div class="mb-4">
      <h4 class="font-semibold text-gray-800 mb-2">Tratamientos Pulpares (Top Box)</h4>
      <div class="grid grid-cols-2 gap-2">
        <button @click="selectToothState('Tratamiento Pulpar', 'Tratamiento de Conducto', 'TC')" class="palette-btn-new">
          T. de Conducto (TC)
        </button>
        <button @click="selectToothState('Tratamiento Pulpar', 'Pulpotomía', 'PP')" class="palette-btn-new">
          Pulpotomía (PP)
        </button>
        <button @click="selectToothState('Tratamiento Pulpar', 'Necropulpectomía', 'N')" class="palette-btn-new">
          Necropulpectomía (N)
        </button>
        <button @click="selectToothState('Tratamiento Pulpar', 'Biopulpectomía', 'B')" class="palette-btn-new">
          Biopulpectomía (B)
        </button>
      </div>
    </div>
    <!-- FIN DE LA NUEVA SECCIÓN -->

    <!-- SECCIONES ANTIGUAS (Sin cambios) -->
    <div class="mb-4">
      <h4 class="font-semibold text-gray-800 mb-2">Restauraciones (Caras)</h4>
      <div class="grid grid-cols-2 gap-2">
        <button @click="selectSurfaceStatus(TS.FILLED)" class="palette-btn bg-blue-500">Restauración</button>
        <button @click="selectSurfaceStatus(TS.SEALANT)" class="palette-btn bg-orange-500">Sellante</button>
      </div>
    </div>

    <div class="mb-4">
      <h4 class="font-semibold text-gray-800 mb-2">Diagnóstico (Caras)</h4>
      <div class="grid grid-cols-2 gap-2">
        <button @click="selectSurfaceStatus(TS.CARIES)" class="palette-btn bg-red-500">Caries</button>
        <button @click="selectSurfaceStatus(TS.FRACTURE)" class="palette-btn bg-yellow-500">Fractura</button>
      </div>
    </div>
    
    <div class="mb-4">
      <h4 class="font-semibold text-gray-800 mb-2">Diente Completo (Antiguo)</h4>
      <!-- Tus botones antiguos de Ausente, Corona, etc. irían aquí, llamando a selectSurfaceStatus -->
    </div>

    <button @click="clearSelection" class="btn-secondary w-full">Limpiar Selección</button>
  </div>
</template>

<style scoped>
.palette-btn {
  @apply p-2 rounded-md text-white font-semibold text-sm shadow-sm hover:opacity-80;
}
.palette-btn-new {
  @apply p-2 rounded-md bg-purple-600 text-white font-semibold text-sm shadow-sm hover:bg-purple-700;
}
.btn-secondary {
  @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold;
}
</style>