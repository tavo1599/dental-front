<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue';
import { useTreatmentsStore } from '@/stores/treatments';
import { storeToRefs } from 'pinia';
import Autocomplete from '@/components/Autocomplete.vue'; // <-- Importa el nuevo componente
import { searchCie10 } from '@/services/cie10Service';

const props = defineProps<{ 
  initialData?: any,
  loading: boolean 
}>();
const emit = defineEmits(['submit', 'cancel']);

// 1. Llama al store de tratamientos
const treatmentsStore = useTreatmentsStore();
const { treatments, isLoading: isLoadingTreatments } = storeToRefs(treatmentsStore);

const formData = ref({
  description: '',
  treatmentPerformed: '',
  diagnosis: '',
  prescription: '',
  indications: '',
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
    formData.value.treatmentPerformed = props.initialData.treatmentPerformed || '';
  }
});

// 2. Carga la lista de tratamientos cuando el componente se monta
onMounted(() => {
  if (treatments.value.length === 0) {
    treatmentsStore.fetchTreatments();
  }
});



</script>

<template>
  <form @submit.prevent="emit('submit', formData)" class="space-y-4">
    <div>
      <label for="description" class="block text-sm font-medium text-text-light">Descripción / Motivo de Consulta</label>
      <textarea v-model="formData.description" id="description" rows="3" class="mt-1 block w-full input-style" required></textarea>
    </div>
    <div>
      <label for="diagnosis">Diagnóstico (CIE-10)</label>
      <Autocomplete 
        :search-function="handleDiagnosisSearch"
        @select="onDiagnosisSelect"
        class="mt-1"
      />
    </div>

    <div>
      <label for="treatmentPerformed" class="block text-sm font-medium text-text-light">Tratamiento Realizado</label>
      <select v-model="formData.treatmentPerformed" id="treatmentPerformed" class="mt-1 block w-full input-style">
        <option value="">Ninguno</option>
        <option v-for="treatment in treatments" :key="treatment.id" :value="treatment.name">
          {{ treatment.name }}
        </option>
      </select>
    </div>
    
    <div>
      <label for="prescription" class="block text-sm font-medium text-text-light">Prescripción (Opcional)</label>
      <textarea v-model="formData.prescription" id="prescription" rows="2" class="mt-1 block w-full input-style"></textarea>
    </div>
    <div>
      <label for="indications" class="block text-sm font-medium text-text-light">Indicaciones (Opcional)</label>
      <textarea v-model="formData.indications" id="indications" rows="2" class="mt-1 block w-full input-style"></textarea>
    </div>

    <div class="flex justify-end space-x-4 pt-4">
      <button @click="emit('cancel')" type="button" class="btn-secondary">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Añadir Entrada' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.input-style { @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
.btn-primary { @apply px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; }
.btn-secondary { @apply px-6 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; }
</style>