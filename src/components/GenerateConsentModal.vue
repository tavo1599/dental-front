<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useConsentTemplatesStore } from '@/stores/consentTemplates';
import { storeToRefs } from 'pinia';

const emit = defineEmits(['close', 'generate']);

const templatesStore = useConsentTemplatesStore();
const { systemTemplates, clinicTemplates, isLoading } = storeToRefs(templatesStore);

const selectedTemplateId = ref<string | null>(null);
// Nuevo estado para controlar la vista del switch
const viewMode = ref<'clinic' | 'system'>('clinic'); 

// Propiedad computada que devuelve la lista correcta según el switch
const displayedTemplates = computed(() => {
  return viewMode.value === 'clinic' ? clinicTemplates.value : systemTemplates.value;
});

onMounted(() => {
  templatesStore.fetchAllTemplates();
});

function handleGenerate() {
  if (selectedTemplateId.value) {
    emit('generate', selectedTemplateId.value);
  }
}
</script>

<template>
  <div class="space-y-6">
    <p class="text-text-light">
      Selecciona una plantilla para generar el documento.
    </p>

    <div class="flex items-center justify-center bg-gray-100 p-1 rounded-lg">
      <button 
        @click="viewMode = 'clinic'"
        :class="['flex-1 py-2 text-sm font-semibold rounded-md transition-colors', viewMode === 'clinic' ? 'bg-white shadow text-primary' : 'text-gray-500']"
      >
        De la Clínica
      </button>
      <button 
        @click="viewMode = 'system'"
        :class="['flex-1 py-2 text-sm font-semibold rounded-md transition-colors', viewMode === 'system' ? 'bg-white shadow text-primary' : 'text-gray-500']"
      >
        Del Sistema
      </button>
    </div>

    <div v-if="isLoading">Cargando plantillas...</div>

    <div v-else>
      <label for="template-select" class="block text-sm font-medium text-gray-700">Seleccionar Plantilla</label>
      <select v-model="selectedTemplateId" id="template-select" class="input-style w-full mt-1">
        <option :value="null" disabled>-- Elige una opción --</option>
        
        <option v-for="template in displayedTemplates" :key="template.id" :value="template.id">
          {{ template.title }} ({{ template.category || 'General' }})
        </option>
      </select>
      <p v-if="displayedTemplates.length === 0" class="text-xs text-center text-gray-500 mt-2">
        No hay plantillas disponibles en esta vista.
      </p>
    </div>

    <div class="flex justify-end space-x-4 pt-4">
      <button @click="emit('close')" type="button" class="btn-secondary">Cancelar</button>
      <button @click="handleGenerate" type="button" class="btn-primary" :disabled="!selectedTemplateId">
        Generar Documento
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-style { @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold disabled:opacity-50; }
.btn-secondary { @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; }
</style>