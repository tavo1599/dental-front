<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useTreatmentsStore } from '@/stores/treatments';
import type { Treatment } from '@/types';
import { storeToRefs } from 'pinia';
import Modal from '@/components/Modal.vue';
import TreatmentForm from '@/components/TreatmentForm.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue'; // <-- 1. Importa el nuevo modal


const treatmentsStore = useTreatmentsStore();
const { treatments, isLoading } = storeToRefs(treatmentsStore);

const isModalOpen = ref(false);
const formData = ref<Partial<Treatment>>({});

const isConfirmModalOpen = ref(false);
const treatmentToDeleteId = ref<string | null>(null);

onMounted(() => {
  treatmentsStore.fetchTreatments();
});

function openCreateModal() {
  formData.value = { name: '', description: '', price: 0 };
  isModalOpen.value = true;
}

function openEditModal(treatment: Treatment) {
  formData.value = { ...treatment };
  isModalOpen.value = true;
}

async function handleSaveTreatment(data: Treatment) {
  let success = false;
  if (data.id) {
    success = await treatmentsStore.updateTreatment(data.id, data);
  } else {
    success = await treatmentsStore.createTreatment(data as Omit<Treatment, 'id'>);
  }
  if (success) {
    isModalOpen.value = false;
  }
}

function openConfirmDeleteModal(id: string) {
  treatmentToDeleteId.value = id; // Guarda el ID del tratamiento a eliminar
  isConfirmModalOpen.value = true; // Abre el modal de confirmación
}

function handleDeleteTreatment() {
  if (treatmentToDeleteId.value) {
    treatmentsStore.deleteTreatment(treatmentToDeleteId.value);
  }
  isConfirmModalOpen.value = false; // Cierra el modal
}
</script>
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-text-dark">Gestión de Tratamientos</h1>
      <button @click="openCreateModal" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold">
        + Nuevo Tratamiento
      </button>
    </div>
    <div class="bg-white rounded-lg shadow-md p-6">
      <div v-if="isLoading && treatments.length === 0" class="text-center py-4 text-text-light">Cargando...</div>
      <div v-else-if="treatments.length === 0" class="text-center py-4 text-text-light">No hay tratamientos registrados.</div>
      <table v-else class="w-full text-left">
        <thead>
          <tr class="border-b-2 border-gray-200 text-text-light">
            <th class="py-3 px-4">Nombre</th>
            <th class="py-3 px-4">Descripción</th>
            <th class="py-3 px-4">Precio</th>
            <th class="py-3 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="treatment in treatments" :key="treatment.id" class="border-b border-gray-200 hover:bg-light-gray">
            <td class="py-3 px-4 font-medium text-text-dark">{{ treatment.name }}</td>
            <td class="py-3 px-4 text-sm text-text-light">{{ treatment.description || 'N/A' }}</td>
            <td class="py-3 px-4">S/. {{ Number(treatment.price).toFixed(2) }}</td>
            <td class="py-3 px-4 space-x-4">
            <button @click="openEditModal(treatment)" class="text-primary hover:underline font-semibold">Editar</button>
            <button @click="openConfirmDeleteModal(treatment.id)" class="text-danger hover:underline font-semibold">Eliminar</button>
          </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :isOpen="isModalOpen" @close="isModalOpen = false">
      <template #header>{{ formData.id ? 'Editar Tratamiento' : 'Nuevo Tratamiento' }}</template>
      <template #default>
        <TreatmentForm v-if="isModalOpen" v-model="formData" :loading="isLoading" @submit="handleSaveTreatment" @cancel="isModalOpen = false" />
      </template>
    </Modal>

    <ConfirmationModal 
  :isOpen="isConfirmModalOpen"
  title="Confirmar Eliminación"
  message="¿Estás seguro de que deseas eliminar este tratamiento? Esta acción no se puede deshacer."
  confirmButtonText="Sí, Eliminar" @confirm="handleDeleteTreatment"
  @cancel="isConfirmModalOpen = false"
>
  <template #icon>
    <img src="@/assets/diente-eliminar.png" alt="Advertencia" class="h-19 w-19" />
  </template>
</ConfirmationModal>

  </div>
</template>