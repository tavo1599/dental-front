<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Importa useRouter
import { usePatientsStore } from '@/stores/patients';
import { useOdontogramStore } from '@/stores/odontogram';
import { useClinicalHistoryStore } from '@/stores/clinicalHistory';
import { useBudgetsStore } from '@/stores/budgets';
import { useAppointmentsStore } from '@/stores/appointments';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { Gender } from '@/types'; // Importamos el enum Gender

// Importación de Componentes
import Odontogram from '@/components/Odontogram.vue';
import ClinicalHistoryList from '@/components/ClinicalHistoryList.vue';
import BudgetList from '@/components/BudgetList.vue';
import AppointmentList from '@/components/AppointmentList.vue';
import Modal from '@/components/Modal.vue';
import ClinicalHistoryForm from '@/components/ClinicalHistoryForm.vue';
import BudgetForm from '@/components/BudgetForm.vue';
import PatientForm from '@/components/PatientForm.vue';
import ClinicalHistoryDetail from '@/components/ClinicalHistoryDetail.vue';
import PaymentHistory from '@/components/PaymentHistory.vue';
import PrintBudgetModal from '@/components/PrintBudgetModal.vue';
import type { ClinicalHistoryEntry } from '@/types';
import { usePlannedTreatmentsStore } from '@/stores/plannedTreatments'; // Importa el nuevo store
import TreatmentPlan from '@/components/TreatmentPlan.vue'; // Importa el nuevo componente
import type { PlannedTreatment } from '@/types';
import GenerateConsentModal from '@/components/GenerateConsentModal.vue';
import { useConsentTemplatesStore } from '@/stores/consentTemplates';
import { generateConsent } from '@/services/consentTemplateService';
import { useDocumentsStore } from '@/stores/documents';
import { usePeriodontogramStore } from '@/stores/periodontogram';
import Periodontogram from '@/components/Periodontogram.vue';

const periodontogramStore = usePeriodontogramStore();

const documentsStore = useDocumentsStore(); // Inicializa el store
const { documents, isLoading: isDocumentsLoading } = storeToRefs(documentsStore);

const fileToUpload = ref<File | null>(null);

const consentTemplatesStore = useConsentTemplatesStore();

const isConsentModalOpen = ref(false);

const historyInitialData = ref<any>({});

const budgetInitialData = ref<any>({});

const plannedTreatmentsStore = usePlannedTreatmentsStore();

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter(); // Inicializa el router

// Inicialización de Stores
const patientsStore = usePatientsStore();
const { selectedPatient, isLoading: isPatientLoading } = storeToRefs(patientsStore);

const odontogramStore = useOdontogramStore();
const { toothStates, isLoading: isOdontogramLoading } = storeToRefs(odontogramStore);

const clinicalHistoryStore = useClinicalHistoryStore();
const { entries: historyEntries, isLoading: isHistoryLoading } = storeToRefs(clinicalHistoryStore);

const budgetsStore = useBudgetsStore();
const { budgets, isLoading: isBudgetsLoading } = storeToRefs(budgetsStore);

const appointmentsStore = useAppointmentsStore();
const { patientAppointments, isLoading: isAppointmentsLoading } = storeToRefs(appointmentsStore);

// Estado para la UI
const activeTab = ref('info');
const isEditing = ref(false);
const isHistoryModalOpen = ref(false);
const isBudgetModalOpen = ref(false);
const isHistoryDetailModalOpen = ref(false);
const isPaymentModalOpen = ref(false);
const isPrintModalOpen = ref(false);
const selectedHistoryEntry = ref<ClinicalHistoryEntry | null>(null);
const selectedBudgetId = ref<string | null>(null);
const budgetToPrintId = ref<string | null>(null);



const age = computed(() => {
  if (!selectedPatient.value?.birthDate) return 'N/A';
  const birthDate = new Date(selectedPatient.value.birthDate);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

watch(() => selectedPatient.value, (newPatient) => {
  if (newPatient) {
    documentsStore.fetchDocuments(newPatient.id);
  }
}, { immediate: true });

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    fileToUpload.value = target.files[0];
  }
}
function handleUpload() {
  if (fileToUpload.value && selectedPatient.value) {
    documentsStore.uploadDocument(selectedPatient.value.id, fileToUpload.value);
    fileToUpload.value = null; // Limpia el input
  }
}

function handleClearPlan() {
  const patientId = route.params.id as string;
  plannedTreatmentsStore.clearAll(patientId);
}

const formatGender = (gender?: Gender) => {
  if (!gender) return 'N/A';
  switch (gender) {
    case Gender.MALE:
      return 'Masculino';
    case Gender.FEMALE:
      return 'Femenino';
    case Gender.OTHER:
      return 'Otro';
    default:
      return 'N/A';
  }
};

onMounted(() => {
  const patientId = route.params.id as string;
  patientsStore.fetchPatientById(patientId);
  odontogramStore.fetchOdontogram(patientId);
  clinicalHistoryStore.fetchHistory(patientId);
  budgetsStore.fetchBudgets(patientId);
  appointmentsStore.fetchAppointmentsForPatient(patientId);
  plannedTreatmentsStore.fetchAll(patientId);
  periodontogramStore.fetchPeriodontogram(patientId);
});

// --- MANEJADORES DE EVENTOS ---

function handleGenerateBudget(plannedTreatments: PlannedTreatment[]) {
  // 1. Transforma los datos del plan al formato que espera el BudgetForm
  const prefilledItems = plannedTreatments.map(plan => ({
    treatment: plan.treatment,
    quantity: 1,
    priceAtTimeOfBudget: plan.treatment.price,
  }));
  
  // 2. Guarda estos datos en el estado y abre el modal
  budgetInitialData.value = { prefilledItems };
  isBudgetModalOpen.value = true;

  const patientId = route.params.id as string;
  
}

function handleRegisterHistory(plannedTreatments: PlannedTreatment[]) {
  // 1. Formateamos los tratamientos en un texto descriptivo
  const treatmentsText = plannedTreatments.map(p => 
    `${p.treatment.name} (Diente #${p.toothSurfaceState.toothNumber})`
  ).join(', ');

  // 2. Preparamos los datos para el formulario
  historyInitialData.value = {
    treatmentPerformed: treatmentsText,
    description: `Se realizaron los siguientes tratamientos planificados: ${treatmentsText}.`
  };

  // 3. Abrimos el modal
  isHistoryModalOpen.value = true;

  const patientId = route.params.id as string;
  
}

function handleViewHistoryEntry(entry: ClinicalHistoryEntry) {
  selectedHistoryEntry.value = entry;
  isHistoryDetailModalOpen.value = true;
}

function handleManagePayments(budgetId: string) {
  selectedBudgetId.value = budgetId;
  isPaymentModalOpen.value = true;
}

function closePaymentModal() {
  isPaymentModalOpen.value = false;
  const patientId = route.params.id as string;
  budgetsStore.fetchBudgets(patientId);
}

function handleOpenPrintModal(budgetId: string) {
  budgetToPrintId.value = budgetId;
  isPrintModalOpen.value = true;
}

async function handleSaveHistoryEntry(data: any) {
  const patientId = route.params.id as string;
  const success = await clinicalHistoryStore.createHistoryEntry(patientId, data);
  if (success) {
    isHistoryModalOpen.value = false;
  }
}

async function handleSaveBudget(data: any) {
  const patientId = route.params.id as string;
  const doctorId = authStore.user?.sub;
  const payload = { ...data, patientId, doctorId };
  const success = await budgetsStore.createBudget(payload);
  if (success) {
    isBudgetModalOpen.value = false;
  }
}

async function handlePatientUpdate(data: any) {
  if (!selectedPatient.value) return;
  const success = await patientsStore.updatePatient(selectedPatient.value.id, data);
  if (success) {
    isEditing.value = false;
  }
}


async function handleGenerateConsent(templateId: string) {
  if (!selectedPatient.value) return;

  try {
    const response = await generateConsent(templateId, selectedPatient.value.id);
    const htmlContent = response.data;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.print();
    }
  } catch (error) {
    alert('Error al generar el documento.');
  }

  isConsentModalOpen.value = false;
}
</script>

<template>
  <div v-if="isPatientLoading">Cargando información del paciente...</div>
  <div v-else-if="!selectedPatient">No se encontró el paciente.</div>
  <div v-else>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-text-dark">{{ selectedPatient.fullName }}</h1>
      <p class="text-text-light">Detalles del paciente</p>
    </div>
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <a @click="activeTab = 'info'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Información General</a>
        <a @click="activeTab = 'odontogram'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'odontogram' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Odontograma</a>
        <a @click="activeTab = 'periodontogram'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'periodontogram' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Periodontograma</a>
        <a @click="activeTab = 'history'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Historial Clínico</a>
        <a @click="activeTab = 'budgets'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'budgets' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Presupuestos</a>
        <a @click="activeTab = 'appointments'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'appointments' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Citas</a>
        <a @click="activeTab = 'documents'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Documentos</a>
      </nav>
    </div>

    <div class="mt-6">
        <div v-if="activeTab === 'documents'">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold text-text-dark mb-4">Subir Documento Firmado</h2>
          <form @submit.prevent="handleUpload" class="space-y-4">
            <div>
              <label for="document-upload" class="block text-sm font-medium text-text-light">Seleccionar Archivo (PDF, JPG, PNG)</label>
              <input @change="onFileChange" type="file" id="document-upload" class="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            </div>
            <button type="submit" class="btn-primary w-full" :disabled="!fileToUpload || isDocumentsLoading">
              {{ isDocumentsLoading ? 'Subiendo...' : 'Subir Archivo' }}
            </button>
          </form>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold text-text-dark mb-4">Archivos del Paciente</h2>
          <div v-if="isDocumentsLoading">Cargando...</div>
          <ul v-else-if="documents.length > 0" class="space-y-2">
            <li v-for="doc in documents" :key="doc.id">
              <a :href="`http://localhost:3000/${doc.filePath}`" target="_blank" class="text-primary hover:underline">{{ doc.fileName }}</a>
            </li>
          </ul>
          <p v-else class="text-text-light">No hay documentos para este paciente.</p>
        </div>
      </div>
      <div class="mt-6">
        <button @click="isConsentModalOpen = true" class="btn-secondary">+ Generar Consentimiento</button>
      </div>
    </div>
    </div>

    <div v-if="activeTab === 'periodontogram'">
    <Periodontogram />
  </div>

    <div class="mt-6">
      <div v-if="activeTab === 'info'" class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-text-dark">Datos Personales</h2>
          <button @click="isEditing = !isEditing" class="btn-secondary">
            {{ isEditing ? 'Cancelar Edición' : 'Editar Información' }}
          </button>
        </div>
        <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><strong class="text-text-light">DNI:</strong> {{ selectedPatient.dni }}</div>
          <div><strong class="text-text-light">Teléfono:</strong> {{ selectedPatient.phone }}</div>
          <div><strong class="text-text-light">Email:</strong> {{ selectedPatient.email || 'N/A' }}</div>
          <div><strong class="text-text-light">Fecha de Nac.:</strong> {{ new Date(selectedPatient.birthDate).toLocaleDateString('es-PE', { timeZone: 'UTC' }) }}</div>
          <div><strong class="text-text-light">Edad:</strong> {{ age }} años</div>
          <div><strong class="text-text-light">Sexo:</strong> {{ formatGender(selectedPatient.gender) }}</div>
          <div class="md:col-span-3"><strong class="text-text-light">Dirección:</strong> {{ selectedPatient.address || 'N/A' }}</div>
          <div><strong class="text-text-light">Departamento:</strong> {{ selectedPatient.department || 'N/A' }}</div>
          <div><strong class="text-text-light">Provincia:</strong> {{ selectedPatient.province || 'N/A' }}</div>
          <div><strong class="text-text-light">Distrito:</strong> {{ selectedPatient.district || 'N/A' }}</div>
          <div class="md:col-span-3"><strong class="text-text-light">Alergias:</strong> {{ selectedPatient.allergies || 'Ninguna' }}</div>
        </div>
        <div v-else>
          <PatientForm :initial-data="selectedPatient" :loading="isPatientLoading" @patient-saved="handlePatientUpdate" @cancel="isEditing = false" />
        </div>
      </div>

      <div v-if="activeTab === 'odontogram'">
         <div v-if="isOdontogramLoading" class="text-center py-8">Cargando odontograma...</div>
         <Odontogram v-else :states="toothStates" :patient-age="typeof age === 'number' ? age : 0" :user-role="authStore.user?.role" />
         <TreatmentPlan 
            @generate-budget="handleGenerateBudget"
            @register-history="handleRegisterHistory" 
            @clear-plan="handleClearPlan" />
      </div>

      <div v-if="activeTab === 'history'">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-text-dark">Evolución del Paciente</h2>
          <button v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'dentist'" @click="isHistoryModalOpen = true" class="btn-primary">
      + Nueva Entrada
    </button>
        </div>
        <div v-if="isHistoryLoading" class="text-center py-8">Cargando historial...</div>
        <ClinicalHistoryList v-else :entries="historyEntries" @view-entry="handleViewHistoryEntry" />
      </div>

      <div v-if="activeTab === 'budgets'">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-text-dark">Planes de Tratamiento</h2>
          <button @click="isBudgetModalOpen = true" class="btn-primary">
            + Nuevo Presupuesto
          </button>
        </div>
        <div v-if="isBudgetsLoading" class="text-center py-8">Cargando presupuestos...</div>
        <BudgetList v-else :budgets="budgets" @manage-payments="handleManagePayments" @print-budget="handleOpenPrintModal" />
      </div>

      <div v-if="activeTab === 'appointments'">
        <h2 class="text-xl font-bold text-text-dark mb-4">Historial de Citas</h2>
        <div v-if="isAppointmentsLoading" class="text-center py-8">Cargando citas...</div>
        <AppointmentList v-else :appointments="patientAppointments" />
      </div>
    </div>

    <Modal :isOpen="isHistoryModalOpen" @close="isHistoryModalOpen = false">
      <template #header>Nueva Entrada de Historial</template>
      <template #default>
        <ClinicalHistoryForm v-if="isHistoryModalOpen" :initial-data="historyInitialData" :loading="isHistoryLoading" @submit="handleSaveHistoryEntry" @cancel="isHistoryModalOpen = false" />
      </template>
    </Modal>
    
    <Modal :isOpen="isBudgetModalOpen" @close="isBudgetModalOpen = false">
      <template #header>Nuevo Presupuesto</template>
      <template #default>
        <BudgetForm v-if="isBudgetModalOpen" :initial-data="budgetInitialData" :loading="isBudgetsLoading" @submit="handleSaveBudget" @cancel="isBudgetModalOpen = false" />
      </template>
    </Modal>
    
    <Modal :isOpen="isHistoryDetailModalOpen" @close="isHistoryDetailModalOpen = false">
      <template #header>Detalle de la Entrada</template>
      <template #default>
        <ClinicalHistoryDetail v-if="isHistoryDetailModalOpen" :entry="selectedHistoryEntry" />
      </template>
    </Modal>

    <Modal :isOpen="isPaymentModalOpen" @close="closePaymentModal">
  <template #header>Gestionar Pagos del Presupuesto</template>
  <template #default>
    <PaymentHistory 
      v-if="isPaymentModalOpen" 
      :budget-id="selectedBudgetId!" 
      @payment-saved="closePaymentModal" />
  </template>
</Modal>

    <Modal :isOpen="isPrintModalOpen" @close="isPrintModalOpen = false">
      <template #header>Opciones de Impresión</template>
      <template #default>
        <PrintBudgetModal 
          v-if="isPrintModalOpen" 
          :budget-id="budgetToPrintId!" 
          @close="isPrintModalOpen = false" 
        />
      </template>
    </Modal>

    <Modal :isOpen="isConsentModalOpen" @close="isConsentModalOpen = false">
      <template #header>Generar Consentimiento Informado</template>
      <template #default>
        <GenerateConsentModal 
          v-if="isConsentModalOpen"
          @close="isConsentModalOpen = false"
          @generate="handleGenerateConsent"
        />
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.btn-primary { 
  @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; 
}
.btn-secondary {
  @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold;
}
</style>