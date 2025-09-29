<script setup lang="ts">
import { ToothStatus } from '@/types';
import { translateStatus, getStatusButtonClass } from '@/utils/formatters';

const emit = defineEmits(['select', 'close']);

const surfaceStatuses = [ 
  ToothStatus.HEALTHY, ToothStatus.CARIES, ToothStatus.FILLED, 
  ToothStatus.FILLED_DEFECTIVE, ToothStatus.SEALANT, 
  ToothStatus.SEALANT_DEFECTIVE, ToothStatus.FRACTURE, ToothStatus.DISCHROMIA // <-- AÑADIDO AQUÍ
];
const wholeToothStatuses = [ 
  ToothStatus.CROWN, ToothStatus.CROWN_DEFECTIVE, ToothStatus.TEMPORARY_CROWN,
  ToothStatus.ENDODONTICS, ToothStatus.IMPLANT, ToothStatus.PONTIC, 
  ToothStatus.EXTRACTION_NEEDED, ToothStatus.EXTRACTED, ToothStatus.SUPERNUMERARY
];
</script>
<template>
  <div class="fixed bg-white rounded-lg shadow-xl border p-2 z-50 w-96">
    <div class="grid grid-cols-2 gap-2">
      <div>
        <h4 class="text-xs font-bold text-gray-400 px-2 py-1 border-b">Superficies</h4>
        <button v-for="status in surfaceStatuses" :key="status" @click="emit('select', status)"
          class="w-full px-3 py-1.5 text-sm text-left rounded-md whitespace-nowrap transition-colors"
          :class="getStatusButtonClass(status)">
          {{ translateStatus(status) }}
        </button>
      </div>
      <div>
        <h4 class="text-xs font-bold text-gray-400 px-2 py-1 border-b">Diente Completo</h4>
        <button v-for="status in wholeToothStatuses" :key="status" @click="emit('select', status)"
          class="w-full px-3 py-1.5 text-sm text-left rounded-md whitespace-nowrap transition-colors"
          :class="getStatusButtonClass(status)">
          {{ translateStatus(status) }}
        </button>
      </div>
    </div>
    <button @click="emit('close')" class="w-full mt-2 text-xs text-text-light hover:underline">Cerrar</button>
  </div>
</template>