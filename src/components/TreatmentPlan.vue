<script setup lang="ts">
import { usePlannedTreatmentsStore } from '@/stores/plannedTreatments';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import type { PlannedTreatment } from '@/types';

const store = usePlannedTreatmentsStore();
const { plannedTreatments, isLoading } = storeToRefs(store);
const route = useRoute();

// Definimos los eventos que vamos a emitir
const emit = defineEmits(['generate-budget', 'register-history']);

function removePlan(id: string) {
  if (confirm('¿Quitar este tratamiento del plan?')) {
    store.remove(id, route.params.id as string);
  }
}

function generateBudget() {
  emit('generate-budget', plannedTreatments.value);
}

// Nueva función que emite los datos para el historial
function registerHistory() {
  emit('register-history', plannedTreatments.value);
}
</script>

<template>
  <div class="mt-6 bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold text-text-dark mb-4">Plan de Tratamiento</h3>
    <div v-if="isLoading">Cargando plan...</div>
    <div v-else-if="plannedTreatments.length === 0" class="text-center py-4 text-text-light">
      No hay tratamientos planeados.
    </div>
    <div v-else>
      <div class="space-y-2">
        <div v-for="plan in plannedTreatments" :key="plan.id" class="flex justify-between items-center p-2 bg-gray-50 rounded-md">
          <div>
            <p class="font-semibold text-primary">{{ plan.treatment.name }}</p>
            <p class="text-sm text-text-light">
              Diente: {{ plan.toothSurfaceState.toothNumber }}, Superficie: {{ plan.toothSurfaceState.surface }}
            </p>
          </div>
          <button @click="removePlan(plan.id)" class="text-danger text-sm hover:underline">Quitar</button>
        </div>
      </div>
      <div class="flex justify-end mt-4 border-t pt-4 space-x-4">
        <button @click="registerHistory" class="btn-secondary">Registrar en Historial</button>
        <button @click="generateBudget" class="btn-primary">Generar Presupuesto</button>
      </div>
    </div>
  </div>
</template>