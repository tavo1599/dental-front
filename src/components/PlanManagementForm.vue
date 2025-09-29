<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Tenant } from '@/types';

const props = defineProps<{
  tenant: Tenant | null;
  loading: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

// Objeto para definir los límites por defecto de cada plan
const planDefaults = {
  basico: { maxUsers: 3 },
  profesional: { maxUsers: 10 },
  premium: { maxUsers: 999 }, // Usamos un número alto para 'ilimitado'
};

const formData = ref({
  plan: 'profesional',
  maxUsers: 10,
});

// Este 'watch' se activa cuando se carga el componente
watch(() => props.tenant, (newTenant) => {
  if (newTenant) {
    formData.value.plan = newTenant.plan;
    formData.value.maxUsers = newTenant.maxUsers;
  }
}, { immediate: true });

// --- LÓGICA AÑADIDA ---
// Este 'watch' se activa CADA VEZ que el usuario cambia el plan en el <select>
watch(() => formData.value.plan, (newPlan) => {
  // Verificamos que el plan exista en nuestros defaults
  if (newPlan in planDefaults) {
    // Actualizamos el número de usuarios al valor por defecto de ese plan
    formData.value.maxUsers = planDefaults[newPlan as keyof typeof planDefaults].maxUsers;
  }
});
</script>

<template>
  <form @submit.prevent="emit('submit', formData)" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-400">Plan Actual</label>
      <select v-model="formData.plan" class="input-style-dark w-full mt-1">
        <option value="basico">Básico</option>
        <option value="profesional">Profesional</option>
        <option value="premium">Premium</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-400">Límite de Usuarios (Editable)</label>
      <input v-model.number="formData.maxUsers" type="number" class="input-style-dark w-full mt-1" />
    </div>
    <div class="flex justify-end gap-4 pt-4">
      <button @click="emit('cancel')" type="button" class="btn-secondary">Cancelar</button>
      <button type="submit" :disabled="loading" class="btn-primary">Guardar Cambios</button>
    </div>
  </form>
</template>

<style scoped>
.input-style-dark { @apply bg-gray-700 border-gray-600 text-white rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; }
.btn-secondary { @apply px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 font-semibold; }
</style>