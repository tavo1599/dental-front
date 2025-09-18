<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useConsentTemplatesStore } from '@/stores/consentTemplates';
import { storeToRefs } from 'pinia';
import Modal from '@/components/Modal.vue';
import ConsentTemplateForm from '@/components/ConsentTemplateForm.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import type { ConsentTemplate } from '@/types';

const store = useConsentTemplatesStore();
const { templates, isLoading } = storeToRefs(store);

const isModalOpen = ref(false);
const isConfirmModalOpen = ref(false);
const formData = ref<Partial<ConsentTemplate>>({});
const templateToDelete = ref<ConsentTemplate | null>(null);

onMounted(() => {
  store.fetchAll();
});

function openCreateModal() {
  formData.value = { title: '', content: '', forMinor: false };
  isModalOpen.value = true;
}

function openEditModal(template: ConsentTemplate) {
  formData.value = { ...template };
  isModalOpen.value = true;
}

function openDeleteModal(template: ConsentTemplate) {
  templateToDelete.value = template;
  isConfirmModalOpen.value = true;
}

async function handleSave(data: any) {
  let success = false;
  const payload = { title: data.title, content: data.content, forMinor: data.forMinor };
  
  if (data.id) {
    success = await store.update(data.id, payload);
  } else {
    success = await store.create(payload);
  }
  if (success) {
    isModalOpen.value = false;
  }
}

async function handleDelete() {
  if (templateToDelete.value) {
    await store.remove(templateToDelete.value.id);
  }
  isConfirmModalOpen.value = false;
}
</script>
<template>
  <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Plantillas de Consentimiento</h2>
      <button @click="openCreateModal" class="btn-primary">+ Nueva Plantilla</button>
    </div>
    <div v-if="isLoading && templates.length === 0" class="text-center py-8 text-gray-400">Cargando...</div>
    <table v-else-if="templates.length > 0" class="w-full text-left text-gray-300">
      <thead>
        <tr class="border-b border-gray-600 text-sm">
          <th class="p-3">Título</th>
          <th class="p-3">Tipo</th>
          <th class="p-3 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="template in templates" :key="template.id" class="border-b border-gray-700 hover:bg-gray-700">
          <td class="p-3 font-medium text-white">{{ template.title }}</td>
          <td class="p-3">{{ template.forMinor ? 'Menor de Edad (Apoderado)' : 'Adulto' }}</td>
          <td class="p-3 text-center space-x-4">
            <button @click="openEditModal(template)" class="text-yellow-400 hover:underline">Editar</button>
            <button @click="openDeleteModal(template)" class="text-danger hover:underline">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="text-center py-8 text-gray-400">No hay plantillas de consentimiento creadas.</div>
  </div>
  
  <Modal :isOpen="isModalOpen" @close="isModalOpen = false">
    <template #header>{{ formData.id ? 'Editar Plantilla' : 'Nueva Plantilla' }}</template>
    <template #default>
      <ConsentTemplateForm 
        v-if="isModalOpen" 
        :initial-data="formData" 
        :loading="isLoading" 
        @submit="handleSave" 
        @cancel="isModalOpen = false" 
      />
    </template>
  </Modal>

  <ConfirmationModal 
    :isOpen="isConfirmModalOpen"
    title="Confirmar Eliminación"
    :message="`¿Estás seguro de que deseas eliminar la plantilla '${templateToDelete?.title}'?`"
    confirmButtonText="Sí, Eliminar"
    @confirm="handleDelete"
    @cancel="isConfirmModalOpen = false"
  />
</template>
<style scoped>
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; }
</style>