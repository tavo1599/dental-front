<script setup lang="ts">
import { ref } from 'vue';
import { usePatientsStore } from '@/stores/patients';
import { storeToRefs } from 'pinia';
import Modal from '@/components/Modal.vue';
import AnamnesisGeneralForm from '@/components/AnamnesisGeneralForm.vue';
import AnamnesisPediatricaForm from '@/components/AnamnesisPediatricaForm.vue';
import AnamnesisOrtodonciaForm from '@/components/AnamnesisOrthodonticForm.vue'; // 1. Importa el nuevo formulario
import AnamnesisGeneralSummary from '@/components/AnamnesisGeneralSummary.vue';
// (Puedes crear un AnamnesisOrtodonciaSummary en el futuro)

const patientsStore = usePatientsStore();
// 2. Obtiene los 3 historiales del store
const { 
  medicalHistory, 
  odontopediatricHistory, 
  orthodonticHistory, // <-- Nuevo
  isHistoryLoading, 
  selectedPatient 
} = storeToRefs(patientsStore);
    
const isModalOpen = ref(false);
const selectedForm = ref<'general' | 'pediatria' | 'ortodoncia' | null>(null); // <-- 3. Añade 'ortodoncia'
    
async function openForm(formType: 'general' | 'pediatria' | 'ortodoncia') {
  selectedForm.value = formType;
  // Si abrimos ortodoncia, solicitamos el historial específico antes de mostrar
  if (formType === 'ortodoncia' && selectedPatient.value) {
    await patientsStore.fetchOrthodonticHistory(selectedPatient.value.id);
  }
  isModalOpen.value = true;
}
    
async function handleSave(data: any) {
  if (!selectedPatient.value) return;
  let success = false;

  // 4. Añade la lógica de guardado
  if (selectedForm.value === 'general') {
    success = await patientsStore.updateMedicalHistory(selectedPatient.value.id, data);
  } else if (selectedForm.value === 'pediatria') {
    success = await patientsStore.updateOdontopediatricHistory(selectedPatient.value.id, data);
  } else if (selectedForm.value === 'ortodoncia') {
    success = await patientsStore.updateOrthodonticHistory(selectedPatient.value.id, data);
  }
  
  if (success) {
    isModalOpen.value = false;
  }
}
</script>
    
<template>
  <div class="space-y-6">
    
    <div v-if="isHistoryLoading" class="text-center text-gray-500">Cargando datos de anamnesis...</div>
    <div v-else-if="medicalHistory" class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-text-dark">Resumen de Anamnesis General</h2>
        <button @click="openForm('general')" class="btn-secondary">Editar</button>
      </div>
      <AnamnesisGeneralSummary :history="medicalHistory" />
    </div>
    <div v-else class="bg-white rounded-lg shadow-md p-6 text-center">
      <p class="text-text-light mb-4">El paciente aún no tiene un historial de anamnesis general.</p>
      <button @click="openForm('general')" class="btn-primary">
        + Llenar Anamnesis General
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-bold text-text-dark mb-4">Formularios Específicos</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button @click="openForm('pediatria')" class="form-card">
          <h3 class="font-semibold text-lg">Anamnesis Odontopediátrica</h3>
          <p class="text-sm">Historial de nacimiento, hábitos, etc.</p>
          <span v-if="odontopediatricHistory" class="tag-completo">Completado</span>
        </button>
        <button @click="openForm('ortodoncia')" class="form-card">
          <h3 class="font-semibold text-lg">Anamnesis de Ortodoncia</h3>
          <p class="text-sm">Análisis facial, oclusal y cefalométrico.</p>
          <span v-if="orthodonticHistory" class="tag-completo">Completado</span>
        </button>
        <button class="form-card" disabled>
          <h3 class="font-semibold text-lg">Anamnesis de Endodoncia</h3>
          <p class="text-sm">(Próximamente)</p>
        </button>
      </div>
    </div>
  </div>

  <Modal :isOpen="isModalOpen" @close="isModalOpen = false" size="5xl">
    <template #header>
      <span v-if="selectedForm === 'general'">Anamnesis General</span>
      <span v-if="selectedForm === 'pediatria'">Anamnesis Odontopediátrica</span>
      <span v-if="selectedForm === 'ortodoncia'">Anamnesis de Ortodoncia</span>
    </template>
    <template #default>
      <AnamnesisGeneralForm
        v-if="selectedForm === 'general'"
        :initial-data="medicalHistory"
        :loading="isHistoryLoading"
        @submit="handleSave"
        @cancel="isModalOpen = false"
      />
      <AnamnesisPediatricaForm
        v-if="selectedForm === 'pediatria'"
        :initial-data="odontopediatricHistory"
        :loading="isHistoryLoading"
        @submit="handleSave"
        @cancel="isModalOpen = false"
      />
      <AnamnesisOrtodonciaForm
        v-if="selectedForm === 'ortodoncia'"
        :initial-data="orthodonticHistory"
        :loading="isHistoryLoading"
        @submit="handleSave"
        @cancel="isModalOpen = false"
      />
    </template>
  </Modal>
</template>
    
<style scoped>
.form-card {
  @apply relative p-4 border rounded-lg text-left transition-all hover:shadow-lg hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed;
}
.form-card h3 { @apply text-primary; }
.form-card p { @apply text-text-light; }
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; }
.btn-secondary { @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; }
.tag-completo {
  @apply absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full;
}
</style>