<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ 
  budgetId: string 
}>();

// Emitimos 'generate' para decirle al padre (PatientDetailView) que abra el visor
const emit = defineEmits(['close', 'generate']);

const printForPatient = ref(true);
const printForDoctor = ref(false);

function handleGenerate() {
  const formats = [];
  if (printForPatient.value) formats.push('patient');
  if (printForDoctor.value) formats.push('doctor');

  if (formats.length === 0) {
    alert('Por favor, selecciona al menos un formato para imprimir.');
    return;
  }

  // --- CAMBIO IMPORTANTE ---
  // En lugar de 'window.open' (que abre una pestaña vacía o con errores),
  // emitimos este evento. El componente padre abrirá el 'BudgetPrintPreviewModal'
  // que ya está preparado para mostrar Ortodoncia/Estándar, Logos R2, etc.
  emit('generate', { 
    budgetId: props.budgetId, 
    formats: formats 
  });
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- Título y Descripción -->
    <div>
      <h3 class="text-lg font-bold text-text-dark mb-1">Imprimir Presupuesto</h3>
      <p class="text-text-light text-sm">Selecciona los formatos que deseas generar.</p>
    </div>

    <!-- Opciones -->
    <div class="space-y-3">
      
      <!-- Opción Paciente -->
      <label 
        class="flex items-start p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
        :class="printForPatient ? 'border-primary bg-blue-50/30' : 'border-gray-200'"
      >
        <div class="flex items-center h-5">
          <input 
            v-model="printForPatient" 
            type="checkbox" 
            class="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
          >
        </div>
        <div class="ml-3 text-sm">
          <span class="block font-medium text-gray-900">Formato para Paciente</span>
          <span class="block text-gray-500 text-xs mt-0.5">Diseño formal A4 con logo, detalles financieros y plan de pagos (si es ortodoncia).</span>
        </div>
      </label>

      <!-- Opción Doctor -->
      <label 
        class="flex items-start p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
        :class="printForDoctor ? 'border-primary bg-blue-50/30' : 'border-gray-200'"
      >
        <div class="flex items-center h-5">
          <input 
            v-model="printForDoctor" 
            type="checkbox" 
            class="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
          >
        </div>
        <div class="ml-3 text-sm">
          <span class="block font-medium text-gray-900">Ficha Interna (Doctor)</span>
          <span class="block text-gray-500 text-xs mt-0.5">Hoja de control técnica simplificada para archivo físico.</span>
        </div>
      </label>

    </div>

    <!-- Botones -->
    <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
      <button @click="emit('close')" type="button" class="btn-secondary">Cancelar</button>
      <button @click="handleGenerate" type="button" class="btn-primary flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Generar Impresión
      </button>
    </div>

  </div>
</template>

<style scoped>
.btn-primary { 
  @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 font-semibold text-sm transition-colors shadow-sm; 
}
.btn-secondary { 
  @apply px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors; 
}
</style>