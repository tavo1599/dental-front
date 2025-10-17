<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useConsentTemplatesStore } from '@/stores/consentTemplates';
import { storeToRefs } from 'pinia';
import Modal from '@/components/Modal.vue';
import ConsentTemplateForm from '@/components/ConsentTemplateForm.vue';
import type { ConsentTemplate } from '@/types';

const templatesStore = useConsentTemplatesStore();
const { clinicTemplates, isLoading } = storeToRefs(templatesStore);

onMounted(() => {
  templatesStore.fetchAllTemplates();
});

const isModalOpen = ref(false);
const selectedTemplate = ref<Partial<ConsentTemplate> | null>(null);

function openCreateModal() {
  selectedTemplate.value = null;
  isModalOpen.value = true;
}

function openEditModal(template: ConsentTemplate) {
  selectedTemplate.value = { ...template };
  isModalOpen.value = true;
}

async function handleSave(data: ConsentTemplate) {
  let success = false;
  if (data.id) {
    success = await templatesStore.updateTemplate(data.id, data);
  } else {
    success = await templatesStore.createTemplate(data);
  }
  if (success) {
    isModalOpen.value = false;
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-text-dark">Plantillas de Consentimiento de la Clínica</h2>
      <button @click="openCreateModal" class="btn-primary">
        + Nueva Plantilla
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <div v-if="isLoading && clinicTemplates.length === 0" class="text-center">Cargando...</div>
      <div v-else-if="clinicTemplates.length === 0" class="text-center text-gray-500 py-8">
        <p>Aún no has creado ninguna plantilla personalizada.</p>
        <p class="text-sm">Las plantillas del sistema se mostrarán al generar un consentimiento.</p>
      </div>
      <ul v-else class="divide-y divide-gray-200">
        <li v-for="template in clinicTemplates" :key="template.id" class="py-3 flex justify-between items-center">
          <div>
            <p class="font-semibold text-text-dark">{{ template.title }}</p>
            <p v-if="template.category" class="text-sm text-gray-500">{{ template.category }}</p>
          </div>
          <div class="space-x-2">
            <button @click="openEditModal(template)" class="btn-secondary text-sm">Editar</button>
            <button @click="templatesStore.deleteTemplate(template.id)" class="btn-secondary !bg-red-50 !text-red-600 text-sm">Eliminar</button>
          </div>
        </li>
      </ul>
    </div>

    <Modal :isOpen="isModalOpen" @close="isModalOpen = false" size="screen-xl">
  <template #header>{{ selectedTemplate ? 'Editar' : 'Crear' }} Plantilla</template>
  <template #default>
    <ConsentTemplateForm 
      v-if="isModalOpen"
      :initial-data="selectedTemplate"
      :loading="isLoading"
      @submit="handleSave"
      @cancel="isModalOpen = false"
    />
  </template>
</Modal>
  </div>
</template>