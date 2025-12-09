<script setup lang="ts">
import { computed } from 'vue';
import { useOdontogramStore } from '@/stores/odontogram';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import type { Tooth, ToothSurfaceState, ToothState, DentalBridge } from '@/types';
import { ToothStatus } from '@/types';
import { translateStatus } from '@/utils/formatters';

const props = defineProps<{
  toothNumber: number | null;
}>();

const emit = defineEmits([
  'delete-surface', 
  'delete-whole-tooth', 
  'delete-tooth-state', 
  'close'
]);

const route = useRoute();
const odontogramStore = useOdontogramStore();
const { surfaces, wholeTeeth, toothStates, bridges } = storeToRefs(odontogramStore);

// --- ESTADOS DEL DIENTE SELECCIONADO ---
const currentSurfaces = computed(() => {
  if (!props.toothNumber) return [];
  const toothSurfaces = surfaces.value[props.toothNumber];
  if (!toothSurfaces) return [];
  return Object.values(toothSurfaces).filter(s => s.status !== ToothStatus.HEALTHY);
});

const currentWholeTooth = computed(() => {
  if (!props.toothNumber) return null;
  const tooth = wholeTeeth.value[props.toothNumber];
  return tooth && tooth.status !== ToothStatus.HEALTHY ? tooth : null;
});

const currentToothStates = computed(() => {
  if (!props.toothNumber) return [];
  return toothStates.value[props.toothNumber] || [];
});

// --- LISTA DE PUENTES (LÓGICA CORREGIDA) ---
const patientBridges = computed(() => {
  const allBridges = bridges.value || [];
  
  // Si no hay un diente específico seleccionado (Gestión General), mostramos todos
  if (!props.toothNumber) {
    return allBridges;
  }

  // Si hay un diente seleccionado, filtramos solo los puentes que lo INVOLUCRAN
  // Un diente está involucrado si está dentro del rango [startTooth, endTooth]
  return allBridges.filter(bridge => 
    props.toothNumber! >= bridge.startTooth && props.toothNumber! <= bridge.endTooth
  );
});

function onDeleteSurface(surface: ToothSurfaceState) {
  emit('delete-surface', surface);
}

function onDeleteWholeTooth(tooth: Tooth) {
  emit('delete-whole-tooth', tooth);
}

function onDeleteToothState(state: ToothState) {
  emit('delete-tooth-state', state);
}

// --- BORRAR PUENTE ---
async function onDeleteBridge(bridge: DentalBridge) {
  const patientId = route.params.id as string;
  if (confirm(`¿Estás seguro de eliminar el puente del diente ${bridge.startTooth} al ${bridge.endTooth}?`)) {
    await odontogramStore.removeBridge(patientId, bridge.id);
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
    
    <div class="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
      <h3 class="font-bold text-gray-700">
        <span v-if="toothNumber">Gestión de Estados - Diente {{ toothNumber }}</span>
        <span v-else>Gestión General</span>
      </h3>
      <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
    </div>

    <div class="p-4 overflow-y-auto space-y-6 custom-scrollbar">
      
      <div v-if="!toothNumber && patientBridges.length === 0" class="text-center text-gray-500 py-4">
        Selecciona un diente para ver sus estados o crea un puente para gestionarlo aquí.
      </div>

      <!-- SECCIÓN 1: ESTADOS DEL DIENTE SELECCIONADO -->
      <div v-if="toothNumber">
        
        <div v-if="currentSurfaces.length === 0 && !currentWholeTooth && currentToothStates.length === 0 && patientBridges.length === 0" class="text-center text-gray-400 italic mb-4 text-sm">
          Este diente no tiene estados registrados.
        </div>

        <!-- Superficies -->
        <div v-if="currentSurfaces.length > 0" class="space-y-2">
          <h4 class="text-xs font-bold text-gray-400 uppercase border-b pb-1">Superficies</h4>
          <ul class="divide-y divide-gray-100">
            <li v-for="surface in currentSurfaces" :key="surface.id" class="py-2 flex justify-between items-center">
              <span class="text-sm">
                <span class="font-semibold capitalize">{{ surface.surface }}:</span> {{ translateStatus(surface.status) }}
              </span>
              <button @click="onDeleteSurface(surface)" class="btn-delete-small">X</button>
            </li>
          </ul>
        </div>

        <!-- Diente Completo -->
        <div v-if="currentWholeTooth" class="space-y-2 mt-4">
          <h4 class="text-xs font-bold text-gray-400 uppercase border-b pb-1">Diente Completo</h4>
          <div class="py-2 flex justify-between items-center">
            <span class="text-sm font-semibold">{{ translateStatus(currentWholeTooth.status) }}</span>
            <button @click="onDeleteWholeTooth(currentWholeTooth)" class="btn-delete-small">X</button>
          </div>
        </div>

        <!-- Tratamientos / Estados Complejos -->
        <div v-if="currentToothStates.length > 0" class="space-y-2 mt-4">
          <h4 class="text-xs font-bold text-gray-400 uppercase border-b pb-1">Tratamientos / Estados</h4>
          <ul class="divide-y divide-gray-100">
            <li v-for="state in currentToothStates" :key="state.id" class="py-2 flex justify-between items-center">
              <span class="text-sm text-purple-900">
                {{ state.abbreviation }} - {{ state.sub_type || state.condition }} 
                <span class="text-xs text-gray-500">({{ state.status }})</span>
              </span>
              <button @click="onDeleteToothState(state)" class="btn-delete-small">X</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- SECCIÓN 2: GESTIÓN DE PUENTES -->
      <!-- Ahora filtrado: Solo muestra puentes si el diente seleccionado es parte de ellos -->
      <div v-if="patientBridges.length > 0" class="pt-4 border-t border-gray-200 mt-4">
        <h4 class="text-xs font-bold text-gray-500 uppercase border-b pb-1 mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Puentes Dentales {{ toothNumber ? '(Involucrados)' : '' }}
        </h4>
        
        <div class="space-y-2">
          <div v-for="bridge in patientBridges" :key="bridge.id" class="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-100">
            <div class="flex flex-col">
              <span class="text-sm font-bold text-blue-800">
                Diente {{ bridge.startTooth }} ↔ {{ bridge.endTooth }}
              </span>
              <span class="text-[10px] text-gray-500 uppercase">{{ bridge.type }} • {{ bridge.color === 'blue' ? 'Buen Estado' : 'Defectuoso' }}</span>
            </div>
            <button 
              @click="onDeleteBridge(bridge)" 
              class="btn-delete-small bg-white border border-red-200 text-red-600 hover:bg-red-50"
              title="Eliminar Puente"
            >
              X
            </button>
          </div>
        </div>
      </div>

    </div>

    <div class="flex justify-end p-4 bg-gray-50 border-t">
      <button @click="emit('close')" class="btn-secondary">Cerrar</button>
    </div>
  </div>
</template>

<style scoped>
.btn-delete-small {
  @apply w-6 h-6 flex items-center justify-center bg-red-100 text-red-700 rounded-full font-bold text-xs hover:bg-red-200 transition-colors cursor-pointer border-none;
}
.btn-secondary { 
  @apply px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold shadow-sm transition-colors; 
}

/* Scrollbar fino */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
</style>