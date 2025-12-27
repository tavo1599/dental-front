<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useOdontogramStore } from '@/stores/odontogram';
import { ToothStatus, type Tooth, type ToothSurfaceState, type ToothState } from '@/types';
import StatusSelector from '@/components/StatusSelector.vue';
import ToothComponent from '@/components/Tooth.vue';
import TreatmentPlanner from './TreatmentPlanner.vue';
import OdontogramLegend from './OdontogramLegend.vue';
import DeleteStateModal from './DeleteStateModal.vue';
import { translateStatus } from '@/utils/formatters';
import { storeToRefs } from 'pinia';
import { OdontogramRecordType } from '@/types';

const props = defineProps<{
  wholeTeeth: Record<number, Tooth>;
  surfaces: Record<number, Record<string, ToothSurfaceState>>;
  patientAge: number;
  userRole?: string;
}>();

const route = useRoute();
const odontogramStore = useOdontogramStore();
const { toothStates, bridges, currentRecordType } = storeToRefs(odontogramStore);

const selectedToothNumber = ref<number | null>(null);
const selectionMode = ref(false);
const selectedSurfaces = ref<{ toothNumber: number, surface: string }[]>([]);
const bulkStatus = ref<ToothStatus | null>(null);
const odontogramType = ref('permanent');

const isSelectorOpen = ref(false);
const isPlannerOpen = ref(false);
const isDeleteManagerOpen = ref(false);

const selectorPosition = ref({ top: '0px', left: '0px', transform: '' });
const plannerPosition = ref({ top: '0px', left: '0px', transform: '' });
const selectedToothInfo = ref<{ toothNumber: number, surface: string } | null>(null);
const selectedSurfaceStateId = ref('');

// --- ESTADOS PARA PUENTES ---
const isBridgeMode = ref(false);
const bridgeStart = ref<number | null>(null);
const bridgeColor = ref('red');

let clickTimer: number | null = null;

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

// --- LISTA CORREGIDA: Incluye los estados evolucionados ---
const surfaceOnlyStatuses = [
  ToothStatus.CARIES, 
  ToothStatus.FILLED,
  ToothStatus.FILLED_DEFECTIVE, 
  ToothStatus.FILLED_EVOLVED, // <-- AGREGADO (Verde)
  ToothStatus.SEALANT,
  ToothStatus.SEALANT_DEFECTIVE, 
  ToothStatus.SEALANT_EVOLVED, // <-- AGREGADO (Verde)
  ToothStatus.FRACTURE, 
  ToothStatus.DISCHROMIA
];

const selectedToothExistingStates = computed(() => {
  if (!selectedToothNumber.value) return [];
  return toothStates.value[selectedToothNumber.value] || [];
});

function getSmartPosition(event: MouseEvent) {
  const clickX = event.clientX;
  const clickY = event.clientY;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  let topPosition = '0px';
  let leftPosition = '0px';
  let transformValue = '';

  if (clickY > screenHeight / 2) {
    topPosition = `${clickY - 10}px`;
    transformValue = 'translateY(-100%)';
  } else {
    topPosition = `${clickY + 10}px`;
  }
  if (clickX > screenWidth / 2) {
    leftPosition = `${clickX}px`;
    transformValue += ' translateX(-100%)';
  } else {
    leftPosition = `${clickX}px`;
  }
  return { top: topPosition, left: leftPosition, transform: transformValue.trim() };
}

// --- MANEJADORES DE CLICS (LÓGICA UNIFICADA) ---

function handleSurfaceClick(toothNumber: number, surfaceData: { surface: string, event: MouseEvent }) {
  if (props.userRole !== 'admin' && props.userRole !== 'dentist') return;

  // 1. MODO PUENTE (Prioridad Máxima)
  if (isBridgeMode.value) {
    if (bridgeStart.value === null) {
      bridgeStart.value = toothNumber;
    } else {
      if (bridgeStart.value !== toothNumber) {
         odontogramStore.addBridge(route.params.id as string, bridgeStart.value, toothNumber, bridgeColor.value);
      }
      isBridgeMode.value = false;
      bridgeStart.value = null;
    }
    return;
  }

  // 2. MODO SELECCIÓN MÚLTIPLE
  if (selectionMode.value) {
    toggleSurfaceSelection(toothNumber, surfaceData.surface);
    return;
  }

  // 3. MODO NORMAL (Click Simple)
  if (clickTimer) clearTimeout(clickTimer);

  clickTimer = window.setTimeout(() => {
    // Verificamos si el diente tiene algún estado (superficie o completo)
    const state = props.surfaces[toothNumber]?.[surfaceData.surface] ?? props.wholeTeeth[toothNumber];
    
    // Si tiene estado y NO estamos en modo inicial (histórico), abrimos planificador
    // Si estamos en modo inicial, abrimos selector para corregir/editar el histórico
    if (state && state.id && state.status !== ToothStatus.HEALTHY && currentRecordType.value !== OdontogramRecordType.INITIAL) {
      selectedSurfaceStateId.value = state.id;
      plannerPosition.value = getSmartPosition(surfaceData.event);
      isPlannerOpen.value = true;
      isSelectorOpen.value = false;
    } else {
      // SI ESTÁ SANO o es Modo Inicial -> Abrir Selector para diagnosticar
      selectedToothNumber.value = toothNumber;
      openSelector(toothNumber, surfaceData);
    }
    clickTimer = null;
  }, 400); 
}

function handleSurfaceDoubleClick(toothNumber: number, surfaceData: { surface: string, event: MouseEvent }) {
  if (props.userRole !== 'admin' && props.userRole !== 'dentist') return;
  
  // 4. MODO DOBLE CLIC
  if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
  }
  
  isPlannerOpen.value = false;
  selectedToothNumber.value = toothNumber;
  openSelector(toothNumber, surfaceData);
}

function openSelector(toothNumber: number, surfaceData: { surface: string, event: MouseEvent }) {
  selectedToothInfo.value = { toothNumber, surface: surfaceData.surface };
  selectorPosition.value = getSmartPosition(surfaceData.event);
  isSelectorOpen.value = true;
}

// --- MANEJADORES DE ESTADO (SELECTOR) ---

function handleStartBridge(color: string) {
  isBridgeMode.value = true;
  bridgeColor.value = color;
  bridgeStart.value = null;
  isSelectorOpen.value = false;
}

function handleStatusUpdate(newStatus: ToothStatus) {
  if (!selectedToothInfo.value) return;
  const patientId = route.params.id as string;
  const { toothNumber, surface } = selectedToothInfo.value;
  const payload: { toothNumber: number; status: ToothStatus; surface?: string } = {
    toothNumber,
    status: newStatus,
  };
  
  // AQUÍ ES DONDE OCURRÍA EL ERROR:
  // Ahora, como FILLED_EVOLVED está en la lista, entrará aquí y enviará la superficie correcta.
  if (surfaceOnlyStatuses.includes(newStatus)) {
    payload.surface = surface;
  }
  
  odontogramStore.updateOdontogram(patientId, [payload]);
  isSelectorOpen.value = false;
}

function handleStateUpdate(state: Partial<ToothState>) {
  if (selectedToothInfo.value) {
    const patientId = route.params.id as string;
    const payload = { ...state, toothNumber: selectedToothInfo.value.toothNumber };
    odontogramStore.saveToothState(patientId, payload);
  }
  isSelectorOpen.value = false;
}

// --- MANEJADORES DE ELIMINACIÓN ---

function handleOpenDeleteManager() {
  isSelectorOpen.value = false;
  isDeleteManagerOpen.value = true;
}

function closeDeleteManager() {
  isDeleteManagerOpen.value = false;
  selectedToothNumber.value = null;
}

function handleDeleteSurfaceState(surfaceState: ToothSurfaceState) {
  const patientId = route.params.id as string;
  odontogramStore.updateOdontogram(patientId, [{
    toothNumber: surfaceState.toothNumber,
    surface: surfaceState.surface,
    status: ToothStatus.HEALTHY,
  }]);
}

function handleDeleteWholeToothState(wholeToothState: Tooth) {
  const patientId = route.params.id as string;
  odontogramStore.updateOdontogram(patientId, [{
    toothNumber: wholeToothState.toothNumber,
    status: ToothStatus.HEALTHY,
  }]);
}

function handleStateDelete(stateToDelete: ToothState) {
  const patientId = route.params.id as string;
  odontogramStore.clearToothState(patientId, stateToDelete.id, stateToDelete.toothNumber);
}

// --- UTILIDADES ---

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
  if (surfaceOnlyStatuses.includes(status) || status === ToothStatus.HEALTHY) {
    updates = selectedSurfaces.value.map(s => ({ ...s, status }));
  } else {
    updates = [...new Set(selectedSurfaces.value.map(s => s.toothNumber))].map(toothNumber => ({ toothNumber, status }));
  }
  odontogramStore.updateOdontogram(patientId, updates);
  selectedSurfaces.value = [];
  bulkStatus.value = null;
  selectionMode.value = false;
}

function getBridgeProps(toothNumber: number) {
  const result = {
    isStart: false,
    isEnd: false,
    isMiddle: false,
    color: ''
  };

  const bridge = bridges.value.find(b => 
    toothNumber >= b.startTooth && toothNumber <= b.endTooth
  );

  if (bridge) {
    // Puentes evolucionados en verde, malos en rojo, buenos en azul
    if (bridge.color === 'green') result.color = '#16a34a';
    else result.color = bridge.color === 'blue' ? '#2563EB' : '#DC2626';
    
    if (toothNumber === bridge.startTooth) result.isStart = true;
    else if (toothNumber === bridge.endTooth) result.isEnd = true;
    else result.isMiddle = true;
  }
  
  if (isBridgeMode.value && bridgeStart.value === toothNumber) {
     result.isStart = true;
     result.color = '#F59E0B'; 
  }

  return result;
}
</script>

<template>
  <div class="p-4 bg-gray-50 rounded-lg relative">
    
    <!-- HEADER -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex rounded-lg bg-gray-200 p-1 w-max">
        <button @click="odontogramType = 'permanent'" :class="[odontogramType === 'permanent' ? 'bg-white shadow' : 'text-gray-600', 'px-4 py-1 rounded-md font-semibold text-sm transition-colors']">Permanente</button>
        <button @click="odontogramType = 'pediatric'" :class="[odontogramType === 'pediatric' ? 'bg-white shadow' : 'text-gray-600', 'px-4 py-1 rounded-md font-semibold text-sm transition-colors']">Temporal</button>
      </div>
      
      <!-- AVISO DE MODO PUENTE -->
      <div v-if="isBridgeMode" class="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md font-bold text-sm shadow-sm animate-pulse border border-yellow-300">
        <span v-if="bridgeStart === null">Seleccione el diente INICIAL</span>
        <span v-else>Seleccione el diente FINAL (Inicio: {{ bridgeStart }})</span>
        <button @click="isBridgeMode = false" class="ml-2 underline text-xs">Cancelar</button>
      </div>

      <div class="flex items-center space-x-2">
        <label for="multiSelectToggle" class="text-sm font-medium text-text-dark">Selección Múltiple</label>
        <input v-model="selectionMode" @change="selectedSurfaces = []" type="checkbox" :disabled="userRole !== 'admin' && userRole !== 'dentist'" id="multiSelectToggle" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
      </div>
    </div>
    
    <div v-if="wholeTeeth && surfaces">
      <div v-if="odontogramType === 'permanent'">
        <div class="flex justify-center items-center gap-2">
          <div v-for="tooth in permanentQuadrants.upperRight" :key="tooth" class="w-16 h-16">
            <ToothComponent 
              :tooth-number="tooth" :whole-status="wholeTeeth[tooth]" :surface-states="surfaces[tooth]" :tooth-states="toothStates[tooth]" 
              :is-selected="isSurfaceSelected" 
              :bridge-state="getBridgeProps(tooth)"
              @surface-click="handleSurfaceClick(tooth, $event)" @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" />
          </div>
          <div class="w-px bg-gray-400 self-stretch mx-4"></div>
          <div v-for="tooth in permanentQuadrants.upperLeft" :key="tooth" class="w-16 h-16">
            <ToothComponent 
              :tooth-number="tooth" :whole-status="wholeTeeth[tooth]" :surface-states="surfaces[tooth]" :tooth-states="toothStates[tooth]" 
              :is-selected="isSurfaceSelected"
              :bridge-state="getBridgeProps(tooth)" 
              @surface-click="handleSurfaceClick(tooth, $event)" @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" />
          </div>
        </div>

        <hr class="my-4 border-transparent">

        <div class="flex justify-center items-center gap-2 mt-16">
          <div v-for="tooth in permanentQuadrants.lowerRight.slice().reverse()" :key="tooth" class="w-16 h-16">
            <ToothComponent 
              :tooth-number="tooth" :whole-status="wholeTeeth[tooth]" :surface-states="surfaces[tooth]" :tooth-states="toothStates[tooth]" 
              :is-selected="isSurfaceSelected" 
              :bridge-state="getBridgeProps(tooth)"
              @surface-click="handleSurfaceClick(tooth, $event)" @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" />
          </div>
          <div class="w-px bg-gray-400 self-stretch mx-4"></div>
          <div v-for="tooth in permanentQuadrants.lowerLeft.slice().reverse()" :key="tooth" class="w-16 h-16">
            <ToothComponent 
              :tooth-number="tooth" :whole-status="wholeTeeth[tooth]" :surface-states="surfaces[tooth]" :tooth-states="toothStates[tooth]" 
              :is-selected="isSurfaceSelected" 
              :bridge-state="getBridgeProps(tooth)"
              @surface-click="handleSurfaceClick(tooth, $event)" @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" />
          </div>
        </div>
      </div>
      
      <div v-if="odontogramType === 'pediatric'">
        <div class="flex justify-center items-center gap-2">
          <div v-for="tooth in pediatricQuadrants.upperRight" :key="tooth" class="w-16 h-16">
            <ToothComponent :tooth-number="tooth" :whole-status="wholeTeeth[tooth]" :surface-states="surfaces[tooth]" :tooth-states="toothStates[tooth]" :is-selected="isSurfaceSelected" :bridge-state="getBridgeProps(tooth)" @surface-click="handleSurfaceClick(tooth, $event)" @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" />
          </div>
          <div class="w-px bg-gray-400 self-stretch mx-4"></div>
          <div v-for="tooth in pediatricQuadrants.upperLeft" :key="tooth" class="w-16 h-16">
            <ToothComponent :tooth-number="tooth" :whole-status="wholeTeeth[tooth]" :surface-states="surfaces[tooth]" :tooth-states="toothStates[tooth]" :is-selected="isSurfaceSelected" :bridge-state="getBridgeProps(tooth)" @surface-click="handleSurfaceClick(tooth, $event)" @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" />
          </div>
        </div>

        <hr class="my-4 border-transparent">
        
        <div class="flex justify-center items-center gap-2 mt-16">
          <div v-for="tooth in pediatricQuadrants.lowerRight.slice().reverse()" :key="tooth" class="w-16 h-16">
            <ToothComponent :tooth-number="tooth" :whole-status="wholeTeeth[tooth]" :surface-states="surfaces[tooth]" :tooth-states="toothStates[tooth]" :is-selected="isSurfaceSelected" :bridge-state="getBridgeProps(tooth)" @surface-click="handleSurfaceClick(tooth, $event)" @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" />
          </div>
          <div class="w-px bg-gray-400 self-stretch mx-4"></div>
          <div v-for="tooth in pediatricQuadrants.lowerLeft.slice().reverse()" :key="tooth" class="w-16 h-16">
            <ToothComponent :tooth-number="tooth" :whole-status="wholeTeeth[tooth]" :surface-states="surfaces[tooth]" :tooth-states="toothStates[tooth]" :is-selected="isSurfaceSelected" :bridge-state="getBridgeProps(tooth)" @surface-click="handleSurfaceClick(tooth, $event)" @surface-double-click="handleSurfaceDoubleClick(tooth, $event)" />
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-10 text-text-light">
      Cargando datos del odontograma...
    </div>

    <!-- Barra de acciones masivas -->
    <div v-if="selectionMode && selectedSurfaces.length > 0" class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg flex items-center gap-4 border z-20">
      <span class="font-semibold text-text-dark whitespace-nowrap">{{ selectedSurfaces.length }} sup. seleccionada(s)</span>
      <select v-model="bulkStatus" class="input-style text-sm">
        <option :value="null">Cambiar a...</option>
        <option v-for="status in surfaceOnlyStatuses" :key="status" :value="status">{{ translateStatus(status) }}</option>
        <option :value="ToothStatus.HEALTHY">Sano</option>
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
      @open-delete-manager="handleOpenDeleteManager" 
      @start-bridge="handleStartBridge"
      @close="isSelectorOpen = false" 
    />
    
    <TreatmentPlanner 
      v-if="isPlannerOpen"
      :style="plannerPosition"
      :patient-id="route.params.id as string"
      :tooth-surface-state-id="selectedSurfaceStateId"
      @close="isPlannerOpen = false"
    />

    <div v-if="isDeleteManagerOpen" 
         @click.self="closeDeleteManager" 
         class="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      
      <DeleteStateModal 
        :tooth-number="selectedToothNumber"
        @delete-surface="handleDeleteSurfaceState"
        @delete-whole-tooth="handleDeleteWholeToothState"
        @delete-tooth-state="handleStateDelete"
        @close="closeDeleteManager"
      />
    </div>
  </div>
</template>

<style scoped>
.input-style { @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold disabled:bg-opacity-50 disabled:cursor-not-allowed; }
</style>