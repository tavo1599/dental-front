<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ConsentTemplate } from '@/types';

const props = defineProps<{
  initialData?: Partial<ConsentTemplate> | null;
  loading: boolean;
}>();
const emit = defineEmits(['submit', 'cancel']);
const formData = ref<Partial<ConsentTemplate>>({ forMinor: false });

watch(() => props.initialData, (newData) => {
  formData.value = { ...newData };
}, { immediate: true, deep: true });
</script>
<template>
  <form @submit.prevent="emit('submit', formData)" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-600">Título de la Plantilla</label>
      <input v-model="formData.title" type="text" class="input-style-dark w-full text-black border-" required />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-600">Contenido</label>
      <textarea v-model="formData.content" rows="10" class="input-style-dark w-full text-black" placeholder="Usa placeholders como {{patientName}}, {{clinicName}}, {{treatmentName}}"></textarea>
    </div>
    <div class="flex items-center">
      <input v-model="formData.forMinor" type="checkbox" id="forMinor" class="h-4 w-4 rounded" />
      <label for="forMinor" class="ml-2 text-black">Es para menores de edad (apoderado)</label>
    </div>
    <div class="flex justify-end gap-4 pt-4">
      <button @click="emit('cancel')" type="button" class="btn-secondary">Cancelar</button>
      <button type="submit" :disabled="loading" class="btn-primary">Guardar Plantilla</button>
    </div>
  </form>
</template>