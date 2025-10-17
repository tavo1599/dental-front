<script setup lang="ts">
import { ref, watch } from 'vue';
import type { OdontopediatricHistory } from '@/types';

const props = defineProps<{
  initialData: OdontopediatricHistory | null;
  loading: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

const formData = ref<Partial<OdontopediatricHistory>>({});

watch(() => props.initialData, (newData) => {
  formData.value = { ...newData };
}, { immediate: true, deep: true });

const handleSubmit = () => {
  emit('submit', formData.value);
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="p-6 bg-white rounded-lg shadow-md space-y-6">

      <fieldset>
        <legend class="text-lg font-semibold text-text-dark">1. Historial del Niño</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="md:col-span-2">
            <label for="childhoodIllnesses">Enfermedades padecidas (varicela, rubeola, etc.)</label>
            <input v-model="formData.childhoodIllnesses" type="text" id="childhoodIllnesses" class="input-style w-full mt-1">
          </div>
          <div class="md:col-span-2">
            <label for="allergies">Alergias (Medicamentos, alimentos)</label>
            <input v-model="formData.allergies" type="text" id="allergies" class="input-style w-full mt-1">
          </div>
          <div class="md:col-span-2">
            <label for="currentMedications">Medicamentos que toma actualmente</label>
            <input v-model="formData.currentMedications" type="text" id="currentMedications" class="input-style w-full mt-1">
          </div>
          <div class="md:col-span-2">
            <label for="previousSurgeries">Cirugías u hospitalizaciones previas</label>
            <input v-model="formData.previousSurgeries" type="text" id="previousSurgeries" class="input-style w-full mt-1">
          </div>
          <div class="flex items-center gap-3">
            <input v-model="formData.vaccinesUpToDate" type="checkbox" id="vaccinesUpToDate" class="h-4 w-4 rounded text-primary focus:ring-primary">
            <label for="vaccinesUpToDate" class="font-medium text-gray-700">Vacunas completas</label>
          </div>
        </div>
      </fieldset>

      <fieldset class="border-t pt-6">
        <legend class="text-lg font-semibold text-text-dark">2. Historial Prenatal y Nacimiento</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="md:col-span-2">
            <label for="pregnancyIssues">Problemas durante el embarazo</label>
            <input v-model="formData.pregnancyIssues" type="text" id="pregnancyIssues" class="input-style w-full mt-1">
          </div>
          <div>
            <label for="birthType">Tipo de Parto</label>
            <select v-model="formData.birthType" id="birthType" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option value="Natural">Natural</option>
              <option value="Cesárea">Cesárea</option>
            </select>
          </div>
          <div>
            <label for="birthComplications">Complicaciones al nacer</label>
            <input v-model="formData.birthComplications" type="text" id="birthComplications" class="input-style w-full mt-1" placeholder="Ej: Prematuro, ictericia">
          </div>
        </div>
      </fieldset>

      <fieldset class="border-t pt-6">
        <legend class="text-lg font-semibold text-text-dark">3. Hábitos y Dieta</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label for="feedingType">Tipo de Lactancia</label>
            <select v-model="formData.feedingType" id="feedingType" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option value="Materna Exclusiva">Materna Exclusiva</option>
              <option value="Fórmula">Fórmula</option>
              <option value="Mixta">Mixta</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label for="oralHabits">Hábitos Orales</label>
            <input v-model="formData.oralHabits" type="text" id="oralHabits" class="input-style w-full mt-1" placeholder="Ej: Succión de dedo, morderse las uñas">
          </div>
          <div class="flex items-center gap-3">
            <input v-model="formData.usedBottle" type="checkbox" id="usedBottle" class="h-4 w-4 rounded text-primary focus:ring-primary">
            <label for="usedBottle" class="font-medium text-gray-700">¿Usó Biberón?</label>
          </div>
          <div class="flex items-center gap-3">
            <input v-model="formData.usedPacifier" type="checkbox" id="usedPacifier" class="h-4 w-4 rounded text-primary focus:ring-primary">
            <label for="usedPacifier" class="font-medium text-gray-700">¿Usó Chupón?</label>
          </div>
        </div>
      </fieldset>

      <fieldset class="border-t pt-6">
        <legend class="text-lg font-semibold text-text-dark">4. Historial Dental Pediátrico</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label for="firstToothAge">Edad del Primer Diente</label>
            <input v-model="formData.firstToothAge" type="text" id="firstToothAge" class="input-style w-full mt-1" placeholder="Ej: 6 meses">
          </div>
          <div>
            <label for="firstDentalVisit">Primera Visita al Dentista</label>
            <input v-model="formData.firstDentalVisit" type="date" id="firstDentalVisit" class="input-style w-full mt-1">
          </div>
          <div class="md:col-span-2">
            <label for="previousDentalExperience">Experiencias dentales previas (traumas, etc.)</label>
            <textarea v-model="formData.previousDentalExperience" id="previousDentalExperience" rows="2" class="input-style w-full mt-1"></textarea>
          </div>
        </div>
      </fieldset>

    </div>

    <div class="flex justify-end mt-6">
      <button @click="emit('cancel')" type="button" class="btn-secondary">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Guardar Anamnesis Pediátrica' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
label {
  @apply block text-sm font-medium text-gray-700;
}
.input-style { @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold disabled:opacity-50; }
.btn-secondary { @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; }
</style>