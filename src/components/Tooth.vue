<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import { ToothStatus, type Tooth, type ToothSurfaceState, type ToothState } from '@/types';

const props = defineProps({
  toothNumber: { type: Number, required: true },
  wholeStatus: { type: Object as PropType<Tooth> },
  surfaceStates: { type: Object as PropType<Record<string, ToothSurfaceState>> },
  toothStates: { type: Array as PropType<ToothState[]> },
  isSelected: { type: Function as PropType<(tooth: number, surface: string) => boolean>, default: () => false },
  bridgeState: { 
    type: Object as PropType<{ isStart: boolean, isEnd: boolean, isMiddle: boolean, color: string }>,
    default: () => ({ isStart: false, isEnd: false, isMiddle: false, color: '' })
  }
});

const emit = defineEmits(['surface-click', 'surface-double-click']);

const isLowerTooth = computed(() => {
  const num = props.toothNumber;
  return (num >= 31 && num <= 48) || (num >= 71 && num <= 85);
});

// Detectar cuadrantes "reversos"
const isReverseQuadrant = computed(() => {
  const t = props.toothNumber;
  return (t >= 11 && t <= 18) || (t >= 41 && t <= 48) || (t >= 51 && t <= 55) || (t >= 81 && t <= 85);
});

const topBoxStates = computed(() => {
  if (!props.toothStates || props.toothStates.length === 0) {
    return [];
  }
  return props.toothStates.map(state => ({
    text: state.abbreviation,
    colorClass: state.status === 'bueno' ? 'text-blue-600' : 'text-red-600',
  }));
});

const wholeToothStatus = computed(() => {
  return props.wholeStatus?.status;
});

// --- DETECTAR SI HAY ALGÚN SELLANTE EN EL DIENTE (PARA LA "S" GRANDE) ---
const toothSealantColor = computed(() => {
  if (!props.surfaceStates) return null;
  const states = Object.values(props.surfaceStates);
  
  // Buscamos si hay algún sellante defectuoso primero (prioridad visual rojo)
  if (states.some(s => s.status === ToothStatus.SEALANT_DEFECTIVE)) {
    return '#DC2626'; // Rojo
  }
  // Si no, buscamos sellante bueno
  if (states.some(s => s.status === ToothStatus.SEALANT)) {
    return '#2563EB'; // Azul
  }
  return null;
});

const getFillClass = (surface: string) => {
  const surfaceName = getSurfaceName(surface);
  const status = props.surfaceStates?.[surfaceName]?.status;
  
  if (props.isSelected(props.toothNumber, surfaceName)) {
    return 'fill-primary opacity-50';
  }

  if (!status) return 'fill-gray-100 hover:fill-gray-200 transition-colors';

  switch (status) {
    case ToothStatus.HEALTHY: return 'fill-white';
    case ToothStatus.CARIES: return 'fill-red-500';
    case ToothStatus.FILLED: return 'fill-blue-500';
    case ToothStatus.FRACTURE: return 'fill-orange-500';
    case ToothStatus.DISCHROMIA: return 'fill-amber-800';
    case ToothStatus.FILLED_DEFECTIVE: return 'fill-red-500'; 
    
    // El fondo se queda blanco para sellantes, solo dibujamos la S arriba
    case ToothStatus.SEALANT: return 'fill-white'; 
    case ToothStatus.SEALANT_DEFECTIVE: return 'fill-white'; 
    
    default: return 'fill-transparent';
  }
};

const getStrokeClass = (status: ToothStatus | undefined) => {
  if (!status) return 'stroke-gray-400';
  switch (status) {
    case ToothStatus.CROWN: return 'stroke-blue-600'; 
    case ToothStatus.CROWN_DEFECTIVE: return 'stroke-red-600';
    case ToothStatus.TEMPORARY_CROWN: return 'stroke-pink-500';
    case ToothStatus.ENDODONTICS: return 'stroke-purple-600';
    case ToothStatus.IMPLANT: return 'stroke-gray-600';
    case ToothStatus.PONTIC: return 'stroke-gray-500';
    case ToothStatus.EXTRACTION_NEEDED: return 'stroke-red-600';
    case ToothStatus.EXTRACTED: return 'stroke-black';
    case ToothStatus.SUPERNUMERARY: return 'stroke-teal-600';
    default: return 'stroke-gray-400';
  }
};

function onSurfaceClick(surface: string, event: MouseEvent) {
  const surfaceName = getSurfaceName(surface);
  emit('surface-click', { surface: surfaceName, event });
}
function onSurfaceDoubleClick(surface: string, event: MouseEvent) {
  const surfaceName = getSurfaceName(surface);
  emit('surface-double-click', { surface: surfaceName, event });
}

function getSurfaceName(surface: string) {
  const isUpper = (props.toothNumber > 10 && props.toothNumber < 30) || (props.toothNumber > 50 && props.toothNumber < 70);
  return isUpper && surface === 'lingual' ? 'palatal' : surface;
}
</script>

<template>
  <div 
    class="flex flex-col items-center select-none relative"
    :class="{ 'mt-3': isLowerTooth }"
  >
    <!-- Top Box -->
    <div class="absolute -top-4 left-0 right-0 h-4 flex justify-center items-center gap-1">
      <span 
        v-for="(state, index) in topBoxStates" 
        :key="index" 
        :class="['font-bold text-xs', state.colorClass]"
      >
        {{ state.text }}
      </span>
    </div>

    <span class="text-xs text-text-light mb-0.5">{{ toothNumber }}</span>
    
    <svg class="w-full h-full drop-shadow-sm" viewBox="-10 -25 120 140">
      
      <!-- PUENTE (Capa inferior para que los puntos no tapen el texto si coinciden) -->
      <g v-if="bridgeState.color" :stroke="bridgeState.color" :fill="bridgeState.color" stroke-width="4" stroke-linecap="round">
         <g v-if="bridgeState.isStart">
            <circle cx="50" cy="-10" r="6" />
            <line v-if="isReverseQuadrant" x1="-10" y1="-10" x2="50" y2="-10" stroke-width="4" />
            <line v-else x1="50" y1="-10" x2="110" y2="-10" stroke-width="4" />
         </g>
         <g v-if="bridgeState.isEnd">
            <circle cx="50" cy="-10" r="6" />
            <line v-if="isReverseQuadrant" x1="50" y1="-10" x2="110" y2="-10" stroke-width="4" />
            <line v-else x1="-10" y1="-10" x2="50" y2="-10" stroke-width="4" />
         </g>
         <g v-if="bridgeState.isMiddle">
            <line x1="-10" y1="-10" x2="110" y2="-10" stroke-width="4" />
         </g>
      </g>

      <g stroke="#333" stroke-width="2" class="cursor-pointer">
        <path d="M 30 90 C 30 110, 70 110, 70 90 L 50 48 Z" fill="#F3EADF" stroke-width="1.5" />
        
        <g transform="translate(0, -10)">
          <!-- SUPERFICIES -->
          <path :class="getFillClass('vestibular')" @click="onSurfaceClick('vestibular', $event)" @dblclick="onSurfaceDoubleClick('vestibular', $event)" d="M 35.8,35.8 L 22.5,22.5 A 48 48 0 0 1 77.5,22.5 L 64.2,35.8 A 22 22 0 0 0 35.8,35.8 Z" transform="rotate(180 50 50)" />
          <path :class="getFillClass('distal')" @click="onSurfaceClick('distal', $event)" @dblclick="onSurfaceDoubleClick('distal', $event)" d="M 35.8,35.8 L 22.5,22.5 A 48 48 0 0 1 77.5,22.5 L 64.2,35.8 A 22 22 0 0 0 35.8,35.8 Z" transform="rotate(270 50 50)" />
          <path :class="getFillClass('lingual')" @click="onSurfaceClick('lingual', $event)" @dblclick="onSurfaceDoubleClick('lingual', $event)" d="M 35.8,35.8 L 22.5,22.5 A 48 48 0 0 1 77.5,22.5 L 64.2,35.8 A 22 22 0 0 0 35.8,35.8 Z" />
          <path :class="getFillClass('mesial')" @click="onSurfaceClick('mesial', $event)" @dblclick="onSurfaceDoubleClick('mesial', $event)" d="M 35.8,35.8 L 22.5,22.5 A 48 48 0 0 1 77.5,22.5 L 64.2,35.8 A 22 22 0 0 0 35.8,35.8 Z" transform="rotate(90 50 50)" />
          <circle :class="getFillClass('occlusal')" @click="onSurfaceClick('occlusal', $event)" @dblclick="onSurfaceDoubleClick('occlusal', $event)" cx="50" cy="50" r="22" />
          
          <circle cx="50" cy="50" r="48" fill="none" stroke="#4b5563" stroke-width="1.5" />
          <line x1="35.8" y1="35.8" x2="64.2" y2="64.2" stroke="#4b5563" stroke-width="1.5" />
          <line x1="35.8" y1="64.2" x2="64.2" y2="35.8" stroke="#4b5563" stroke-width="1.5" />

          <!-- S GRANDE (SI HAY SELLANTE) -->
          <!-- Cambio: Grosor reducido a 'bold' (o 600) para que no sea tan gruesa -->
          <text 
            v-if="toothSealantColor" 
            x="50" 
            y="65" 
            text-anchor="middle" 
            :fill="toothSealantColor" 
            font-size="50" 
            font-weight="500" 
            pointer-events="none" 
            style="filter: drop-shadow(0px 0px 2px white); opacity: 0.9;"
          >
            S
          </text>

        </g>
      </g>
      
      <!-- ESTADOS DE DIENTE COMPLETO -->
      <g v-if="wholeToothStatus" 
         :class="getStrokeClass(wholeToothStatus)" 
         stroke-width="8" 
         fill="none" 
         stroke-linecap="round"
         class="cursor-pointer"
         @click.stop="onSurfaceClick('occlusal', $event)"
         @dblclick.stop="onSurfaceDoubleClick('occlusal', $event)"
      >
        <circle v-if="wholeToothStatus === ToothStatus.CROWN || wholeToothStatus === ToothStatus.CROWN_DEFECTIVE || wholeToothStatus === ToothStatus.TEMPORARY_CROWN" cx="50" cy="40" r="48" />
        <line v-if="wholeToothStatus === ToothStatus.ENDODONTICS" x1="50" y1="40" x2="50" y2="100" />
        <g v-if="wholeToothStatus === ToothStatus.EXTRACTION_NEEDED || wholeToothStatus === ToothStatus.EXTRACTED">
          <line x1="10" y1="0" x2="90" y2="100" />
          <line x1="10" y1="100" x2="90" y2="0" />
        </g>
        <g v-if="wholeToothStatus === ToothStatus.IMPLANT" class="stroke-current">
          <line x1="50" y1="50" x2="50" y2="100" />
          <line x1="30" y1="60" x2="70" y2="60" />
          <line x1="35" y1="75" x2="65" y2="75" />
        </g>
        <line v-if="wholeToothStatus === ToothStatus.PONTIC" x1="20" y1="110" x2="80" y2="110" />
        <g v-if="wholeToothStatus === ToothStatus.SUPERNUMERARY">
          <line x1="50" y1="15" x2="50" y2="65" />
          <line x1="25" y1="40" x2="75" y2="40" />
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
path, circle { transition: fill 0.2s ease; }
/* Asegurar que el texto se vea grueso y claro */
text {
  font-family: Arial, sans-serif;
}
</style>