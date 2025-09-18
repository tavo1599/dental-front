<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useCie10Store } from '@/stores/cie10';
import { storeToRefs } from 'pinia';
import Modal from '@/components/Modal.vue';
import Cie10Form from '@/components/Cie10Form.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import type { Cie10Code } from '@/types';

const cie10Store = useCie10Store();
const { codes, isLoading } = storeToRefs(cie10Store);

const isModalOpen = ref(false);
const isConfirmModalOpen = ref(false);
const formData = ref<Partial<Cie10Code>>({});
const codeToDelete = ref<Cie10Code | null>(null);

onMounted(() => {
  cie10Store.fetchAll();
});

function openCreateModal() {
  formData.value = {};
  isModalOpen.value = true;
}

function openEditModal(code: Cie10Code) {
  formData.value = { ...code };
  isModalOpen.value = true;
}

function openDeleteModal(code: Cie10Code) {
  codeToDelete.value = code;
  isConfirmModalOpen.value = true;
}

async function handleSave(data: any) {
  let success = false;
  if (data.id) {
    success = await cie10Store.update(data.id, data);
  } else {
    success = await cie10Store.create(data);
  }
  if (success) {
    isModalOpen.value = false;
  }
}

async function handleDelete() {
  if (codeToDelete.value) {
    await cie10Store.remove(codeToDelete.value.id);
  }
  isConfirmModalOpen.value = false;
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Gestión de Diagnósticos (CIE-10)</h2>
        <button @click="openCreateModal" class="btn-primary">+ Nuevo Código</button>
      </div>
      <div v-if="isLoading && codes.length === 0" class="text-center py-8 text-gray-400">Cargando...</div>
      <table v-else-if="codes.length > 0" class="w-full text-left text-gray-300">
        <thead>
          <tr class="border-b border-gray-600 text-sm">
            <th class="p-3 w-1/4">Código</th>
            <th class="p-3 w-2/4">Descripción</th>
            <th class="p-3 w-1/4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="code in codes" :key="code.id" class="border-b border-gray-700 hover:bg-gray-700">
            <td class="p-3 font-mono">{{ code.code }}</td>
            <td class="p-3">{{ code.description }}</td>
            <td class="p-3 text-center space-x-4">
              <button @click="openEditModal(code)" class="text-yellow-400 hover:underline">Editar</button>
              <button @click="openDeleteModal(code)" class="text-danger hover:underline">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="text-center py-8 text-gray-400">No hay códigos registrados.</div>
    </div>

    <Modal :isOpen="isModalOpen" @close="isModalOpen = false">
      <template #header>{{ formData.id ? 'Editar Código' : 'Nuevo Código' }}</template>
      <template #default>
        <Cie10Form v-if="isModalOpen" :initial-data="formData" :loading="isLoading" @submit="handleSave" @cancel="isModalOpen = false" />
      </template>
    </Modal>

    <ConfirmationModal 
      :isOpen="isConfirmModalOpen"
      title="Confirmar Eliminación"
      :message="`¿Estás seguro de que deseas eliminar el código ${codeToDelete?.code}?`"
      confirmButtonText="Sí, Eliminar"
      @confirm="handleDelete"
      @cancel="isConfirmModalOpen = false"
    >
      <template #icon>
         <img src="@/assets/warning-icon.png" alt="Advertencia" class="h-8 w-8" />
      </template>
    </ConfirmationModal>
  </div>
</template>

<style scoped>
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; }
</style>