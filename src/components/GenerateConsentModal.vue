<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useConsentTemplatesStore } from '@/stores/consentTemplates';
import { storeToRefs } from 'pinia';
import type { ConsentTemplate } from '@/types';

const emit = defineEmits(['close', 'generate']);

const store = useConsentTemplatesStore();
const { templates, isLoading } = storeToRefs(store);

const selectedTemplateId = ref<string | null>(null);

// Esta función carga las plantillas cuando se abre el modal
onMounted(() => {
  store.fetchAll();
});

function generate() {
  if (selectedTemplateId.value) {
    emit('generate', selectedTemplateId.value);
  }
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-text-light">Selecciona una plantilla para generar el documento. Los datos se rellenarán automáticamente.</p>
    
    <div v-if="isLoading" class="text-center py-4">Cargando plantillas...</div>
    <div v-else>
      <label for="template-select" class="block text-sm font-medium text-text-dark">Plantillas Disponibles</label>
      <select v-model="selectedTemplateId" id="template-select" class="mt-1 block w-full input-style">
        <option disabled :value="null">Elige un consentimiento...</option>
        <optgroup label="Adultos">
          <option v-for="t in templates.filter(t => !t.forMinor)" :key="t.id" :value="t.id">{{ t.title }}</option>
        </optgroup>
        <optgroup label="Menores de Edad (Apoderado)">
          <option v-for="t in templates.filter(t => t.forMinor)" :key="t.id" :value="t.id">{{ t.title }}</option>
        </optgroup>
      </select>
    </div>
    
    <div class="flex justify-end space-x-4 pt-4 border-t">
      <button @click="emit('close')" type="button" class="btn-secondary">Cancelar</button>
      <button @click="generate" type="button" class="btn-primary" :disabled="!selectedTemplateId || isLoading">Generar Documento</button>
    </div>
  </div>
</template>