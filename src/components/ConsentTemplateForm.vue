<script setup lang="ts">
import { ref, watchEffect, nextTick } from 'vue';
import type { ConsentTemplate } from '@/types';
import PlaceholderButtons from './PlaceholderButtons.vue';
import ConsentPreview from './ConsentPreview.vue';

const props = defineProps<{
  initialData?: Partial<ConsentTemplate> | null;
  loading: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

const formData = ref<Partial<ConsentTemplate>>({ forMinor: false });
const textareaRef = ref<HTMLTextAreaElement | null>(null);

watchEffect(() => {
  formData.value = { forMinor: false, ...props.initialData };
});

function insertPlaceholder(tag: string) {
  if (!textareaRef.value) return;

  const start = textareaRef.value.selectionStart;
  const end = textareaRef.value.selectionEnd;
  const text = textareaRef.value.value;

  const newText = text.substring(0, start) + tag + text.substring(end);
  formData.value.content = newText;

  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus();
      textareaRef.value.selectionStart = textareaRef.value.selectionEnd = start + tag.length;
    }
  });
}

const handleSubmit = () => {
  emit('submit', formData.value);
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <div class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700">Título de la Plantilla</label>
          <input v-model="formData.title" type="text" id="title" class="input-style w-full mt-1" required />
        </div>
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700">Categoría</label>
          <input v-model="formData.category" type="text" id="category" class="input-style w-full mt-1" placeholder="Ej: Cirugía, Ortodoncia..." />
        </div>
        <div class="flex items-center">
          <input v-model="formData.forMinor" type="checkbox" id="forMinor" class="h-4 w-4 rounded text-primary focus:ring-primary border-gray-300" />
          <label for="forMinor" class="ml-2 text-sm text-gray-700">Es para menores de edad (firma apoderado)</label>
        </div>
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700">Contenido</label>
          <PlaceholderButtons @insert-placeholder="insertPlaceholder" class="mt-1" />
          <textarea v-model="formData.content" ref="textareaRef" id="content" rows="12" class="input-style w-full mt-2" required></textarea>
        </div>
      </div>

      <div>
        <ConsentPreview 
          :template-content="formData.content || ''" 
          :template-title="formData.title || 'Título de la Plantilla'"
        />
      </div>
    </div>
    
    <div class="flex justify-end space-x-4 pt-6 border-t mt-8">
      <button @click="emit('cancel')" type="button" class="btn-secondary">Cancelar</button>
      <button type="submit" :disabled="loading" class="btn-primary">
        {{ loading ? 'Guardando...' : 'Guardar Plantilla' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.input-style { @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold disabled:opacity-50; }
.btn-secondary { @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; }
</style>