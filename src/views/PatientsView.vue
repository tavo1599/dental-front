<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { usePatientsStore } from '@/stores/patients';
import type { Patient } from '@/types';
import Modal from '@/components/Modal.vue';
import PatientForm from '@/components/PatientForm.vue';
import { storeToRefs } from 'pinia';

const patientsStore = usePatientsStore();
const { patients, isLoading } = storeToRefs(patientsStore);

const isModalOpen = ref(false);
const patientToEdit = ref<Patient | null>(null);

// --- LÓGICA DEL BUSCADOR ---
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

// --- LÓGICA DE PAGINACIÓN ---
const currentPage = ref(1);
const pageSize = 10;

watch(searchQuery, () => {
  currentPage.value = 1;
});

const totalPages = computed(() => {
  return Math.ceil(filteredPatients.value.length / pageSize);
});

const paginatedPatients = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return filteredPatients.value.slice(startIndex, endIndex);
});

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

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
  <div class="p-4 md:p-6"> <!-- Padding ajustado para móvil -->
    
    <!-- HEADER: Título, Buscador y Botón -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 class="text-2xl md:text-3xl font-bold text-text-dark">Gestión de Pacientes</h1>
      
      <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
        <div class="relative w-full md:w-80">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Buscar por nombre o DNI..." 
            class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <button @click="openCreateModal" class="w-full md:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 font-semibold shadow-sm flex justify-center items-center gap-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>
          Nuevo Paciente
        </button>
      </div>
    </div>

    <!-- CONTENEDOR DE DATOS -->
    <div class="bg-white rounded-lg shadow-md border border-gray-200">
      
      <!-- LOADING -->
      <div v-if="isLoading && patients.length === 0" class="p-8 text-center text-gray-500">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        Cargando pacientes...
      </div>
      
      <!-- ESTADO VACÍO -->
      <div v-else-if="filteredPatients.length === 0" class="p-12 text-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        <p>No se encontraron pacientes.</p>
      </div>

      <div v-else>
        <!-- ========================================== -->
        <!-- VISTA DE TABLA (Solo Desktop 'md:block') -->
        <!-- ========================================== -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Nombre Completo</th>
                <th class="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">DNI</th>
                <th class="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Teléfono</th>
                <th class="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider">Email</th>
                <th class="py-3 px-6 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="patient in paginatedPatients" :key="patient.id" class="hover:bg-gray-50 transition-colors">
                <td class="py-4 px-6 font-medium text-gray-900">{{ patient.fullName }}</td>
                <td class="py-4 px-6 text-gray-500">{{ patient.dni }}</td>
                <td class="py-4 px-6 text-gray-500">{{ patient.phone }}</td>
                <td class="py-4 px-6 text-gray-500">{{ patient.email || '-' }}</td>
                <td class="py-4 px-6 text-right space-x-2">
                  <button @click="openEditModal(patient)" class="text-indigo-600 hover:text-indigo-900 font-medium hover:underline">Editar</button>
                  <span class="text-gray-300">|</span>
                  <RouterLink :to="{ name: 'patient-detail', params: { id: patient.id } }" class="text-primary hover:text-blue-700 font-medium hover:underline">
                    Ver Ficha
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ========================================== -->
        <!-- VISTA DE TARJETAS (Solo Móvil 'md:hidden') -->
        <!-- ========================================== -->
        <div class="md:hidden divide-y divide-gray-200">
          <div v-for="patient in paginatedPatients" :key="patient.id" class="p-4 space-y-3">
            <!-- Encabezado Tarjeta -->
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-base font-bold text-gray-900">{{ patient.fullName }}</h3>
                <p class="text-sm text-gray-500">DNI: {{ patient.dni }}</p>
              </div>
              <div class="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                 PCT
              </div>
            </div>

            <!-- Detalles -->
            <div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <span class="block text-xs text-gray-400 uppercase">Teléfono</span>
                {{ patient.phone }}
              </div>
              <div>
                <span class="block text-xs text-gray-400 uppercase">Email</span>
                <span class="truncate block">{{ patient.email || '-' }}</span>
              </div>
            </div>

            <!-- Acciones (Botones grandes) -->
            <div class="flex gap-3 pt-2">
              <button 
                @click="openEditModal(patient)" 
                class="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50 flex justify-center items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Editar
              </button>
              <RouterLink 
                :to="{ name: 'patient-detail', params: { id: patient.id } }" 
                class="flex-1 py-2 px-4 bg-primary text-white rounded-lg font-medium text-sm hover:bg-opacity-90 text-center flex justify-center items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Ver Ficha
              </RouterLink>
            </div>
          </div>
        </div>

      </div>
    
      <!-- PAGINACIÓN -->
      <div v-if="totalPages > 1" class="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 gap-4">
        
        <!-- Información (Oculta en móvil muy pequeño) -->
        <span class="text-sm text-gray-500 order-2 sm:order-1">
          Página <span class="font-medium">{{ currentPage }}</span> de <span class="font-medium">{{ totalPages }}</span>
        </span>
        
        <!-- Botones -->
        <div class="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
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