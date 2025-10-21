<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ToothStatus, type ToothState } from '@/types';
import { translateStatus, getStatusButtonClass } from '@/utils/formatters';

defineProps<{}>();

const emit = defineEmits(['select-status', 'select-state', 'open-delete-manager', 'close']);

const currentCondition = ref<'bueno' | 'malo'>('bueno');
const selectorEl = ref<HTMLDivElement | null>(null);

/**
 * [NUEVO] Esta es la función clave.
 * Realiza dos acciones al seleccionar un tratamiento pulpar:
 * 1. Emite 'select-state' para guardar la información detallada en el "Top Box".
 * 2. Emite 'select-status' con 'ENDODONTICS' para que el diente se marque visualmente
 * y se pueda hacer clic en él para planear tratamientos futuros (como una corona).
 */
function selectPulpTreatment(sub_type: string, abbreviation: string) {
  // Acción 1: Guardar el estado detallado en el "Top Box".
  emit('select-state', {
    condition: 'Tratamiento Pulpar',
    sub_type: sub_type,
    abbreviation: abbreviation,
    status: currentCondition.value,
  });

  // Acción 2: Guardar el estado visual en el diente completo.
  emit('select-status', ToothStatus.ENDODONTICS);
}

// --- El resto de las funciones permanecen igual ---

const handleClickOutside = (event: MouseEvent) => {
  if (selectorEl.value && !selectorEl.value.contains(event.target as Node)) {
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

function selectSurfaceStatus(status: ToothStatus) {
  emit('select-status', status);
}

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
  <div ref="selectorEl" class="fixed bg-white rounded-lg shadow-xl border z-50 w-[48rem] max-w-[90vw] flex flex-col max-h-[80vh]">
    
    <!-- Header (Bueno/Malo) -->
    <div class="flex-shrink-0">
      <div class="flex">
        <button
          @click="currentCondition = 'bueno'"
          :class="['flex-1 p-2 text-sm font-semibold rounded-tl-lg', currentCondition === 'bueno' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700']"
        >
          Buen Estado
        </button>
        <button
          @click="currentCondition = 'malo'"
          :class="['flex-1 p-2 text-sm font-semibold rounded-tr-lg', currentCondition === 'malo' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700']"
        >
          Mal Estado
        </button>
      </div>
    </div>

    <!-- Contenido Principal con Scroll -->
    <div class="overflow-y-auto p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <!-- Columna 1: Tratamiento Pulpar -->
        <div>
          <h4 class="text-xs font-bold text-gray-400 px-2 py-1 border-b">Tratamiento Pulpar</h4>
          <!-- [MODIFICADO] Estos botones ahora llaman a la nueva función 'selectPulpTreatment' -->
          <button @click="selectPulpTreatment('T. de Conducto', 'TC')" class="palette-btn-new">T. de Conducto (TC)</button>
          <button @click="selectPulpTreatment('Pulpotomía', 'PP')" class="palette-btn-new">Pulpotomía (PP)</button>
          <button @click="selectPulpTreatment('Necropulpectomía', 'N')" class="palette-btn-new">Necropulpectomía (N)</button>
          <button @click="selectPulpTreatment('Biopulpectomía', 'B')" class="palette-btn-new">Biopulpectomía (B)</button>
        </div>
        
        <!-- Columna 2: Superficies -->
        <div>
          <h4 class="text-xs font-bold text-gray-400 px-2 py-1 border-b">Superficies</h4>
          <button v-for="status in surfaceStatuses" :key="status" @click="selectSurfaceStatus(status)"
            class="w-full px-3 py-1.5 text-sm text-left rounded-md whitespace-nowrap transition-colors"
            :class="getStatusButtonClass(status)">
            {{ translateStatus(status) }}
          </button>
        </div>

        <!-- Columna 3: Diente Completo -->
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
    
    <!-- Footer (Cerrar / Borrar) -->
    <div class="flex-shrink-0 flex items-center border-t bg-gray-50">
      <button 
        @click="emit('open-delete-manager')" 
        class="w-1/2 p-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors rounded-bl-lg"
      >
        Borrar Estados...
      </button>
      <div class="w-px h-6 bg-gray-300"></div>
      <button 
        @click="emit('close')" 
        class="w-1/2 p-2 text-sm text-text-light hover:bg-gray-100 transition-colors rounded-br-lg"
      >
        Cerrar
      </button>
    </div>
    
  </div>
</template>

<style scoped>
.palette-btn-new {
  @apply w-full px-3 py-1.5 text-sm text-left rounded-md whitespace-nowrap transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200;
}
</style>