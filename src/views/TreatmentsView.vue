<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useTreatmentsStore } from '@/stores/treatments';
import type { Treatment } from '@/types';
import { storeToRefs } from 'pinia';
import Modal from '@/components/Modal.vue';
import TreatmentForm from '@/components/TreatmentForm.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';

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
  treatmentToDeleteId.value = id; 
  isConfirmModalOpen.value = true; 
}

function handleDeleteTreatment() {
  if (treatmentToDeleteId.value) {
    treatmentsStore.deleteTreatment(treatmentToDeleteId.value);
  }
  isConfirmModalOpen.value = false; 
}
</script>

<template>
  <div class="p-4 md:p-6">
    
    <!-- HEADER RESPONSIVO -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 class="text-2xl md:text-3xl font-bold text-text-dark">Gestión de Tratamientos</h1>
      <button 
        @click="openCreateModal" 
        class="w-full md:w-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold shadow-sm transition-colors flex justify-center items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Nuevo Tratamiento
      </button>
    </div>

    <!-- CONTENIDO -->
    <div>
      
      <!-- ESTADO DE CARGA -->
      <div v-if="isLoading && treatments.length === 0" class="text-center py-12 text-gray-500">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        Cargando tratamientos...
      </div>
      
      <!-- ESTADO VACÍO -->
      <div v-else-if="treatments.length === 0" class="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
        <p>No hay tratamientos registrados.</p>
      </div>

      <div v-else>
        
        <!-- ========================================== -->
        <!-- VISTA ESCRITORIO (TABLA) - 'hidden md:block' -->
        <!-- ========================================== -->
        <div class="hidden md:block bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <table class="w-full text-left">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Nombre</th>
                <th class="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Descripción</th>
                <th class="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Precio</th>
                <th class="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="treatment in treatments" :key="treatment.id" class="hover:bg-gray-50 transition-colors">
                <td class="py-4 px-6 font-medium text-text-dark">{{ treatment.name }}</td>
                <td class="py-4 px-6 text-sm text-text-light">{{ treatment.description || '-' }}</td>
                <td class="py-4 px-6 font-bold text-gray-700">S/. {{ Number(treatment.price).toFixed(2) }}</td>
                <td class="py-4 px-6 text-right space-x-4">
                  <button @click="openEditModal(treatment)" class="text-primary hover:text-blue-700 font-medium hover:underline">Editar</button>
                  <button @click="openConfirmDeleteModal(treatment.id)" class="text-red-500 hover:text-red-700 font-medium hover:underline">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ========================================== -->
        <!-- VISTA MÓVIL (TARJETAS) - 'md:hidden' -->
        <!-- ========================================== -->
        <div class="md:hidden space-y-4">
          <div v-for="treatment in treatments" :key="treatment.id" class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            
            <!-- Encabezado de Tarjeta -->
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-base font-bold text-gray-900 pr-2">{{ treatment.name }}</h3>
              <span class="bg-green-50 text-green-700 text-sm font-bold px-2 py-1 rounded whitespace-nowrap">
                S/. {{ Number(treatment.price).toFixed(2) }}
              </span>
            </div>
            
            <!-- Descripción -->
            <p class="text-sm text-gray-500 mb-4 line-clamp-2">
              {{ treatment.description || 'Sin descripción' }}
            </p>
            
            <!-- Botones de Acción -->
            <div class="flex gap-3 border-t border-gray-100 pt-3">
              <button 
                @click="openEditModal(treatment)" 
                class="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50 flex justify-center items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Editar
              </button>
              <button 
                @click="openConfirmDeleteModal(treatment.id)" 
                class="flex-1 py-2 px-4 bg-red-50 text-red-600 border border-red-100 rounded-lg font-medium text-sm hover:bg-red-100 flex justify-center items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- MODALES -->
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
      confirmButtonText="Sí, Eliminar" 
      @confirm="handleDeleteTreatment"
      @cancel="isConfirmModalOpen = false"
    >
      <template #icon>
        <img src="@/assets/diente-eliminar.png" alt="Advertencia de eliminacion" class="h-16 w-16 mx-auto" />
      </template>
    </ConfirmationModal>

  </div>
</template>