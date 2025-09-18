<script setup lang="ts">
import { computed } from 'vue';
import { ToothStatus } from '@/types';

const props = defineProps<{
  toothNumber: number;
  surfaces: Record<string, any>;
  isSelected: (surface: string) => boolean;
}>();

const emit = defineEmits(['surface-click']);

// --- LÓGICA PARA DETECTAR ESTADO DE DIENTE COMPLETO ---
const wholeToothStatus = computed(() => {
  const oclusalStatus = props.surfaces?.['occlusal']?.status;
  const statuses = [
    ToothStatus.CROWN,
    ToothStatus.ENDODONTICS,
    ToothStatus.IMPLANT,
    ToothStatus.EXTRACTION_NEEDED,
    ToothStatus.EXTRACTED,
  ];
  if (oclusalStatus && statuses.includes(oclusalStatus)) {
    return oclusalStatus;
  }
  return null;
});

const getStatusClass = (surface: string) => {
  const surfaceName = (props.toothNumber < 30 && props.toothNumber > 10) || (props.toothNumber > 50 && props.toothNumber < 70) ? 
    (surface === 'lingual' ? 'palatal' : surface) : surface;
  const status = props.surfaces?.[surfaceName]?.status;
  
  if (!status) return 'fill-gray-200 hover:fill-gray-300';
  switch (status) {
    case 'healthy': return 'fill-white hover:fill-gray-100';
    case 'caries': return 'fill-red-500';
    case 'filled': return 'fill-blue-500';
    case 'sealant': return 'fill-yellow-400';
    case 'fracture': return 'fill-orange-fracture';
    case 'crown': return 'fill-primary';
    case 'endodontics': return 'fill-purple-endo';
    case 'extraction_needed':
    case 'extracted':
      return 'fill-black';
    case 'implant': return 'fill-gray-implant';
    default: return 'fill-gray-200 hover:fill-gray-300';
  }
};

function onSurfaceClick(surface: string, event: MouseEvent) {
  const surfaceName = (props.toothNumber < 30 && props.toothNumber > 10) || (props.toothNumber > 50 && props.toothNumber < 70) ? 
    (surface === 'lingual' ? 'palatal' : surface) : surface;
  emit('surface-click', { surface: surfaceName, event });
}
</script>

<template>
  <div class="flex flex-col items-center">
    <span class="text-xs text-text-light mb-1">{{ toothNumber }}</span>
    
    <svg v-if="wholeToothStatus" class="w-full h-full cursor-pointer" viewBox="0 0 100 100" @click="onSurfaceClick('occlusal', $event)">
      <circle 
        :class="[getStatusClass('occlusal'), { 'ring-2 ring-blue-500 ring-inset': isSelected('occlusal') }]" 
        cx="45" cy="45" r="43" 
        stroke="#6B7280" 
        stroke-width="1.5" 
      />
      <template v-if="wholeToothStatus === ToothStatus.EXTRACTED || wholeToothStatus === ToothStatus.EXTRACTION_NEEDED">
        <line x1="22" y1="22" x2="72" y2="72" stroke="#EF4444" stroke-width="8" stroke-linecap="round" />
        <line x1="22" y1="72" x2="72" y2="22" stroke="#EF4444" stroke-width="8" stroke-linecap="round" />
      </template>
    </svg>

    <svg v-else class="w-full h-full" viewBox="0 0 100 100">
      <defs>
        <path id="surface-path" d="M 35.8,35.8 L 22.5,22.5 A 48 48 0 0 1 77.5,22.5 L 64.2,35.8 A 22 22 0 0 0 35.8,35.8 Z" />
      </defs>
      <g stroke="#6B7280" stroke-width="1.5" class="cursor-pointer">
        <use href="#surface-path" :class="[getStatusClass('vestibular'), { 'ring-2 ring-blue-500 ring-inset': isSelected('vestibular') }]" @click="onSurfaceClick('vestibular', $event)" />
        <use href="#surface-path" :class="[getStatusClass('distal'), { 'ring-2 ring-blue-500 ring-inset': isSelected('distal') }]" @click="onSurfaceClick('distal', $event)" transform="rotate(90 50 50)" />
        <use href="#surface-path" :class="[getStatusClass('lingual'), { 'ring-2 ring-blue-500 ring-inset': isSelected('lingual') }]" @click="onSurfaceClick('lingual', $event)" transform="rotate(180 50 50)" />
        <use href="#surface-path" :class="[getStatusClass('mesial'), { 'ring-2 ring-blue-500 ring-inset': isSelected('mesial') }]" @click="onSurfaceClick('mesial', $event)" transform="rotate(270 50 50)" />
        <circle @click="onSurfaceClick('occlusal', $event)" :class="[getStatusClass('occlusal'), { 'ring-2 ring-blue-500 ring-inset': isSelected('occlusal') }]" cx="50" cy="50" r="22" />
        <line x1="35.8" y1="35.8" x2="64.2" y2="64.2" />
        <line x1="35.8" y1="64.2" x2="64.2" y2="35.8" />
      </g>
    </svg>
  </div>
</template>