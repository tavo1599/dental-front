<script setup lang="ts">
import { computed } from 'vue';
import { useOdontogramStore } from '@/stores/odontogram';
// --- Asumo que tu tipo 'Tooth' se llama 'WholeTooth' en tu store, ajústalo si es necesario ---
import type { Tooth as WholeTooth, ToothSurfaceState, ToothState } from '@/types';
import { translateStatus } from '@/utils/formatters';

const props = defineProps<{
  toothNumber: number | null;
}>();

const emit = defineEmits(['delete-surface', 'delete-whole-tooth', 'delete-tooth-state', 'close']);

const store = useOdontogramStore();

// Busca todos los estados para este diente
const wholeToothState = computed<WholeTooth | null>(() => props.toothNumber ? store.wholeTeeth[props.toothNumber] : null);
const surfaceStates = computed<ToothSurfaceState[]>(() => props.toothNumber ? Object.values(store.surfaces[props.toothNumber] || {}) : []);
const topBoxStates = computed<ToothState[]>(() => props.toothNumber ? store.toothStates[props.toothNumber] || [] : []);

</script>

<template>
  <div class="bg-white rounded-lg shadow-xl p-6 space-y-4 w-full max-w-md">
    
    <h3 class="text-lg font-semibold text-text-dark">Eliminar Estados del Diente {{ toothNumber }}</h3>

    <div v-if="!wholeToothState && surfaceStates.length === 0 && topBoxStates.length === 0" class="text-center text-gray-500 py-4">
      Este diente no tiene ningún estado registrado.
    </div>

    <div class="max-h-64 overflow-y-auto space-y-3">
      <div v-if="topBoxStates.length > 0">
        <h4 class="font-medium text-gray-700">Estados del Diente (Top Box)</h4>
        <ul class="divide-y divide-gray-200">
          <li v-for="state in topBoxStates" :key="state.id" class="py-2 flex justify-between items-center">
            <span>{{ state.abbreviation }} - {{ state.sub_type }} ({{ state.status }})</span>
            <button @click="emit('delete-tooth-state', state)" class="btn-delete-small">X</button>
          </li>
        </ul>
      </div>

      <div v-if="wholeToothState">
        <h4 class="font-medium text-gray-700">Estado de Diente Completo</h4>
        <ul class="divide-y divide-gray-200">
          <li class="py-2 flex justify-between items-center">
            <span>{{ translateStatus(wholeToothState.status) }}</span>
            <button @click="emit('delete-whole-tooth', wholeToothState)" class="btn-delete-small">X</button>
          </li>
        </ul>
      </div>

      <div v-if="surfaceStates.length > 0">
        <h4 class="font-medium text-gray-700">Estados de Superficie</h4>
        <ul class="divide-y divide-gray-200">
          <li v-for="state in surfaceStates" :key="state.id" class="py-2 flex justify-between items-center">
            <span>{{ translateStatus(state.status) }} ({{ state.surface }})</span>
            <button @click="emit('delete-surface', state)" class="btn-delete-small">X</button>
          </li>
        </ul>
      </div>
    </div>

    <div class="flex justify-end pt-4">
      <button @click="emit('close')" class="btn-secondary">Cerrar</button>
    </div>
  </div>
</template>

<style scoped>
.btn-delete-small {
  @apply w-6 h-6 bg-red-100 text-red-700 rounded-full font-bold text-xs hover:bg-red-200;
}
.btn-secondary { @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; }
</style>