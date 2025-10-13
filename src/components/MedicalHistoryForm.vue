<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import type { MedicalHistory } from '@/types';

const props = defineProps<{
  initialData: MedicalHistory | null;
  loading: boolean;
}>();

const emit = defineEmits(['submit']);

const formData = ref<Partial<MedicalHistory>>({});

watchEffect(() => {
  formData.value = { ...props.initialData };
});

const handleSubmit = () => {
  emit('submit', formData.value);
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-bold text-text-dark mb-4">Antecedentes Médicos</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="md:col-span-2">
          <label for="mainComplaint">Motivo Principal de la Consulta</label>
          <textarea v-model="formData.mainComplaint" id="mainComplaint" rows="3" class="input-style w-full mt-1"></textarea>
        </div>

        <div class="md:col-span-2 flex items-center gap-4">
          <input v-model="formData.isUnderMedicalTreatment" type="checkbox" id="isUnderMedicalTreatment" class="h-4 w-4 rounded">
          <label for="isUnderMedicalTreatment">¿Está en tratamiento médico actualmente?</label>
        </div>
        <div v-if="formData.isUnderMedicalTreatment" class="md:col-span-2">
          <label for="medicalTreatmentDescription">Si es así, descríbalo:</label>
          <textarea v-model="formData.medicalTreatmentDescription" id="medicalTreatmentDescription" rows="2" class="input-style w-full mt-1"></textarea>
        </div>

        <div class="md:col-span-2">
          <label for="currentMedications">Medicamentos que toma actualmente</label>
          <textarea v-model="formData.currentMedications" id="currentMedications" rows="2" class="input-style w-full mt-1"></textarea>
        </div>

        <div class="md:col-span-2">
          <label for="systemicDiseases">Enfermedades Sistémicas (Hipertensión, Diabetes, etc.)</label>
          <textarea v-model="formData.systemicDiseases" id="systemicDiseases" rows="2" class="input-style w-full mt-1"></textarea>
        </div>

        <div class="flex items-center gap-4">
          <input v-model="formData.hasBleedingIssues" type="checkbox" id="hasBleedingIssues" class="h-4 w-4 rounded">
          <label for="hasBleedingIssues">¿Problemas de coagulación?</label>
        </div>

        <div class="flex items-center gap-4">
          <input v-model="formData.isPregnant" type="checkbox" id="isPregnant" class="h-4 w-4 rounded">
          <label for="isPregnant">¿Está embarazada?</label>
        </div>

        <div>
          <label for="lastDentalVisit">Última Visita al Dentista</label>
          <input v-model="formData.lastDentalVisit" type="date" id="lastDentalVisit" class="input-style w-full mt-1">
        </div>
        <div>
          <label for="reasonForLastVisit">Motivo de la Última Visita</label>
          <input v-model="formData.reasonForLastVisit" type="text" id="reasonForLastVisit" class="input-style w-full mt-1">
        </div>
      </div>
    </div>
    
    <div class="flex justify-end">
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
      </button>
    </div>
  </form>
</template>