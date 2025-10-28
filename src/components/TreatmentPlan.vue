<script setup lang="ts">
import { computed } from 'vue'; // <-- 1. Importa 'computed'
import { usePlannedTreatmentsStore } from '@/stores/plannedTreatments';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import type { PlannedTreatment } from '@/types';

const store = usePlannedTreatmentsStore();
const { plannedTreatments, isLoading } = storeToRefs(store);
const route = useRoute();

const emit = defineEmits(['generate-budget', 'register-history', 'clear-plan']);

// --- 2. CREA LA PROPIEDAD COMPUTADA DE AGRUPACIÓN ---
const groupedTreatments = computed(() => {
  // Usamos un Map para agrupar los tratamientos por su ID
  const groups = new Map<string, { name: string; treatmentId: string; count: number; plans: PlannedTreatment[] }>();

  for (const plan of plannedTreatments.value) {
    const treatmentId = plan.treatment.id;
    
    // Si el grupo no existe, lo creamos
    if (!groups.has(treatmentId)) {
      groups.set(treatmentId, {
        treatmentId: treatmentId,
        name: plan.treatment.name,
        count: 0,
        plans: [],
      });
    }

    // Añadimos el plan al grupo
    const group = groups.get(treatmentId)!;
    group.count++;
    group.plans.push(plan);
  }

  // Convertimos el Map de nuevo a un Array para el v-for
  return Array.from(groups.values());
});
// --- FIN ---

function removePlan(id: string) {
  if (confirm('¿Quitar este tratamiento del plan?')) {
    store.remove(id, route.params.id as string);
  }
}

function generateBudget() {
  emit('generate-budget', plannedTreatments.value); // Enviamos la lista plana original
}

function registerHistory() {
  emit('register-history', plannedTreatments.value); // Enviamos la lista plana original
}

function clearPlan() {
  if (confirm('¿Estás seguro de que deseas limpiar el plan de tratamiento actual?')) {
    emit('clear-plan');
  }
}
</script>

<template>
  <div class="mt-6 bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-xl font-bold text-text-dark mb-4">Plan de Tratamiento</h3>
    <div v-if="isLoading">Cargando...</div>
    <div v-else-if="plannedTreatments.length === 0" class="text-center py-4 text-text-light">
      No hay tratamientos planeados.
    </div>
    <div v-else>
      <div class="space-y-4">
        
        <div v-for="group in groupedTreatments" :key="group.treatmentId" class="p-3 bg-gray-50 rounded-md">
          
          <p class="font-semibold text-primary">{{ group.name }} (x{{ group.count }})</p>
          
          <ul class="mt-1 pl-4 space-y-1">
            <li v-for="plan in group.plans" :key="plan.id" class="flex justify-between items-center text-sm">
              <p class="text-text-light">
                Diente: {{ plan.toothSurfaceState.toothNumber }}, Superficie: {{ plan.toothSurfaceState.surface }}
              </p>
              <button @click="removePlan(plan.id)" class="text-danger text-xs hover:underline">Quitar</button>
            </li>
          </ul>
        </div>
        
      </div>
      <div class="flex justify-between items-center mt-4 border-t pt-4">
        <button @click="clearPlan" class="btn-secondary !bg-red-100 !text-danger">Limpiar Plan</button>
        <div class="space-x-4">
          <button @click="registerHistory" class="btn-secondary">Registrar en Historial</button>
          <button @click="generateBudget" class="btn-primary">Generar Presupuesto</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Añade 'text-danger' si no lo tienes */
.text-danger {
  @apply text-red-500 hover:text-red-700;
}
</style>