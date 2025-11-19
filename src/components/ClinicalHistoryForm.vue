<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue';
import { useTreatmentsStore } from '@/stores/treatments';
import { storeToRefs } from 'pinia';
import Autocomplete from '@/components/Autocomplete.vue';
import { searchCie10 } from '@/services/cie10Service';
import type { ClinicalHistoryEntry } from '@/types';

const props = defineProps<{ 
  initialData?: Partial<ClinicalHistoryEntry> | null,
  loading: boolean 
}>();
const emit = defineEmits(['submit', 'cancel']);

const treatmentsStore = useTreatmentsStore();
const { treatments, isLoading: isLoadingTreatments } = storeToRefs(treatmentsStore);

const formData = ref({
  description: '',
  evolution: '',
  treatmentPerformed: '',
  diagnosis: '',
  prescription: '',
  indications: '',
  // --- NUEVOS CAMPOS INICIALIZADOS ---
  nextAppointmentPlan: '',
  nextAppointmentDate: '',
});

const handleDiagnosisSearch = async (term: string) => {
  const response = await searchCie10(term);
  return response.data;
};

const onDiagnosisSelect = (selectedDiagnosis: string) => {
  formData.value.diagnosis = selectedDiagnosis;
};

watchEffect(() => {
  if (props.initialData) {
    formData.value.description = props.initialData.description || '';
    formData.value.evolution = props.initialData.evolution || ''; // Cargar evolución si existe
    formData.value.treatmentPerformed = props.initialData.treatmentPerformed || '';
    formData.value.diagnosis = props.initialData.diagnosis || '';
    formData.value.prescription = props.initialData.prescription || '';
    formData.value.indications = props.initialData.indications || '';
    formData.value.nextAppointmentPlan = props.initialData.nextAppointmentPlan || '';
    
    // Formatear fecha para input datetime-local (YYYY-MM-DDTHH:MM) si viene del backend
    if (props.initialData.nextAppointmentDate) {
      const date = new Date(props.initialData.nextAppointmentDate);
      // Truco simple para ajustar a formato local para el input
      const offset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
      formData.value.nextAppointmentDate = localISOTime;
    }
  }
});

onMounted(() => {
  if (treatments.value.length === 0) {
    treatmentsStore.fetchTreatments();
  }
});

const handleSubmit = () => {
  // Enviamos los datos tal cual
  emit('submit', formData.value);
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 bg-white p-1 rounded-lg">
    
    <div class="grid grid-cols-1 gap-4">
      <!-- Motivo -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">Motivo de Consulta *</label>
        <textarea v-model="formData.description" id="description" rows="2" class="input-style w-full mt-1" required placeholder="Ej: Dolor en la zona molar..."></textarea>
      </div>

      <!-- Evolución -->
      <div>
        <label for="evolution" class="block text-sm font-medium text-gray-700">Evolución (SOAP)</label>
        <textarea v-model="formData.evolution" id="evolution" rows="4" class="input-style w-full mt-1" placeholder="Subjetivo, Objetivo, Análisis, Plan..."></textarea>
      </div>

      <!-- Tratamiento y Diagnóstico (En 2 columnas en pantallas grandes) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="treatmentPerformed" class="block text-sm font-medium text-gray-700">Tratamiento Realizado</label>
          <select v-model="formData.treatmentPerformed" id="treatmentPerformed" class="input-style w-full mt-1">
            <option value="">-- Seleccionar --</option>
            <option v-for="treatment in treatments" :key="treatment.id" :value="treatment.name">
              {{ treatment.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label for="diagnosis" class="block text-sm font-medium text-gray-700">Diagnóstico (CIE-10)</label>
          <Autocomplete 
            :search-function="handleDiagnosisSearch"
            :initial-value="formData.diagnosis"
            @select="onDiagnosisSelect"
            class="mt-1 w-full"
          />
        </div>
      </div>

      <!-- Recetas e Indicaciones -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="prescription" class="block text-sm font-medium text-gray-700">Prescripción (Receta)</label>
          <textarea v-model="formData.prescription" id="prescription" rows="2" class="input-style w-full mt-1" placeholder="Medicamentos..."></textarea>
        </div>
        <div>
          <label for="indications" class="block text-sm font-medium text-gray-700">Indicaciones al Paciente</label>
          <textarea v-model="formData.indications" id="indications" rows="2" class="input-style w-full mt-1" placeholder="Cuidados post-tratamiento..."></textarea>
        </div>
      </div>

      <!-- SECCIÓN PRÓXIMA CITA (NUEVA) -->
      <div class="border-t pt-4 mt-2">
        <h3 class="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Planificación Próxima Cita
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2">
             <label for="nextPlan" class="block text-sm font-medium text-gray-700">¿Qué se hará la próxima vez?</label>
             <input v-model="formData.nextAppointmentPlan" id="nextPlan" type="text" class="input-style w-full mt-1" placeholder="Ej: Instalación de arco inferior, Retiro de puntos...">
          </div>
          <div>
            <label for="nextDate" class="block text-sm font-medium text-gray-700">Fecha Sugerida</label>
            <input v-model="formData.nextAppointmentDate" id="nextDate" type="date" class="input-style w-full mt-1">
          </div>
        </div>
      </div>

    </div>

    <div class="flex justify-end space-x-3 pt-4 border-t mt-4">
      <button @click="emit('cancel')" type="button" class="btn-secondary">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Guardar Evolución' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.input-style { 
  @apply border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all; 
}
.btn-primary { 
  @apply px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 font-medium shadow-sm text-sm transition-colors; 
}
.btn-secondary { 
  @apply px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium shadow-sm text-sm transition-colors; 
}
</style>