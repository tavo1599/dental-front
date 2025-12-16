<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ 
  budgetId: string 
}>();

// Emitimos 'generate' para decirle al padre (PatientDetailView) que abra el visor
const emit = defineEmits(['close', 'generate']);

// Opciones principales
const printForPatient = ref(true);
const printForDoctor = ref(false);

// Opciones de Anexos
const attachOdontogram = ref(false);
const attachEvolution = ref(false);

function handleGenerate() {
  const formats = [];
  if (printForPatient.value) formats.push('patient');
  if (printForDoctor.value) formats.push('doctor');

  // Validamos que haya algo seleccionado (formatos o anexos)
  if (formats.length === 0 && !attachOdontogram.value && !attachEvolution.value) {
    alert('Por favor, selecciona al menos un documento para generar.');
    return;
  }

  // Emitimos la configuración completa al padre
  emit('generate', { 
    budgetId: props.budgetId, 
    formats: formats,
    extras: {
        odontogram: attachOdontogram.value,
        evolution: attachEvolution.value
    }
  });
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- Título y Descripción -->
    <div>
      <h3 class="text-lg font-bold text-text-dark mb-1">Imprimir Presupuesto</h3>
      <p class="text-text-light text-sm">Selecciona los documentos que deseas generar.</p>
    </div>

    <!-- Opciones Principales -->
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
          <span class="block text-gray-500 text-xs mt-0.5">Diseño formal con logo y detalles.</span>
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
          <span class="block text-gray-500 text-xs mt-0.5">Hoja técnica simplificada.</span>
        </div>
      </label>

      <!-- SEPARADOR -->
      <div class="relative py-2">
        <div class="absolute inset-0 flex items-center" aria-hidden="true">
          <div class="w-full border-t border-gray-200"></div>
        </div>
        <div class="relative flex justify-start">
          <span class="pr-2 bg-white text-xs font-bold text-gray-400 uppercase tracking-wider">Anexos Clínicos</span>
        </div>
      </div>

      <!-- Opciones de Anexos (CON EL MISMO ESTILO) -->
      
      <!-- Opción Odontograma -->
      <label 
        class="flex items-start p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
        :class="attachOdontogram ? 'border-primary bg-blue-50/30' : 'border-gray-200'"
      >
        <div class="flex items-center h-5">
          <input 
            v-model="attachOdontogram" 
            type="checkbox" 
            class="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
          >
        </div>
        <div class="ml-3 text-sm">
          <span class="block font-medium text-gray-900">Adjuntar Odontograma</span>
          <span class="block text-gray-500 text-xs mt-0.5">Gráfico actual del estado dental.</span>
        </div>
      </label>

      <!-- Opción Evolución -->
      <label 
        class="flex items-start p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
        :class="attachEvolution ? 'border-primary bg-blue-50/30' : 'border-gray-200'"
      >
        <div class="flex items-center h-5">
          <input 
            v-model="attachEvolution" 
            type="checkbox" 
            class="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
          >
        </div>
        <div class="ml-3 text-sm">
          <span class="block font-medium text-gray-900">Adjuntar Evolución</span>
          <span class="block text-gray-500 text-xs mt-0.5">Historial clínico de tratamientos realizados.</span>
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