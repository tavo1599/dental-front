<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePatientsStore } from '@/stores/patients';
import { useOdontogramStore } from '@/stores/odontogram';
import { useClinicalHistoryStore } from '@/stores/clinicalHistory';
import { useBudgetsStore } from '@/stores/budgets';
import { useAppointmentsStore } from '@/stores/appointments';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { Gender } from '@/types';
import { translateStatus } from '@/utils/formatters';
import { useUsersStore } from '@/stores/users';


import Odontogram from '@/components/Odontogram.vue';
import ClinicalHistoryList from '@/components/ClinicalHistoryList.vue';
import BudgetList from '@/components/BudgetList.vue';
import AppointmentList from '@/components/AppointmentList.vue';
import Modal from '@/components/Modal.vue';
import ClinicalHistoryForm from '@/components/ClinicalHistoryForm.vue';
import BudgetForm from '@/components/BudgetForm.vue';
import AnamnesisHub from '@/components/AnamnesisHub.vue';
import PatientForm from '@/components/PatientForm.vue';
import ClinicalHistoryDetail from '@/components/ClinicalHistoryDetail.vue';
import PaymentHistory from '@/components/PaymentHistory.vue';
import PrintBudgetModal from '@/components/PrintBudgetModal.vue';
import type { ClinicalHistoryEntry } from '@/types';
import { usePlannedTreatmentsStore } from '@/stores/plannedTreatments';
import TreatmentPlan from '@/components/TreatmentPlan.vue';
import type { PlannedTreatment, Treatment } from '@/types';
import GenerateConsentModal from '@/components/GenerateConsentModal.vue';
import { useConsentTemplatesStore } from '@/stores/consentTemplates';
import { generateConsent } from '@/services/consentTemplateService';
import { useDocumentsStore } from '@/stores/documents';
import { usePeriodontogramStore } from '@/stores/periodontogram';
import Periodontogram from '@/components/Periodontogram.vue';


const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const patientsStore = usePatientsStore();
const odontogramStore = useOdontogramStore();
const clinicalHistoryStore = useClinicalHistoryStore();
const budgetsStore = useBudgetsStore();
const appointmentsStore = useAppointmentsStore();
const plannedTreatmentsStore = usePlannedTreatmentsStore();
const periodontogramStore = usePeriodontogramStore();
const documentsStore = useDocumentsStore();
const usersStore = useUsersStore();
const consentTemplatesStore = useConsentTemplatesStore();

// --- Refs de Stores ---
const { selectedPatient, medicalHistory, odontopediatricHistory, isLoading: isPatientLoading } = storeToRefs(patientsStore);
const { wholeTeeth, surfaces, isLoading: isOdontogramLoading } = storeToRefs(odontogramStore);
const { entries: historyEntries, isLoading: isHistoryLoading } = storeToRefs(clinicalHistoryStore);
const { budgets, isLoading: isBudgetsLoading } = storeToRefs(budgetsStore);
const { patientAppointments, isLoading: isAppointmentsLoading } = storeToRefs(appointmentsStore);
const { documents, isLoading: isDocumentsLoading } = storeToRefs(documentsStore);
const { doctors } = storeToRefs(usersStore);

// --- Refs de UI ---
const activeTab = ref('info');
const selectedDoctorId = ref<string>('all');
const isEditing = ref(false);
const isHistoryModalOpen = ref(false);
const isBudgetModalOpen = ref(false);
const isHistoryDetailModalOpen = ref(false);
const isPaymentModalOpen = ref(false);
const isPrintModalOpen = ref(false);
const selectedHistoryEntry = ref<ClinicalHistoryEntry | null>(null);
const selectedBudgetId = ref<string | null>(null);
const budgetToPrintId = ref<string | null>(null);
const fileToUpload = ref<File | null>(null);
const isConsentModalOpen = ref(false);
const historyInitialData = ref<any>({});
const budgetInitialData = ref<any>({});


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

const filteredBudgets = computed(() => {
  if (authStore.user?.role === 'dentist') {
    return budgets.value.filter(b => b.doctor?.id === authStore.user?.id);
  }
  if (selectedDoctorId.value === 'all') {
    return budgets.value;
  }
  return budgets.value.filter(b => b.doctor?.id === selectedDoctorId.value);
});

const formatGender = (gender?: Gender) => {
  if (!gender) return 'N/A';
  switch (gender) {
    case Gender.MALE: return 'Masculino';
    case Gender.FEMALE: return 'Femenino';
    case Gender.OTHER: return 'Otro';
    default: return 'N/A';
  }
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

watch(() => route.params.id, (newId) => {
  if (newId) {
    const patientId = newId as string;
    
    // Resetea todos los stores al cambiar de paciente
    patientsStore.selectedPatient = null;
    patientsStore.medicalHistory = null;
    patientsStore.odontopediatricHistory = null;
    odontogramStore.wholeTeeth = {};
    odontogramStore.surfaces = {};
    clinicalHistoryStore.entries = [];
    budgetsStore.budgets = [];
    appointmentsStore.patientAppointments = [];
    documentsStore.documents = [];
    plannedTreatmentsStore.plannedTreatments = [];

    // Carga la información esencial del nuevo paciente
    patientsStore.fetchPatientById(patientId);
    
    // Vuelve a cargar los datos de la pestaña que esté activa
    loadDataForTab(activeTab.value, patientId);
  }
}, { immediate: true }); // 'immediate: true' lo ejecuta al cargar la página

// 2. Observador de pestaña: carga datos solo cuando se hace clic
watch(activeTab, (newTab) => {
  const patientId = route.params.id as string;
  if (patientId) {
    loadDataForTab(newTab, patientId);
  }
});

// 3. Función de carga centralizada (se llama al cambiar de ID o de pestaña)
function loadDataForTab(tab: string, patientId: string) {
  switch (tab) {
    case 'medical-history':
      if (!medicalHistory.value) {
        patientsStore.fetchMedicalHistory(patientId);
        patientsStore.fetchOdontopediatricHistory(patientId);
      }
      break;
    case 'odontogram':
      if (Object.keys(wholeTeeth.value).length === 0) {
        odontogramStore.fetchOdontogram(patientId);
        plannedTreatmentsStore.fetchAll(patientId);
      }
      break;
    case 'periodontogram':
      periodontogramStore.fetchPeriodontogram(patientId);
      break;
    case 'history':
      if (historyEntries.value.length === 0) {
        clinicalHistoryStore.fetchHistory(patientId);
      }
      break;
    case 'budgets':
      if (budgets.value.length === 0) {
        const userRole = authStore.user?.role;
        const userId = authStore.user?.id;

        if (userRole === 'dentist') {
          if (userId) budgetsStore.fetchBudgets(patientId, userId);
        } else if (userRole === 'admin') {
          if (userId) {
            selectedDoctorId.value = userId; // Selecciona al admin por defecto
            budgetsStore.fetchBudgets(patientId, userId);
          }
          usersStore.fetchDoctors();
        } else if (userRole === 'assistant') {
          budgetsStore.fetchBudgets(patientId); // Carga todos por defecto
          usersStore.fetchDoctors();
        }
      }
      break;
    case 'appointments':
      if (patientAppointments.value.length === 0) {
        appointmentsStore.fetchAppointmentsForPatient(patientId);
      }
      break;
    case 'documents':
      if (documents.value.length === 0) {
        documentsStore.fetchDocuments(patientId);
      }
      break;
  }
}

// Watch para reaccionar al filtro de doctor
watch(selectedDoctorId, (newDoctorId) => {
  if (activeTab.value !== 'budgets') return;
  const patientId = route.params.id as string;
  const doctorIdToFetch = newDoctorId === 'all' ? undefined : newDoctorId;
  budgetsStore.fetchBudgets(patientId, doctorIdToFetch);
});

// --- MANEJADORES DE EVENTOS ---
function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    fileToUpload.value = target.files[0];
  }
}
async function handleUpload() {
  if (fileToUpload.value && selectedPatient.value) {
    await documentsStore.uploadDocument(selectedPatient.value.id, fileToUpload.value);
    fileToUpload.value = null;
  }
}

function handleClearPlan() {
  const patientId = route.params.id as string;
  plannedTreatmentsStore.clearAll(patientId);
}

function openNewHistoryModal() {
  historyInitialData.value = {};
  isHistoryModalOpen.value = true;
}

function openNewBudgetModal() {
  const patientId = route.params.id as string;
  budgetInitialData.value = {
    patientId: patientId, // <-- Pasa el patientId
    prefilledItems: [],
    discountAmount: 0
  };
  isBudgetModalOpen.value = true;
}

async function handleSaveMedicalHistory(data: any) {
  if (selectedPatient.value) {
    await patientsStore.updateMedicalHistory(selectedPatient.value.id, data);
  }
}

function handleGenerateBudget(plannedTreatments: PlannedTreatment[]) {
  const patientId = route.params.id as string;
  
  // 1. Crea un mapa para agrupar
  const groupedItems = new Map<string, { treatment: Treatment; quantity: number; priceAtTimeOfBudget: number }>();

  for (const plan of plannedTreatments) {
    const treatmentId = plan.treatment.id;
    
    if (groupedItems.has(treatmentId)) {
      // Si ya existe, solo incrementa la cantidad
      groupedItems.get(treatmentId)!.quantity++;
    } else {
      // Si es nuevo, añádelo al mapa
      groupedItems.set(treatmentId, {
        treatment: plan.treatment,
        quantity: 1,
        priceAtTimeOfBudget: plan.treatment.price,
      });
    }
  }
  
  // 2. Convierte el mapa de nuevo a un array
  const prefilledItems = Array.from(groupedItems.values());
  
  // 3. Envía los datos agrupados al formulario
  budgetInitialData.value = {
    patientId: patientId,
    prefilledItems: prefilledItems, // <-- Ahora van agrupados
    discountAmount: 0
  };
  isBudgetModalOpen.value = true;
}

function handleRegisterHistory(plannedTreatments: PlannedTreatment[]) {
  const plan = plannedTreatments[0]; 
  if (!plan) return;
  const diagnosis = translateStatus(plan.toothSurfaceState.status);
  const tooth = plan.toothSurfaceState.toothNumber;
  const surface = plan.toothSurfaceState.surface;
  const treatment = plan.treatment.name;
  const descriptionText = `Paciente presenta ${diagnosis} en el diente #${tooth} (superficie ${surface}).`;
  const treatmentText = `${treatment} en el diente #${tooth}.`;
  historyInitialData.value = {
    description: descriptionText,
    treatmentPerformed: treatmentText,
    diagnosis: diagnosis,
  };
  isHistoryModalOpen.value = true;
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
  if (authStore.user?.role === 'dentist') {
    budgetsStore.fetchBudgets(patientId, authStore.user.id);
  } else {
    const doctorIdToFetch = selectedDoctorId.value === 'all' ? undefined : selectedDoctorId.value;
    budgetsStore.fetchBudgets(patientId, doctorIdToFetch);
  }
}

// Cuando se actualiza el descuento en un presupuesto, recarga la lista
function handleBudgetDiscountUpdated() {
  const patientId = route.params.id as string;
  if (authStore.user?.role === 'dentist') {
    budgetsStore.fetchBudgets(patientId, authStore.user.id);
  } else {
    const doctorIdToFetch = selectedDoctorId.value === 'all' ? undefined : selectedDoctorId.value;
    budgetsStore.fetchBudgets(patientId, doctorIdToFetch);
  }
}

// Handler para cuando se elimina un presupuesto desde la lista
function handleBudgetDeleted() {
  const patientId = route.params.id as string;
  if (authStore.user?.role === 'dentist') {
    budgetsStore.fetchBudgets(patientId, authStore.user.id);
  } else {
    const doctorIdToFetch = selectedDoctorId.value === 'all' ? undefined : selectedDoctorId.value;
    budgetsStore.fetchBudgets(patientId, doctorIdToFetch);
  }
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
  // 'data' ya viene con todo (patientId, doctorId, items, totalAmount, discountAmount)
  // desde el BudgetForm.vue
  const success = await budgetsStore.createBudget(data);
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

function handlePrintReceipt(paymentId: string) {
  const routeData = router.resolve({
    name: 'print-payment-receipt',
    params: { id: paymentId }
  });
  window.open(routeData.href, '_blank');
}

// Descarga y abre/forza la descarga del documento seleccionado
async function openDocument(doc: any) {
  // Intenta descargar el blob usando el store helper
  const blob = await documentsStore.downloadDocumentFile(doc);
  if (!blob) return;

  const url = URL.createObjectURL(blob);

  // Si es PDF o imagen, intentamos abrir en nueva pestaña
  const lower = (doc.fileName || '').toLowerCase();
  if (lower.endsWith('.pdf') || lower.match(/\.(jpg|jpeg|png|gif)$/)) {
    window.open(url, '_blank');
    // liberamos el URL después de unos segundos
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return;
  }

  // Para otros tipos, forzamos descarga
  const link = document.createElement('a');
  link.href = url;
  link.download = doc.fileName || 'download';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
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
          <a @click="activeTab = 'medical-history'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'medical-history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Anamnesis</a>
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
      <h2 class="text-xl font-bold text-text-dark mb-4">Subir Documento</h2>
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
      <ul v-else-if="documents.length > 0" class="divide-y divide-gray-200">
        <li v-for="doc in documents" :key="doc.id" class="py-3 flex justify-between items-center">
          <a @click.prevent="openDocument(doc)" href="#" class="text-primary hover:underline font-medium">
            {{ doc.fileName }}
          </a>
          <button 
            v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'assistant'"
            @click="documentsStore.deleteDocument(selectedPatient.id, doc.id)"
            class="text-red-500 hover:text-red-700 text-sm font-semibold"
          >
            Eliminar
          </button>
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
            <div><strong class="text-text-light">Categoría:</strong> <span class="font-mono text-primary font-bold">{{ selectedPatient.category || 'N/A' }}</span></div>
            <div><strong class="text-text-light">Código Archivo:</strong> <span class="font-mono text-primary font-bold">{{ selectedPatient.fileCode || 'N/A' }}</span></div>
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
          </div>
          <div v-else>
            <PatientForm :initial-data="selectedPatient" :loading="isPatientLoading" @patient-saved="handlePatientUpdate" @cancel="isEditing = false" />
          </div>
        </div>

        <div class="mt-6">
        <div v-if="activeTab === 'odontogram'">
          <div v-if="isOdontogramLoading" class="text-center py-10">Cargando odontograma...</div>
          <Odontogram v-else :whole-teeth="wholeTeeth" :surfaces="surfaces" :patient-age="typeof age === 'number' ? age : 0" :user-role="authStore.user?.role" />
          <TreatmentPlan @generate-budget="handleGenerateBudget" @register-history="handleRegisterHistory" @clear-plan="handleClearPlan" />
        </div>
        <div class="mt-6">
    <div v-if="activeTab === 'medical-history'">
      <AnamnesisHub />
    </div>
    </div>
        </div>

        <div v-if="activeTab === 'history'">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-text-dark">Evolución del Paciente</h2>
            <button v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'dentist'" @click="openNewHistoryModal" class="btn-primary">
        + Nueva Entrada
      </button>
          </div>
          <div v-if="isHistoryLoading" class="text-center py-8">Cargando historial...</div>
          <ClinicalHistoryList v-else :entries="historyEntries" @view-entry="handleViewHistoryEntry" />
        </div>

  <div v-if="activeTab === 'budgets'">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-text-dark">Planes de Tratamiento</h2>
      <div class="flex items-center gap-4">
        <select
          v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'assistant'"
          v-model="selectedDoctorId"
          class="input-style"
        >
          <option value="all">Ver todos los doctores</option>
          <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
            {{ doctor.fullName }}
          </option>
        </select>
        <button @click="openNewBudgetModal" class="btn-primary">+ Nuevo Presupuesto</button>
      </div>
    </div>
    <div v-if="isBudgetsLoading && budgets.length === 0">Cargando...</div>
  <BudgetList v-else :budgets="filteredBudgets" @manage-payments="handleManagePayments" @print-budget="handleOpenPrintModal" @discount-updated="handleBudgetDiscountUpdated" @budget-deleted="handleBudgetDeleted" />
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
        @payment-saved="closePaymentModal"
        @print-receipt="handlePrintReceipt" />
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

  /* openDocument moved into the <script setup> block; kept style section clean */
  .btn-secondary {
    @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold;
  }
  </style>