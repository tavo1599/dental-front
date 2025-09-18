<script setup lang="ts">
import { ToothStatus } from '@/types'; // Importamos los estados posibles

const emit = defineEmits(['select', 'close']);
</script>
<template>
  <div class="fixed bg-white rounded-lg shadow-xl border p-2 z-10">
    <div class="grid grid-cols-2 gap-1">
      <button @click="emit('select', ToothStatus.HEALTHY)" class="status-button">Sano</button>
      <button @click="emit('select', ToothStatus.CARIES)" class="status-button bg-red-500 text-white">Caries</button>
      <button @click="emit('select', ToothStatus.FILLED)" class="status-button bg-blue-500 text-white">Obturado</button>
      <button @click="emit('select', ToothStatus.SEALANT)" class="status-button bg-yellow-400">Sellante</button>
      <button @click="emit('select', ToothStatus.FRACTURE)" class="status-button bg-orange-fracture text-white">Fractura</button>
      <button @click="emit('select', ToothStatus.CROWN)" class="status-button bg-primary text-white">Corona</button>
      <button @click="emit('select', ToothStatus.ENDODONTICS)" class="status-button bg-purple-endo text-white">Endodoncia</button>
      <button @click="emit('select', ToothStatus.EXTRACTION_NEEDED)" class="status-button bg-black text-white">Extracción</button>
      </div>
    <button @click="emit('close')" class="w-full mt-2 text-xs text-text-light hover:underline">Cerrar</button>
  </div>
</template>
<style scoped>
.status-button {
  @apply px-3 py-1 rounded-md text-sm font-semibold border;
}
</style>