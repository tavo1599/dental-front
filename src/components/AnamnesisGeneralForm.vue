<script setup lang="ts">
import { ref, watch } from 'vue';
import type { MedicalHistory } from '@/types';

const props = defineProps<{
  initialData: MedicalHistory | null;
  loading: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

const formData = ref<Partial<MedicalHistory>>({});
const checklist = ref<Record<string, boolean>>({});
const details = ref<Record<string, string>>({});

const checklistItems = {
  diabetes: 'Diabetes',
  hipertension: 'Presión Alta',
  problemasCardiacos: 'Problemas Cardíacos',
  problemasCoagulacion: 'Problemas de Coagulación',
  hepatitis: 'Hepatitis (A, B, C)',
  vih: 'VIH / SIDA',
  asma: 'Asma',
  tuberculosis: 'Tuberculosis',
  cancer: 'Cáncer / Quimioterapia',
  problemasRenales: 'Problemas Renales',
  epilepsia: 'Epilepsia / Convulsiones',
  osteoporosis: 'Osteoporosis (Bifosfonatos)',
};

// (No orthodontic options here — ortodoncia tendrá su propio formulario)

// --- FUNCIÓN HELPER PARA LIMPIAR NÚMEROS ---
const parseNumber = (val: any): number | undefined => {
  if (val === null || val === undefined || val === '') return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
};

watch(() => props.initialData, (newData) => {
  const initialChecklist: Record<string, boolean> = {};
  Object.keys(checklistItems).forEach(key => {
    initialChecklist[key] = newData?.medicalChecklist?.[key] || false;
  });
  checklist.value = initialChecklist;

  details.value = {
    problemasCardiacos: newData?.medicalChecklistDetails?.problemasCardiacos || '',
    otros: newData?.medicalChecklistDetails?.otros || '',
  };
  
  formData.value = {
    mainComplaint: newData?.mainComplaint || '',
    illnessHistory: newData?.illnessHistory || '',
    biologicalFunctions: newData?.biologicalFunctions || '',
    familyHistory: newData?.familyHistory || '',
    personalHistory: newData?.personalHistory || '',
    currentMedications: newData?.currentMedications || '',
    allergies: newData?.allergies || '',
    anesthesiaReaction: newData?.anesthesiaReaction || '',
    hasBleedingIssues: newData?.hasBleedingIssues || false,
    isPregnant: newData?.isPregnant || false,
    isLactating: newData?.isLactating || false,
    lastDentalVisit: newData?.lastDentalVisit || null,
    oralDiscomfort: newData?.oralDiscomfort || '',
    usesFloss: newData?.usesFloss || false,
    bruxism: newData?.bruxism || false,
    
    // --- CAMPOS NUMÉRICOS LIMPIADOS ---
    brushingFrequency: parseNumber(newData?.brushingFrequency) || 2,
    bloodPressure: newData?.bloodPressure || '', // (Este es string, está bien)
    heartRate: parseNumber(newData?.heartRate),
    temperature: parseNumber(newData?.temperature),
    respiratoryRate: parseNumber(newData?.respiratoryRate),
    // orthodontic data is handled in its own form
  };
}, { immediate: true, deep: true });

const handleSubmit = () => {
  const payload = {
    ...formData.value,
    medicalChecklist: checklist.value,
    medicalChecklistDetails: details.value,
  };

  // Limpiamos el payload de nulos, indefinidos o strings vacíos
  const cleanPayload: Record<string, any> = { ...payload };
  Object.keys(cleanPayload).forEach(key => {
    const K = key as keyof typeof cleanPayload;
    if (cleanPayload[K] === null || cleanPayload[K] === undefined || cleanPayload[K] === '') {
      delete cleanPayload[K];
    }
  });

  emit('submit', cleanPayload);
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="p-6 bg-white rounded-lg shadow-md space-y-6">
      
      <fieldset class="border-b pb-6">
        <legend class="text-lg font-semibold text-text-dark">1. Enfermedad Actual</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="md:col-span-2">
            <label for="mainComplaint">Motivo Principal de la Consulta</label>
            <input v-model="formData.mainComplaint" type="text" id="mainComplaint" class="input-style w-full mt-1">
          </div>
          <div class="md:col-span-2">
            <label for="illnessHistory">Relato Cronológico (Signos y Síntomas)</label>
            <textarea v-model="formData.illnessHistory" id="illnessHistory" rows="3" class="input-style w-full mt-1"></textarea>
          </div>
          <div>
            <label for="biologicalFunctions">Funciones Biológicas (Apetito, sueño, etc.)</label>
            <input v-model="formData.biologicalFunctions" type="text" id="biologicalFunctions" class="input-style w-full mt-1">
          </div>
        </div>
      </fieldset>

      

      <fieldset class="border-b pb-6">
        <legend class="text-lg font-semibold text-text-dark">2. Antecedentes</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label for="familyHistory">Familiares</label>
            <input v-model="formData.familyHistory" type="text" id="familyHistory" class="input-style w-full mt-1">
          </div>
          <div>
            <label for="personalHistory">Personales</label>
            <input v-model="formData.personalHistory" type="text" id="personalHistory" class="input-style w-full mt-1">
          </div>
          <div class="md:col-span-2">
            <label for="currentMedications">Medicamentos que toma permanentemente</label>
            <textarea v-model="formData.currentMedications" id="currentMedications" rows="2" class="input-style w-full mt-1"></textarea>
          </div>
          <div class="md:col-span-2">
            <label for="allergies">Alergias (Medicamentos, alimentos, etc.)</label>
            <textarea v-model="formData.allergies" id="allergies" rows="2" class="input-style w-full mt-1"></textarea>
          </div>
        </div>
      </fieldset>

      <fieldset class="border-b pb-6">
        <legend class="text-lg font-semibold text-text-dark">3. Cuestionario de Salud (Marcar "Sí" si aplica)</legend>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <label v-for="(label, key) in checklistItems" :key="key" class="flex items-center gap-3 p-2 bg-gray-50 rounded-md border">
            <input v-model="checklist[key]" type="checkbox" class="h-4 w-4 rounded text-primary focus:ring-primary">
            <span class="font-medium text-gray-700">{{ label }}</span>
          </label>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label for="detailCardiacos">Problemas Cardíacos (especificar)</label>
            <input v-model="details.problemasCardiacos" type="text" id="detailCardiacos" class="input-style w-full mt-1">
          </div>
          <div>
            <label for="detailOtros">Otra enfermedad (especificar)</label>
            <input v-model="details.otros" type="text" id="detailOtros" class="input-style w-full mt-1">
          </div>
          <div class="flex items-center gap-4">
            <input v-model="formData.hasBleedingIssues" type="checkbox" id="hasBleedingIssues" class="h-4 w-4 rounded text-primary focus:ring-primary">
            <label for="hasBleedingIssues" class="font-medium text-gray-700">¿Hemorragias anormales?</label>
          </div>
          <div class="flex items-center gap-4">
            <input v-model="formData.isPregnant" type="checkbox" id="isPregnant" class="h-4 w-4 rounded text-primary focus:ring-primary">
            <label for="isPregnant" class="font-medium text-gray-700">¿Está embarazada?</label>
          </div>
          <div class="flex items-center gap-4">
            <input v-model="formData.isLactating" type="checkbox" id="isLactating" class="h-4 w-4 rounded text-primary focus:ring-primary">
            <label for="isLactating" class="font-medium text-gray-700">¿Está dando de lactar?</label>
          </div>
        </div>
      </fieldset>
      
      <fieldset class="border-b pb-6">
        <legend class="text-lg font-semibold text-text-dark">4. Signos Vitales (Al registrar)</legend>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label for="bloodPressure">P.A.</label>
            <input v-model="formData.bloodPressure" type="text" id="bloodPressure" class="input-style w-full mt-1" placeholder="120/80">
          </div>
          <div>
            <label for="heartRate">F.C. (x min)</label>
            <input v-model.number="formData.heartRate" type="number" id="heartRate" class="input-style w-full mt-1" placeholder="80">
          </div>
          <div>
            <label for="temperature">Temp (°C)</label>
            <input v-model.number="formData.temperature" type="number" step="0.1" id="temperature" class="input-style w-full mt-1" placeholder="36.5">
          </div>
          <div>
            <label for="respiratoryRate">F.R. (x min)</label>
            <input v-model.number="formData.respiratoryRate" type="number" id="respiratoryRate" class="input-style w-full mt-1" placeholder="16">
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend class="text-lg font-semibold text-text-dark">5. Historial Dental</legend>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label for="lastDentalVisit">Última Visita (Aprox.)</label>
            <input v-model="formData.lastDentalVisit" type="date" id="lastDentalVisit" class="input-style w-full mt-1">
          </div>
          <div>
            <label for="brushingFrequency">Cepillados al día</label>
            <select v-model.number="formData.brushingFrequency" id="brushingFrequency" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option :value="1">1 vez</option>
              <option :value="2">2 veces</option>
              <option :value="3">3 o más veces</option>
            </select>
          </div>
          <div class="flex items-center gap-4 pt-6">
            <input v-model="formData.usesFloss" type="checkbox" id="usesFloss" class="h-4 w-4 rounded text-primary focus:ring-primary">
            <label for="usesFloss" class="font-medium text-gray-700">¿Usa hilo dental?</label>
          </div>
          <div class="flex items-center gap-4 pt-6">
            <input v-model="formData.bruxism" type="checkbox" id="bruxism" class="h-4 w-4 rounded text-primary focus:ring-primary">
            <label for="bruxism" class="font-medium text-gray-700">¿Rechina los dientes?</label>
          </div>
          <div class="md:col-span-2">
            <label for="oralDiscomfort">Otras molestias en la boca</label>
            <input v-model="formData.oralDiscomfort" type="text" id="oralDiscomfort" class="input-style w-full mt-1">
          </div>
        </div>
      </fieldset>
    </div>
    
    <div class="flex justify-end mt-6">
      <button @click="emit('cancel')" type="button" class="btn-secondary">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Guardar Anamnesis' }}
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