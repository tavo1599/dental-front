<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useOdontogramStore } from '@/stores/odontogram';
import { ToothStatus, type Tooth, type ToothSurfaceState, type ToothState } from '@/types';
import StatusSelector from '@/components/StatusSelector.vue';
import ToothComponent from '@/components/Tooth.vue';
import TreatmentPlanner from './TreatmentPlanner.vue';
import { translateStatus } from '@/utils/formatters';
import OdontogramLegend from './OdontogramLegend.vue';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  wholeTeeth: Record<number, Tooth>;
  surfaces: Record<number, Record<string, ToothSurfaceState>>;
  patientAge: number;
  userRole?: string;
}>();

const route = useRoute();
const odontogramStore = useOdontogramStore();
const { toothStates } = storeToRefs(odontogramStore);

// --- ESTADO LOCAL PARA EL DIENTE SELECCIONADO ---
const selectedToothNumber = ref<number | null>(null);

const selectionMode = ref(false);
const selectedSurfaces = ref<{ toothNumber: number, surface: string }[]>([]);
const bulkStatus = ref<ToothStatus | null>(null);
const odontogramType = ref('permanent');

watchEffect(() => {
  odontogramType.value = props.patientAge < 12 ? 'pediatric' : 'permanent';
});

const permanentQuadrants = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerRight: [41, 42, 43, 44, 45, 46, 47, 48],
  lowerLeft: [38, 37, 36, 35, 34, 33, 32, 31],
};
const pediatricQuadrants = {
  upperRight: [55, 54, 53, 52, 51],
  upperLeft: [61, 62, 63, 64, 65],
  lowerRight: [81, 82, 83, 84, 85],
  lowerLeft: [75, 74, 73, 72, 71],
};

const isSelectorOpen = ref(false);
const isPlannerOpen = ref(false);
const selectorPosition = ref({ top: '0px', left: '0px', transform: '' });
const plannerPosition = ref({ top: '0px', left: '0px' });
const selectedToothInfo = ref<{ toothNumber: number, surface: string } | null>(null);
const selectedSurfaceStateId = ref('');

const surfaceStatuses = [ 
  ToothStatus.HEALTHY, ToothStatus.CARIES, ToothStatus.FILLED, 
  ToothStatus.FILLED_DEFECTIVE, ToothStatus.SEALANT, 
  ToothStatus.SEALANT_DEFECTIVE, ToothStatus.FRACTURE, ToothStatus.DISCHROMIA
];

let clickTimer: number | null = null;

// --- COMPUTED PARA LOS ESTADOS DEL DIENTE SELECCIONADO ---
// Esto pasará los estados existentes al StatusSelector
const selectedToothExistingStates = computed(() => {
  if (!selectedToothNumber.value) return [];
  return toothStates.value[selectedToothNumber.value] || [];
});

function handleSurfaceClick(toothNumber: number, surfaceData: { surface: string, event: MouseEvent }) {
  if (props.userRole !== 'admin' && props.userRole !== 'dentist') return;
  if (selectionMode.value) {
    toggleSurfaceSelection(toothNumber, surfaceData.surface);
    return;
  }

  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }

  clickTimer = window.setTimeout(() => {
    const state = props.surfaces[toothNumber]?.[surfaceData.surface];
    if (state && state.id) {
      selectedSurfaceStateId.value = state.id;
      plannerPosition.value = { top: `${surfaceData.event.clientY + 10}px`, left: `${surfaceData.event.clientX}px` };
      isPlannerOpen.value = true;
    } else {
      openSelector(toothNumber, surfaceData);
    }
  }, 250);
}

function handleSurfaceDoubleClick(toothNumber: number, surfaceData: { surface: string, event: MouseEvent }) {
  if (props.userRole !== 'admin' && props.userRole !== 'dentist') return;

  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }
  
  // Guardamos el número de diente para pasarlo al selector
  selectedToothNumber.value = toothNumber; 
  openSelector(toothNumber, surfaceData);
}

function openSelector(toothNumber: number, surfaceData: { surface: string, event: MouseEvent }) {
  selectedToothInfo.value = { toothNumber, surface: surfaceData.surface };
  const clickX = surfaceData.event.clientX;
  const screenWidth = window.innerWidth;

  if (clickX > screenWidth / 2) {
    selectorPosition.value = {
      top: `${surfaceData.event.clientY + 10}px`,
      left: `${clickX}px`,
      transform: 'translateX(-100%)',
    };
  } else {
    selectorPosition.value = {
      top: `${surfaceData.event.clientY + 10}px`,
      left: `${clickX}px`,
      transform: '',
    };
  }
  isSelectorOpen.value = true;
}

function toggleSurfaceSelection(toothNumber: number, surface: string) {
  const index = selectedSurfaces.value.findIndex(s => s.toothNumber === toothNumber && s.surface === surface);
  if (index > -1) {
    selectedSurfaces.value.splice(index, 1);
  } else {
    selectedSurfaces.value.push({ toothNumber, surface });
  }
}

const isSurfaceSelected = (toothNumber: number, surface: string): boolean => {
  return selectedSurfaces.value.some(s => s.toothNumber === toothNumber && s.surface === surface);
};

function applyBulkUpdate() {
  if (!bulkStatus.value || selectedSurfaces.value.length === 0) return;
  const patientId = route.params.id as string;
  const status = bulkStatus.value;
  
  let updates: any[] = [];
  if (surfaceStatuses.includes(status)) {
    updates = selectedSurfaces.value.map(s => ({ 
      toothNumber: s.toothNumber, 
      surface: s.surface,
      status: status
    }));
  } else {
    const uniqueTeeth = [...new Set(selectedSurfaces.value.map(s => s.toothNumber))];
    updates = uniqueTeeth.map(toothNumber => ({
      toothNumber: toothNumber,
      status: status,
    }));
  }

  odontogramStore.updateOdontogram(patientId, updates);
  
  selectedSurfaces.value = [];
  bulkStatus.value = null;
  selectionMode.value = false;
}

// MANEJADOR DE EVENTO ANTIGUO (Superficies)
function handleStatusUpdate(newStatus: ToothStatus) {
  if (selectedToothInfo.value) {
    const patientId = route.params.id as string;
    const { toothNumber, surface } = selectedToothInfo.value;
    
    let updatePayload: any = {
      toothNumber,
      status: newStatus,
    };

    if (surfaceStatuses.includes(newStatus)) {
      updatePayload.surface = surface;
    }

    odontogramStore.updateOdontogram(patientId, [updatePayload]);
  }
  isSelectorOpen.value = false;
}

// NUEVO MANEJADOR DE EVENTO (Top Box)
function handleStateUpdate(state: Partial<ToothState>) {
  if (selectedToothInfo.value) {
    const patientId = route.params.id as string;
    const payload = {
      ...state,
      toothNumber: selectedToothInfo.value.toothNumber,
    };
    odontogramStore.saveToothState(patientId, payload);
  }
  isSelectorOpen.value = false;
}

// --- NUEVA FUNCIÓN PARA BORRAR ---
function handleStateDelete(stateToDelete: ToothState) {
  const patientId = route.params.id as string;
  odontogramStore.clearToothState(patientId, stateToDelete.id, stateToDelete.toothNumber);
  // No cerramos el selector para que pueda borrar varios
}
</script>

<template>
  <div class="p-4 bg-gray-50 rounded-lg relative">
    <div class="flex justify-between items-center mb-6">
      <div class="flex rounded-lg bg-gray-200 p-1 w-max">
        <button @click="odontogramType = 'permanent'" :class="[odontogramType === 'permanent' ? 'bg-white shadow' : 'text-gray-600', 'px-4 py-1 rounded-md font-semibold text-sm transition-colors']">Permanente</button>
        <button @click="odontogramType = 'pediatric'" :class="[odontogramType === 'pediatric' ? 'bg-white shadow' : 'text-gray-600', 'px-4 py-1 rounded-md font-semibold text-sm transition-colors']">Temporal</button>
      </div>
      <div class="flex items-center space-x-2">
        <label for="multiSelectToggle" class="text-sm font-medium text-text-dark">Selección Múltiple</label>
        <input v-model="selectionMode" @change="selectedSurfaces = []" type="checkbox" :disabled="userRole !== 'admin' && userRole !== 'dentist'" id="multiSelectToggle" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
      </div>
    </div>
    
    <div v-if="wholeTeeth && surfaces">
      <div v-if="odontogramType === 'permanent'" class="space-y-4">
        <div class="flex justify-center items-center gap-2">
          <div v-for="tooth in permanentQuadrants.upperRight" :key="tooth" class="w-16 h-16">
            <ToothComponent 
              :tooth-number="tooth" 
              :whole-status="wholeTeeth[tooth]?.status" 
              :surface-states="surfaces[tooth]" 
              :tooth-states="toothStates[tooth]"
              :is-selected="isSurfaceSelected" 
              @surface-click="handleSurfaceClick(tooth, $event)"  
              @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" 
            />
          </div>
          <div class="w-px bg-gray-400 self-stretch mx-4"></div>
          <div v-for="tooth in permanentQuadrants.upperLeft" :key="tooth" class="w-16 h-16">
            <ToothComponent 
              :tooth-number="tooth" 
              :whole-status="wholeTeeth[tooth]?.status" 
              :surface-states="surfaces[tooth]" 
              :tooth-states="toothStates[tooth]"
              :is-selected="isSurfaceSelected" 
              @surface-click="handleSurfaceClick(tooth, $event)"  
              @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" 
            />
          </div>
        </div>
        <hr class="my-4 border-gray-400 w-full max-w-5xl mx-auto">
        <div class="flex justify-center items-center gap-2">
          <div v-for="tooth in permanentQuadrants.lowerRight.slice().reverse()" :key="tooth" class="w-16 h-16">
            <ToothComponent 
              :tooth-number="tooth" 
              :whole-status="wholeTeeth[tooth]?.status" 
              :surface-states="surfaces[tooth]" 
              :tooth-states="toothStates[tooth]"
              :is-selected="isSurfaceSelected" 
              @surface-click="handleSurfaceClick(tooth, $event)"  
              @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" 
            />
          </div>
          <div class="w-px bg-gray-400 self-stretch mx-4"></div>
          <div v-for="tooth in permanentQuadrants.lowerLeft.slice().reverse()" :key="tooth" class="w-16 h-16">
            <ToothComponent 
              :tooth-number="tooth" 
              :whole-status="wholeTeeth[tooth]?.status" 
              :surface-states="surfaces[tooth]" 
              :tooth-states="toothStates[tooth]"
              :is-selected="isSurfaceSelected" 
              @surface-click="handleSurfaceClick(tooth, $event)"  
              @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" 
            />
          </div>
        </div>
      </div>
      
      <div v-if="odontogramType === 'pediatric'" class="space-y-4">
        <div class="flex justify-center items-center gap-2">
          <div v-for="tooth in pediatricQuadrants.upperRight" :key="tooth" class="w-12 h-12">
            <ToothComponent :tooth-number="tooth" :whole-status="wholeTeeth[tooth]?.status" :surface-states="surfaces[tooth]" :tooth-states="toothStates[tooth]" :is-selected="isSurfaceSelected" @surface-click="handleSurfaceClick(tooth, $event)"  @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" />
          </div>
          <div class="w-px bg-gray-400 self-stretch mx-2"></div>
          <div v-for="tooth in pediatricQuadrants.upperLeft" :key="tooth" class="w-12 h-12">
            <ToothComponent :tooth-number="tooth" :whole-status="wholeTeeth[tooth]?.status" :surface-states="surfaces[tooth]" :tooth-states="toothStates[tooth]" :is-selected="isSurfaceSelected" @surface-click="handleSurfaceClick(tooth, $event)"  @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" />
          </div>
        </div>
        <hr class="my-4 border-gray-400 w-full max-w-xl mx-auto">
        <div class="flex justify-center items-center gap-2">
          <div v-for="tooth in pediatricQuadrants.lowerRight.slice().reverse()" :key="tooth" class="w-12 h-12">
            <ToothComponent :tooth-number="tooth" :whole-status="wholeTeeth[tooth]?.status" :surface-states="surfaces[tooth]" :tooth-states="toothStates[tooth]" :is-selected="isSurfaceSelected" @surface-click="handleSurfaceClick(tooth, $event)"  @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" />
          </div>
          <div class="w-px bg-gray-400 self-stretch mx-2"></div>
          <div v-for="tooth in pediatricQuadrants.lowerLeft.slice().reverse()" :key="tooth" class="w-12 h-12">
            <ToothComponent :tooth-number="tooth" :whole-status="wholeTeeth[tooth]?.status" :surface-states="surfaces[tooth]" :tooth-states="toothStates[tooth]" :is-selected="isSurfaceSelected" @surface-click="handleSurfaceClick(tooth, $event)"  @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" />
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-10 text-text-light">
      Cargando datos del odontograma...
    </div>

    <div v-if="selectionMode && selectedSurfaces.length > 0" class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg flex items-center gap-4 border z-20">
      <span class="font-semibold text-text-dark whitespace-nowrap">{{ selectedSurfaces.length }} sup. seleccionada(s)</span>
      <select v-model="bulkStatus" class="input-style text-sm">
        <option :value="null">Cambiar a...</option>
        <option v-for="status in ToothStatus" :key="status" :value="status">{{ translateStatus(status) }}</option>
      </select>
      <button @click="applyBulkUpdate" class="btn-primary text-sm" :disabled="!bulkStatus">Aplicar</button>
    </div>

    <OdontogramLegend />

    <StatusSelector 
      v-if="isSelectorOpen" 
      :style="selectorPosition" 
      :existing-states="selectedToothExistingStates"
      @select-status="handleStatusUpdate"
      @select-state="handleStateUpdate"
      @delete-state="handleStateDelete"
      @close="isSelectorOpen = false" 
    />
    
    <TreatmentPlanner 
      v-if="isPlannerOpen"
      :style="plannerPosition"
      :patient-id="route.params.id as string"
      :tooth-surface-state-id="selectedSurfaceStateId"
      @close="isPlannerOpen = false"
    />
  </div>
</template>

<style scoped>
.input-style { @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold disabled:bg-opacity-50 disabled:cursor-not-allowed; }
</style>