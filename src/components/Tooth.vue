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
});

const emit = defineEmits(['surface-click', 'surface-double-click']);

const isLowerTooth = computed(() => {
  const num = props.toothNumber;
  return (num >= 31 && num <= 48) || (num >= 71 && num <= 85);
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

const getFillClass = (surface: string) => {
  const surfaceName = getSurfaceName(surface);
  const status = props.surfaceStates?.[surfaceName]?.status;
  
  if (props.isSelected(props.toothNumber, surfaceName)) {
    return 'fill-primary opacity-50';
  }

  if (!status) return 'fill-gray-200 hover:fill-gray-300';
  switch (status) {
    case ToothStatus.HEALTHY: return 'fill-white';
    case ToothStatus.CARIES: return 'fill-red-500';
    case ToothStatus.FILLED: return 'fill-blue-500';
    case ToothStatus.SEALANT: return 'fill-yellow-sealant';
    case ToothStatus.FRACTURE: return 'fill-orange-fracture';
    case ToothStatus.DISCHROMIA: return 'fill-brown-dischromia';
    case ToothStatus.FILLED_DEFECTIVE: return 'fill-purple-defective';
    case ToothStatus.SEALANT_DEFECTIVE: return 'fill-teal-defective';
    default: return 'fill-transparent';
  }
};

const getStrokeClass = (status: ToothStatus | undefined) => {
  if (!status) return 'stroke-gray-600';
  switch (status) {
    case ToothStatus.CROWN: return 'stroke-primary';
    case ToothStatus.TEMPORARY_CROWN: return 'stroke-pink-temp';
    case ToothStatus.ENDODONTICS: return 'stroke-purple-endo';
    case ToothStatus.IMPLANT: return 'stroke-gray-implant';
    case ToothStatus.PONTIC: return 'stroke-gray-400';
    case ToothStatus.EXTRACTION_NEEDED: return 'stroke-red-800';
    case ToothStatus.EXTRACTED: return 'stroke-black';
    case ToothStatus.SUPERNUMERARY: return 'stroke-teal-super';
    case ToothStatus.CROWN_DEFECTIVE: return 'stroke-red-500';
    default: return 'stroke-gray-600';
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
    
    <svg class="w-full h-full" viewBox="-10 -15 120 130">
      <g stroke="#333" stroke-width="2" class="cursor-pointer">
        <path d="M 30 90 C 30 110, 70 110, 70 90 L 50 48 Z" fill="#F3EADF" stroke-width="1.5" />
        <g transform="translate(0, -10)">
          <path :class="getFillClass('vestibular')" @click="onSurfaceClick('vestibular', $event)" @dblclick="onSurfaceDoubleClick('vestibular', $event)" d="M 35.8,35.8 L 22.5,22.5 A 48 48 0 0 1 77.5,22.5 L 64.2,35.8 A 22 22 0 0 0 35.8,35.8 Z" transform="rotate(180 50 50)" />
          <path :class="getFillClass('distal')" @click="onSurfaceClick('distal', $event)" @dblclick="onSurfaceDoubleClick('distal', $event)" d="M 35.8,35.8 L 22.5,22.5 A 48 48 0 0 1 77.5,22.5 L 64.2,35.8 A 22 22 0 0 0 35.8,35.8 Z" transform="rotate(270 50 50)" />
          <path :class="getFillClass('lingual')" @click="onSurfaceClick('lingual', $event)" @dblclick="onSurfaceDoubleClick('lingual', $event)" d="M 35.8,35.8 L 22.5,22.5 A 48 48 0 0 1 77.5,22.5 L 64.2,35.8 A 22 22 0 0 0 35.8,35.8 Z" />
          <path :class="getFillClass('mesial')" @click="onSurfaceClick('mesial', $event)" @dblclick="onSurfaceDoubleClick('mesial', $event)" d="M 35.8,35.8 L 22.5,22.5 A 48 48 0 0 1 77.5,22.5 L 64.2,35.8 A 22 22 0 0 0 35.8,35.8 Z" transform="rotate(90 50 50)" />
          <circle :class="getFillClass('occlusal')" @click="onSurfaceClick('occlusal', $event)" @dblclick="onSurfaceDoubleClick('occlusal', $event)" cx="50" cy="50" r="22" />
          <circle cx="50" cy="50" r="48" fill="none" stroke="#333" stroke-width="1.5" />
          <line x1="35.8" y1="35.8" x2="64.2" y2="64.2" stroke="#333" stroke-width="1.5" />
          <line x1="35.8" y1="64.2" x2="64.2" y2="35.8" stroke="#333" stroke-width="1.5" />
        </g>
      </g>
      
      <g v-if="wholeToothStatus" :class="getStrokeClass(wholeToothStatus)" stroke-width="8" fill="none" stroke-linecap="round">
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
.relative {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding-top: 0.5rem; 
}
</style>