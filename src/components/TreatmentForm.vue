<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Treatment } from '@/types'; // <-- Asegúrate de importar desde @/types

// 1. Cambiamos 'initialData' por 'modelValue' para que sea compatible con v-model
const props = defineProps<{
  modelValue: Partial<Treatment>;
  loading: boolean;
}>();

// 2. El evento ahora es 'update:modelValue'
const emit = defineEmits(['submit', 'cancel', 'update:modelValue']);

// 3. Creamos un ref local para los datos del formulario
const formData = ref<Partial<Treatment>>({});

// 4. Usamos un 'watch' para sincronizar el estado interno con los datos que vienen de fuera
watch(() => props.modelValue, (newValue) => {
  formData.value = { ...newValue };
}, { immediate: true, deep: true });

function handleSubmit() {
  emit('submit', formData.value);
}
</script>
<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label for="name" class="block text-sm font-medium text-text-light">Nombre del Tratamiento</label>
      <input v-model="formData.name" type="text" id="name" class="mt-1 block w-full input-style" required />
    </div>
    <div>
      <label for="description" class="block text-sm font-medium text-text-light">Descripción (Opcional)</label>
      <textarea v-model="formData.description" id="description" rows="3" class="mt-1 block w-full input-style"></textarea>
    </div>
    <div>
      <label for="price" class="block text-sm font-medium text-text-light">Precio (S/.)</label>
      <input v-model="formData.price" type="number" step="0.01" id="price" class="mt-1 block w-full input-style" required />
    </div>
    <div class="flex justify-end space-x-4 pt-4">
      <button @click="emit('cancel')" type="button" class="px-6 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold">
        Cancelar
      </button>
      <button type="submit" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Guardar Tratamiento' }}
      </button>
    </div>
  </form>
</template>
<style scoped>
.input-style {
  @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary;
}
</style>