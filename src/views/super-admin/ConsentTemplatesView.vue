<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useConsentTemplatesStore } from '@/stores/consentTemplates';
import { storeToRefs } from 'pinia';
import Modal from '@/components/Modal.vue';
import ConsentTemplateForm from '@/components/ConsentTemplateForm.vue';
import type { ConsentTemplate } from '@/types';

const templatesStore = useConsentTemplatesStore();
// Usamos 'systemTemplates' porque el Super Admin solo gestiona las plantillas del sistema
const { systemTemplates, isLoading } = storeToRefs(templatesStore);

onMounted(() => {
  // --- CORRECCIÓN CLAVE AQUÍ ---
  // Llamamos a la función con el nombre correcto: fetchAllTemplates
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
    // Usamos el nombre de función actualizado
    success = await templatesStore.updateTemplate(data.id, data);
  } else {
    // Usamos el nombre de función actualizado
    success = await templatesStore.createTemplate(data);
  }
  if (success) {
    isModalOpen.value = false;
  }
}

function handleDelete(id: string) {
  if (confirm('¿Estás seguro de que quieres eliminar esta plantilla del sistema?')) {
    // Usamos el nombre de función actualizado
    templatesStore.deleteTemplate(id);
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold text-white">Plantillas de Consentimiento del Sistema</h1>
      <button @click="openCreateModal" class="btn-primary">
        + Nueva Plantilla
      </button>
    </div>

    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div v-if="isLoading && systemTemplates.length === 0" class="text-center text-gray-400">Cargando...</div>
      <div v-else-if="systemTemplates.length === 0" class="text-center text-gray-400 py-8">
        <p>No hay plantillas de sistema creadas.</p>
      </div>
      <ul v-else class="divide-y divide-gray-700">
        <li v-for="template in systemTemplates" :key="template.id" class="py-3 flex justify-between items-center">
          <div>
            <p class="font-semibold text-white">{{ template.title }}</p>
          </div>
          <div class="space-x-2">
            <button @click="openEditModal(template)" class="btn-secondary text-sm">Editar</button>
            <button @click="handleDelete(template.id)" class="btn-secondary !bg-red-900/50 !text-red-400 text-sm">Eliminar</button>
          </div>
        </li>
      </ul>
    </div>

    <Modal :isOpen="isModalOpen" @close="isModalOpen = false">
      <template #header>{{ selectedTemplate ? 'Editar' : 'Crear' }} Plantilla del Sistema</template>
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

<style scoped>
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; }
.btn-secondary { @apply px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 font-semibold; }
</style>