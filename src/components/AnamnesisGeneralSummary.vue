<script setup lang="ts">
import type { MedicalHistory } from '@/types';
import { computed } from 'vue'; // Importa computed

const props = defineProps<{
  history: MedicalHistory;
}>();

// --- CORRECCIÓN AQUÍ ---
// Creamos propiedades computadas seguras que NUNCA serán nulas.
// Si el historial no tiene un checklist, usamos un objeto vacío por defecto.
const checklist = computed(() => props.history.medicalChecklist || {});
const details = computed(() => props.history.medicalChecklistDetails || {});
// --- FIN DE LA CORRECCIÓN ---

// Mapeo de nombres para el checklist
const checklistItems: Record<string, string> = {
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
</script>

<template>
  <div class="space-y-6">
    <fieldset>
      <legend class="text-md font-semibold text-text-dark mb-2">Signos Vitales</legend>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><strong class="text-text-light">P.A:</strong> {{ history.bloodPressure || 'N/A' }}</div>
        <div><strong class="text-text-light">F.C:</strong> {{ history.heartRate || 'N/A' }} x min</div>
        <div><strong class="text-text-light">Temp:</strong> {{ history.temperature || 'N/A' }} °C</div>
        <div><strong class="text-text-light">F.R:</strong> {{ history.respiratoryRate || 'N/A' }} x min</div>
      </div>
    </fieldset>

    <fieldset>
      <legend class="text-md font-semibold text-text-dark mb-2">Enfermedad Actual</legend>
      <p><strong class="text-text-light">Motivo:</strong> {{ history.mainComplaint || 'N/A' }}</p>
      <p><strong class="text-text-light">Relato:</strong> {{ history.illnessHistory || 'N/A' }}</p>
    </fieldset>

    <fieldset>
      <legend class="text-md font-semibold text-text-dark mb-2">Cuestionario de Salud</legend>
      <ul class="list-disc list-inside space-y-1">
        <li v-for="(label, key) in checklistItems" :key="key">
          <span :class="checklist[key] ? 'font-bold text-red-600' : 'text-text-light'">
            {{ label }}: {{ checklist[key] ? 'SÍ' : 'No' }}
          </span>
        </li>
        <li><strong class="text-text-light">Det. Cardíaco:</strong> {{ details.problemasCardiacos || 'N/A' }}</li>
        <li><strong class="text-text-light">Otros:</strong> {{ details.otros || 'N/A' }}</li>
      </ul>
    </fieldset>

    <fieldset>
      <legend class="text-md font-semibold text-text-dark mb-2">Antecedentes</legend>
      <p><strong class="text-text-light">Medicamentos:</strong> {{ history.currentMedications || 'Ninguno' }}</p>
      <p><strong class="text-text-light">Alergias:</strong> {{ history.allergies || 'Ninguna' }}</p>
      <p><strong class="text-text-light">Hemorragias:</strong> {{ history.hasBleedingIssues ? 'Sí' : 'No' }}</p>
    </fieldset>
  </div>
</template>