<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Cie10Code } from '@/types';

const props = defineProps<{
  initialData?: Partial<Cie10Code> | null;
  loading: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);
const formData = ref<Partial<Cie10Code>>({});

watch(() => props.initialData, (newData) => {
  formData.value = { ...newData };
}, { immediate: true, deep: true });
</script>

<template>
  <form @submit.prevent="emit('submit', formData)" class="space-y-4">
    <div>
      <label for="code" class="block text-sm font-medium text-gray-400">Código</label>
      <input v-model="formData.code" type="text" id="code" class="mt-1 block w-full input-style-dark" required />
    </div>
    <div>
      <label for="description" class="block text-sm font-medium text-gray-400">Descripción</label>
      <textarea v-model="formData.description" id="description" rows="3" class="mt-1 block w-full input-style-dark" required></textarea>
    </div>
    <div class="flex justify-end space-x-4 pt-4">
      <button @click="emit('cancel')" type="button" class="btn-secondary">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Guardar Código' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.input-style-dark { @apply bg-gray-700 border-gray-600 text-white rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; }
.btn-secondary { @apply px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 font-semibold; }
</style>