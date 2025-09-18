<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useOdontogramStore } from '@/stores/odontogram';
import { ToothStatus, type ToothSurfaceState } from '@/types';
import StatusSelector from '@/components/StatusSelector.vue';
import Tooth from '@/components/Tooth.vue';
import TreatmentPlanner from './TreatmentPlanner.vue'; 

const isPlannerOpen = ref(false);
const plannerPosition = ref({ top: '0px', left: '0px' });
const selectedSurfaceStateId = ref('');

const props = defineProps<{
  states: Record<number, Record<string, ToothSurfaceState>>;
  patientAge: number;
  userRole?: string;
}>();

const route = useRoute();
const odontogramStore = useOdontogramStore();

// --- ESTADO PARA LA SELECCIÓN MÚLTIPLE ---
const selectionMode = ref(false);
const selectedSurfaces = ref<{ toothNumber: number, surface: string }[]>([]);
const bulkStatus = ref<ToothStatus | null>(null);
const odontogramType = ref('permanent');

watchEffect(() => {
  odontogramType.value = props.patientAge < 12 ? 'pediatric' : 'permanent';
});

// --- ESTRUCTURA DE DIENTES CORREGIDA ---
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

// Lógica para el menú emergente de selección simple
const isSelectorOpen = ref(false);
const selectorPosition = ref({ top: '0px', left: '0px' });
const selectedToothInfo = ref<{ toothNumber: number, surface: string } | null>(null);

function openSelector(toothNumber: number, surfaceData: { surface: string, event: MouseEvent }) {
  selectedToothInfo.value = { toothNumber, surface: surfaceData.surface };
  selectorPosition.value = { top: `${surfaceData.event.clientY + 10}px`, left: `${surfaceData.event.clientX}px` };
  isSelectorOpen.value = true;
}

// --- LÓGICA DE SELECCIÓN ---

function handleSurfaceClick(toothNumber: number, surfaceData: { surface: string, event: MouseEvent }) {
  if (props.userRole !== 'admin' && props.userRole !== 'dentist') return;
  
  const state = props.states[toothNumber]?.[surfaceData.surface];
  
  // Si no hay diagnóstico, abre el selector de estados
  if (!state || state.status === 'healthy') {
    openSelector(toothNumber, surfaceData);
  } else {
    // Si YA HAY un diagnóstico, abre el planificador de tratamientos
    selectedSurfaceStateId.value = state.id;
    plannerPosition.value = { top: `${surfaceData.event.clientY + 10}px`, left: `${surfaceData.event.clientX}px` };
    isPlannerOpen.value = true;
  }
}


function toggleSurfaceSelection(toothNumber: number, surface: string) {
  const index = selectedSurfaces.value.findIndex(
    s => s.toothNumber === toothNumber && s.surface === surface
  );
  if (index > -1) {
    selectedSurfaces.value.splice(index, 1);
  } else {
    selectedSurfaces.value.push({ toothNumber, surface });
  }
}

const isSurfaceSelected = (toothNumber: number, surface: string) => {
  return selectedSurfaces.value.some(
    s => s.toothNumber === toothNumber && s.surface === surface
  );
};

function applyBulkUpdate() {
  if (!bulkStatus.value || selectedSurfaces.value.length === 0) return;
  const patientId = route.params.id as string;
  const updates = selectedSurfaces.value.map(s => ({ ...s, status: bulkStatus.value! }));
  
  odontogramStore.updateMultipleToothStates(patientId, updates);
  
  selectedSurfaces.value = [];
  bulkStatus.value = null;
  selectionMode.value = false;
}

function handleStatusUpdate(newStatus: ToothStatus) {
  if (selectedToothInfo.value) {
    const patientId = route.params.id as string;
    odontogramStore.updateToothState(
      patientId,
      selectedToothInfo.value.toothNumber,
      selectedToothInfo.value.surface,
      newStatus
    );
  }
  isSelectorOpen.value = false;
}

const translateStatus = (status: ToothStatus) => {
  const translations: Record<ToothStatus, string> = {
    [ToothStatus.HEALTHY]: 'Sano',
    [ToothStatus.CARIES]: 'Caries',
    [ToothStatus.FILLED]: 'Obturado',
    [ToothStatus.SEALANT]: 'Sellante',
    [ToothStatus.FRACTURE]: 'Fractura',
    [ToothStatus.CROWN]: 'Corona',
    [ToothStatus.ENDODONTICS]: 'Endodoncia',
    [ToothStatus.EXTRACTION_NEEDED]: 'Extracción Indicada',
    [ToothStatus.EXTRACTED]: 'Extraído / Ausente',
    [ToothStatus.IMPLANT]: 'Implante', // Añadimos el que faltaba
  };
  return translations[status] || status;
};
</script>

<template>
  <div class="p-4 bg-gray-50 rounded-lg relative">
    <div class="flex justify-between items-center mb-6">
      <div class="flex rounded-lg bg-gray-200 p-1 w-max">
        <button @click="odontogramType = 'permanent'" :class="[odontogramType === 'permanent' ? 'bg-white shadow' : 'text-gray-600', 'px-4 py-1 rounded-md font-semibold text-sm transition-colors']">
          Permanente
        </button>
        <button @click="odontogramType = 'pediatric'" :class="[odontogramType === 'pediatric' ? 'bg-white shadow' : 'text-gray-600', 'px-4 py-1 rounded-md font-semibold text-sm transition-colors']">
          Temporal (Infantil)
        </button>
      </div>
      <div class="flex items-center space-x-2">
        <label for="multiSelectToggle" class="text-sm font-medium text-text-dark">Selección Múltiple</label>
        <input v-model="selectionMode" @change="selectedSurfaces = []" type="checkbox" :disabled="userRole !== 'admin' && userRole !== 'dentist'" id="multiSelectToggle" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
      </div>
    </div>
    
    <div v-if="odontogramType === 'permanent'" class="space-y-4">
      <div class="flex justify-center items-center gap-2">
        <div v-for="tooth in permanentQuadrants.upperRight" :key="tooth" class="w-16 h-16">
          <Tooth :tooth-number="tooth" :surfaces="states[tooth] || {}" :is-selected="surface => isSurfaceSelected(tooth, surface)" @surface-click="handleSurfaceClick(tooth, $event)" />
        </div>
        <div class="w-px bg-gray-400 self-stretch mx-4"></div>
        <div v-for="tooth in permanentQuadrants.upperLeft" :key="tooth" class="w-16 h-16">
          <Tooth :tooth-number="tooth" :surfaces="states[tooth] || {}" :is-selected="surface => isSurfaceSelected(tooth, surface)" @surface-click="handleSurfaceClick(tooth, $event)" />
        </div>
      </div>
      <hr class="my-4 border-gray-400 w-full max-w-5xl mx-auto">
      <div class="flex justify-center items-center gap-2">
        <div v-for="tooth in permanentQuadrants.lowerRight.slice().reverse()" :key="tooth" class="w-16 h-16">
          <Tooth :tooth-number="tooth" :surfaces="states[tooth] || {}" :is-selected="surface => isSurfaceSelected(tooth, surface)" @surface-click="handleSurfaceClick(tooth, $event)" />
        </div>
        <div class="w-px bg-gray-400 self-stretch mx-4"></div>
        <div v-for="tooth in permanentQuadrants.lowerLeft.slice().reverse()" :key="tooth" class="w-16 h-16">
          <Tooth :tooth-number="tooth" :surfaces="states[tooth] || {}" :is-selected="surface => isSurfaceSelected(tooth, surface)" @surface-click="handleSurfaceClick(tooth, $event)" />
        </div>
      </div>
    </div>
    
    <div v-if="odontogramType === 'pediatric'" class="space-y-4">
      <div class="flex justify-center items-center gap-2">
        <div v-for="tooth in pediatricQuadrants.upperRight" :key="tooth" class="w-12 h-12">
          <Tooth :tooth-number="tooth" :surfaces="states[tooth] || {}" :is-selected="surface => isSurfaceSelected(tooth, surface)" @surface-click="handleSurfaceClick(tooth, $event)" />
        </div>
        <div class="w-px bg-gray-400 self-stretch mx-2"></div>
        <div v-for="tooth in pediatricQuadrants.upperLeft" :key="tooth" class="w-12 h-12">
          <Tooth :tooth-number="tooth" :surfaces="states[tooth] || {}" :is-selected="surface => isSurfaceSelected(tooth, surface)" @surface-click="handleSurfaceClick(tooth, $event)" />
        </div>
      </div>
      <hr class="my-4 border-gray-400 w-full max-w-xl mx-auto">
      <div class="flex justify-center items-center gap-2">
        <div v-for="tooth in pediatricQuadrants.lowerRight.slice().reverse()" :key="tooth" class="w-12 h-12">
          <Tooth :tooth-number="tooth" :surfaces="states[tooth] || {}" :is-selected="surface => isSurfaceSelected(tooth, surface)" @surface-click="handleSurfaceClick(tooth, $event)" />
        </div>
        <div class="w-px bg-gray-400 self-stretch mx-2"></div>
        <div v-for="tooth in pediatricQuadrants.lowerLeft.slice().reverse()" :key="tooth" class="w-12 h-12">
          <Tooth :tooth-number="tooth" :surfaces="states[tooth] || {}" :is-selected="surface => isSurfaceSelected(tooth, surface)" @surface-click="handleSurfaceClick(tooth, $event)" />
        </div>
      </div>
    </div>

    <div v-if="selectionMode && selectedSurfaces.length > 0" class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg flex items-center gap-4 border z-20">
      <span class="font-semibold text-text-dark whitespace-nowrap">{{ selectedSurfaces.length }} sup. seleccionada(s)</span>
      <select v-model="bulkStatus" class="input-style text-sm">
        <option :value="null">Cambiar a...</option>
        <option v-for="status in ToothStatus" :key="status" :value="status">{{ translateStatus(status) }}</option>
      </select>
      <button @click="applyBulkUpdate" class="btn-primary text-sm" :disabled="!bulkStatus">Aplicar</button>
    </div>

    <div class.="mt-8 pt-4 border-t">
  <h3 class="text-lg font-semibold text-text-dark mb-2">Leyenda</h3>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm">
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-white border"></div>
      <span>Sano</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-red-500"></div>
      <span>Caries</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-blue-500"></div>
      <span>Obturado</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-yellow-400"></div>
      <span>Sellante</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-orange-fracture"></div>
      <span>Fractura</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-primary"></div>
      <span>Corona</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-purple-endo"></div>
      <span>Endodoncia</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-black"></div>
      <span>Extracción Indicada</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-gray-implant"></div>
      <span>Implante</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-black flex items-center justify-center">
        <span class="text-red-500 font-bold text-xs">X</span>
      </div>
      <span>Extraído / Ausente</span>
    </div>
  </div>
</div>

    <StatusSelector v-if="isSelectorOpen" :style="selectorPosition" @select="handleStatusUpdate" @close="isSelectorOpen = false" />
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