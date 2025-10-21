<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'; // <-- Añadimos watch
import { usePatientsStore } from '@/stores/patients';
import type { Patient } from '@/types';
import Modal from '@/components/Modal.vue';
import PatientForm from '@/components/PatientForm.vue';
import { storeToRefs } from 'pinia';

const patientsStore = usePatientsStore();
const { patients, isLoading } = storeToRefs(patientsStore);

const isModalOpen = ref(false);
const patientToEdit = ref<Patient | null>(null);

// --- LÓGICA DEL BUSCADOR (Existente) ---
const searchQuery = ref('');

const filteredPatients = computed(() => {
  if (!searchQuery.value) {
    return patients.value;
  }
  return patients.value.filter(patient =>
    patient.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    patient.dni.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// --- INICIO DE LA LÓGICA DE PAGINACIÓN ---

const currentPage = ref(1);
const pageSize = 10; // Mostrar 10 pacientes por página

// 1. Resetea a la página 1 cada vez que el usuario busca algo
watch(searchQuery, () => {
  currentPage.value = 1;
});

// 2. Calcula el número total de páginas basado en la lista FILTRADA
const totalPages = computed(() => {
  return Math.ceil(filteredPatients.value.length / pageSize);
});

// 3. "Rebana" la lista filtrada para mostrar solo la página actual
const paginatedPatients = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return filteredPatients.value.slice(startIndex, endIndex);
});

// 4. Funciones para cambiar de página
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

// --- FIN DE LA LÓGICA DE PAGINACIÓN ---

onMounted(() => {
  patientsStore.fetchPatients();
});

function openCreateModal() {
  patientToEdit.value = null;
  isModalOpen.value = true;
}

function openEditModal(patient: Patient) {
  patientToEdit.value = patient;
  isModalOpen.value = true;
}

function handlePatientSaved() {
  isModalOpen.value = false;
}
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <h1 class="text-3xl font-bold text-text-dark">Gestión de Pacientes</h1>
      
      <div class="relative w-full md:w-1/3">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Buscar por nombre o DNI..." 
          class="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-primary"
        />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <button @click="openCreateModal" class="w-full md:w-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold">
        + Nuevo Paciente
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <div v-if="isLoading && patients.length === 0">Cargando pacientes...</div>
      
      <table v-else-if="filteredPatients.length > 0" class="w-full text-left">
        <thead>
          <tr class="border-b-2 border-gray-200 text-text-light">
            <th class="py-3 px-4">Nombre Completo</th>
            <th class="py-3 px-4">DNI</th>
            <th class="py-3 px-4">Teléfono</th>
            <th class="py-3 px-4">Email</th>
            <th class="py-3 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="patient in paginatedPatients" :key="patient.id" class="border-b border-gray-200 hover:bg-light-gray">
            <td class="py-3 px-4 font-medium text-text-dark">{{ patient.fullName }}</td>
            <td class="py-3 px-4">{{ patient.dni }}</td>
            <td class="py-3 px-4">{{ patient.phone }}</td>
            <td class="py-3 px-4">{{ patient.email || 'N/A' }}</td>
            <td class="py-3 px-4 space-x-4">
              <button @click="openEditModal(patient)" class="text-secondary hover:underline font-semibold">Editar</button>
              <RouterLink :to="{ name: 'patient-detail', params: { id: patient.id } }" class="text-primary hover:underline font-semibold">
                Ver Ficha
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="text-center py-4 text-text-light">
        No se encontraron pacientes que coincidan con tu búsqueda.
      </div>

      <div v-if="totalPages > 1" class="flex justify-between items-center mt-6">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-gray-200 text-text-dark rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        
        <span class="text-sm text-text-light">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-gray-200 text-text-dark rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
      </div>

    <Modal :isOpen="isModalOpen" @close="isModalOpen = false">
      <template #header>
        {{ patientToEdit ? 'Editar Paciente' : 'Registrar Nuevo Paciente' }}
      </template>
      <template #default>
        <PatientForm 
          v-if="isModalOpen"
          :initial-data="patientToEdit" 
          @patient-saved="handlePatientSaved" 
          @cancel="isModalOpen = false" 
        />
      </template>
    </Modal>
  </div>
</template>