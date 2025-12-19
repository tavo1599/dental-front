<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

// Stores
import { useAuthStore } from '@/stores/auth';
import { usePatientsStore } from '@/stores/patients';
import { useOdontogramStore } from '@/stores/odontogram';
import { useClinicalHistoryStore } from '@/stores/clinicalHistory';
import { useBudgetsStore } from '@/stores/budgets';
import { useAppointmentsStore } from '@/stores/appointments';
import { usePlannedTreatmentsStore } from '@/stores/plannedTreatments';
import { usePeriodontogramStore } from '@/stores/periodontogram';
import { useDocumentsStore } from '@/stores/documents';
import { useUsersStore } from '@/stores/users';
import { useConsentTemplatesStore } from '@/stores/consentTemplates';

// Componentes
import Odontogram from '@/components/Odontogram.vue';
import ClinicalHistoryList from '@/components/ClinicalHistoryList.vue';
import BudgetList from '@/components/BudgetList.vue';
import AppointmentList from '@/components/AppointmentList.vue';
import Modal from '@/components/Modal.vue';
import ClinicalHistoryForm from '@/components/ClinicalHistoryForm.vue';
import BudgetForm from '@/components/BudgetForm.vue';
import AnamnesisHub from '@/components/AnamnesisHub.vue';
import PatientForm from '@/components/PatientForm.vue';
import ClinicalHistoryEntryDetail from '@/components/ClinicalHistoryDetail.vue';
import PaymentHistory from '@/components/PaymentHistory.vue';
import PrintBudgetModal from '@/components/PrintBudgetModal.vue';
import BudgetPrintPreviewModal from '@/components/BudgetPrintPreviewModal.vue';
import TreatmentPlan from '@/components/TreatmentPlan.vue';
import GenerateConsentModal from '@/components/GenerateConsentModal.vue';
import Periodontogram from '@/components/Periodontogram.vue';
import PatientFullReportModal from '@/components/PatientFullReportModal.vue';

// Tipos y Utilidades
import type { ClinicalHistoryEntry, PlannedTreatment, Treatment } from '@/types';
import { Gender, OdontogramRecordType } from '@/types';
import { translateStatus } from '@/utils/formatters';
import { generateConsent } from '@/services/consentTemplateService';

const route = useRoute();
const router = useRouter();

// Inicializar Stores
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
const { wholeTeeth, surfaces, isLoading: isOdontogramLoading, currentRecordType } = storeToRefs(odontogramStore);
const { entries: historyEntries, isLoading: isHistoryLoading } = storeToRefs(clinicalHistoryStore);
const { budgets, isLoading: isBudgetsLoading } = storeToRefs(budgetsStore);
const { patientAppointments, isLoading: isAppointmentsLoading } = storeToRefs(appointmentsStore);
const { documents, isLoading: isDocumentsLoading } = storeToRefs(documentsStore);
const { doctors } = storeToRefs(usersStore);

// --- Refs de UI ---
const activeTab = ref('info');
const selectedDoctorId = ref<string>('all');
const isEditing = ref(false);

// UI Documentos (Drag & Drop)
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Modales
const isHistoryModalOpen = ref(false);
const isBudgetModalOpen = ref(false);
const isHistoryDetailModalOpen = ref(false);
const isPaymentModalOpen = ref(false);
const isPrintModalOpen = ref(false);
const isConsentModalOpen = ref(false);
const isReportModalOpen = ref(false);

const isPrintOptionsOpen = ref(false);
const isPrintPreviewOpen = ref(false);
const printFormats = ref<string[]>([])
const printExtras = ref({ odontogram: false, evolution: false });

// Datos seleccionados
const selectedHistoryEntry = ref<ClinicalHistoryEntry | null>(null);
const selectedBudgetId = ref<string | null>(null);
const budgetToPrintId = ref<string | null>(null);
const fileToUpload = ref<File | null>(null);

// Datos iniciales para formularios
const historyInitialData = ref<any>({});
const budgetInitialData = ref<any>({});

// --- Computed Properties ---
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
  // Si es dentista, solo ve los suyos (aunque el backend ya filtra, esto es visual)
  if (authStore.user?.role === 'dentist') {
    return budgets.value.filter(b => b.doctor?.id === authStore.user?.id);
  }
  // Si es admin/asistente y selecciona "Todos"
  if (selectedDoctorId.value === 'all') {
    return budgets.value;
  }
  // Si es admin/asistente y filtra por un doctor
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

// --- Watchers ---
watch(() => route.params.id, (newId) => {
  if (newId) {
    const patientId = newId as string;
    
    // Resetea stores
    patientsStore.selectedPatient = null;
    patientsStore.medicalHistory = null;
    patientsStore.odontopediatricHistory = null;
    odontogramStore.reset();
    clinicalHistoryStore.entries = [];
    budgetsStore.budgets = [];
    appointmentsStore.patientAppointments = [];
    documentsStore.documents = [];
    plannedTreatmentsStore.plannedTreatments = [];

    patientsStore.fetchPatientById(patientId);
    loadDataForTab(activeTab.value, patientId);
  }
}, { immediate: true });

watch(activeTab, (newTab) => {
  const patientId = route.params.id as string;
  if (patientId) {
    loadDataForTab(newTab, patientId);
  }
});

watch(selectedDoctorId, (newDoctorId) => {
  if (activeTab.value !== 'budgets') return;
  const patientId = route.params.id as string;
  const doctorIdToFetch = newDoctorId === 'all' ? undefined : newDoctorId;
  budgetsStore.fetchBudgets(patientId, doctorIdToFetch);
});

// --- Funciones de Carga ---
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
            selectedDoctorId.value = userId;
            budgetsStore.fetchBudgets(patientId, userId);
          }
          usersStore.fetchDoctors();
        } else if (userRole === 'assistant') {
          budgetsStore.fetchBudgets(patientId);
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

// --- MANEJADORES DE ODONTOGRAMA ---
// Función para cambiar entre Inicial y Evolución
async function handleOdontogramViewChange(type: OdontogramRecordType) {
    if (selectedPatient.value) {
        await odontogramStore.setViewMode(selectedPatient.value.id, type);
    }
}

// --- MANEJADORES DE DOCUMENTOS (Con UI Mejorada) ---

function triggerFileUpload() {
  fileInputRef.value?.click();
}

function onDragOver(e: DragEvent) {
  isDragging.value = true;
}

function onDragLeave(e: DragEvent) {
  isDragging.value = false;
}

function onDrop(e: DragEvent) {
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    fileToUpload.value = files[0];
  }
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    fileToUpload.value = target.files[0];
  }
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return 'image';
  return 'file';
}

async function handleUpload() {
  if (fileToUpload.value && selectedPatient.value) {
    await documentsStore.uploadDocument(selectedPatient.value.id, fileToUpload.value);
    fileToUpload.value = null;
  }
}

// --- FUNCIÓN OPEN DOCUMENT (R2) ---
function openDocument(doc: any) {
  if (!doc.filePath) return;

  // 1. URL Absoluta (R2)
  if (doc.filePath.startsWith('http')) {
    window.open(doc.filePath, '_blank');
  } 
  // 2. URL Relativa (Legacy)
  else {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const separator = doc.filePath.startsWith('/') ? '' : '/';
    const fullUrl = `${baseUrl}${separator}${doc.filePath}`;
    window.open(fullUrl, '_blank');
  }
}

function handleClearPlan() {
  const patientId = route.params.id as string;
  plannedTreatmentsStore.clearAll(patientId);
}

// --- Historial Clínico ---
function openNewHistoryModal() {
  historyInitialData.value = {};
  isHistoryModalOpen.value = true;
}

function handleEditHistoryEntry(entry: ClinicalHistoryEntry) {
  isHistoryDetailModalOpen.value = false;
  historyInitialData.value = { ...entry };
  isHistoryModalOpen.value = true;
}

function handleViewHistoryEntry(entry: ClinicalHistoryEntry) {
  selectedHistoryEntry.value = entry;
  isHistoryDetailModalOpen.value = true;
}

async function handleSaveHistoryEntry(data: any) {
  const patientId = route.params.id as string;
  let success = false;

  if (historyInitialData.value && historyInitialData.value.id) {
    success = await clinicalHistoryStore.editHistoryEntry(
      patientId, 
      historyInitialData.value.id, 
      data
    );
  } else {
    success = await clinicalHistoryStore.createHistoryEntry(patientId, data);
  }

  if (success) {
    isHistoryModalOpen.value = false;
    historyInitialData.value = {};
  }
}

// --- Presupuestos ---
function openNewBudgetModal() {
  const patientId = route.params.id as string;
  budgetInitialData.value = {
    patientId: patientId,
    prefilledItems: [],
    discountAmount: 0
  };
  isBudgetModalOpen.value = true;
}

function handleGenerateBudget(plannedTreatments: PlannedTreatment[]) {
  const patientId = route.params.id as string;
  const groupedItems = new Map<string, { treatment: Treatment; quantity: number; priceAtTimeOfBudget: number }>();

  for (const plan of plannedTreatments) {
    const treatmentId = plan.treatment.id;
    if (groupedItems.has(treatmentId)) {
      groupedItems.get(treatmentId)!.quantity++;
    } else {
      groupedItems.set(treatmentId, {
        treatment: plan.treatment,
        quantity: 1,
        priceAtTimeOfBudget: plan.treatment.price,
      });
    }
  }
  
  budgetInitialData.value = {
    patientId: patientId,
    prefilledItems: Array.from(groupedItems.values()),
    discountAmount: 0
  };
  isBudgetModalOpen.value = true;
}

async function handleSaveBudget(data: any) {
  const success = await budgetsStore.createBudget(data);
  if (success) {
    isBudgetModalOpen.value = false;
  }
}

function handleManagePayments(budgetId: string) {
  selectedBudgetId.value = budgetId;
  isPaymentModalOpen.value = true;
}

function closePaymentModal() {
  isPaymentModalOpen.value = false;
  const patientId = route.params.id as string;
  const doctorIdToFetch = (authStore.user?.role === 'dentist') 
      ? authStore.user.id 
      : (selectedDoctorId.value === 'all' ? undefined : selectedDoctorId.value);
  budgetsStore.fetchBudgets(patientId, doctorIdToFetch);
}

function handleBudgetDiscountUpdated() {
  closePaymentModal();
}

function handleBudgetDeleted() {
  closePaymentModal();
}

function handleOpenPrintModal(budgetId: string) {
  budgetToPrintId.value = budgetId;
  isPrintModalOpen.value = true;
}

function handleGeneratePreview(payload: { budgetId: string, formats: string[], extras: { odontogram: boolean, evolution: boolean } }) {
  isPrintOptionsOpen.value = false; // Cierra paso 1
  printFormats.value = payload.formats; // Guarda selección
  printExtras.value = payload.extras;
  isPrintPreviewOpen.value = true; // Abre paso 2 (Vista Previa A4)
}

// --- Otros ---
function handleRegisterHistory(plannedTreatments: PlannedTreatment[]) {
  const plan = plannedTreatments[0]; 
  if (!plan) return;
  const diagnosis = translateStatus(plan.toothSurfaceState.status);
  const tooth = plan.toothSurfaceState.toothNumber;
  const surface = plan.toothSurfaceState.surface;
  const treatment = plan.treatment.name;
  historyInitialData.value = {
    description: `Paciente presenta ${diagnosis} en el diente #${tooth} (superficie ${surface}).`,
    treatmentPerformed: `${treatment} en el diente #${tooth}.`,
    diagnosis: diagnosis,
  };
  isHistoryModalOpen.value = true;
}

async function handleSaveMedicalHistory(data: any) {
  if (selectedPatient.value) {
    await patientsStore.updateMedicalHistory(selectedPatient.value.id, data);
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
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(response.data);
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

// --- UTILITIES ---
function formatDate(date: string | undefined) {
  if (!date) return 'Fecha desconocida';
  return new Date(date).toLocaleDateString('es-PE');
}

// --- NUEVA FUNCIÓN: IR ATRÁS ---
function goBack() {
  router.push('/patients');
}
</script>

<template>
  <div v-if="isPatientLoading">Cargando información del paciente...</div>
  <div v-else-if="!selectedPatient">No se encontró el paciente.</div>
  <div v-else>
    
    <!-- ENCABEZADO DEL PACIENTE (RESPONSIVO CON BOTÓN ATRÁS) -->
    <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <!-- BOTÓN RETROCESO -->
        <button 
          @click="goBack" 
          class="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0" 
          title="Volver a la lista"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        <div class="min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold text-text-dark truncate">{{ selectedPatient.fullName }}</h1>
          <p class="text-text-light text-sm">Detalles del paciente</p>
        </div>
      </div>

      <!-- BOTÓN: HISTORIA COMPLETA -->
      <button 
        @click="isReportModalOpen = true"
        class="w-full md:w-auto px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 shadow-md flex justify-center items-center gap-2 font-semibold transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Historia Completa
      </button>
    </div>

    <!-- Navegación de Pestañas -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        <a @click.prevent="activeTab = 'info'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Información General</a>
        <a @click.prevent="activeTab = 'medical-history'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'medical-history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Anamnesis</a>
        <a @click.prevent="activeTab = 'odontogram'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'odontogram' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Odontograma</a>
        <a @click.prevent="activeTab = 'periodontogram'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'periodontogram' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Periodontograma</a>
        <a @click.prevent="activeTab = 'history'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Historial Clínico</a>
        <a @click.prevent="activeTab = 'budgets'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'budgets' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Presupuestos</a>
        <a @click.prevent="activeTab = 'appointments'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'appointments' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Citas</a>
        <a @click.prevent="activeTab = 'documents'" href="#" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700']">Documentos</a>
      </nav>
    </div>

    <div class="mt-6">
      
      <!-- Pestaña: Documentos -->
      <div v-if="activeTab === 'documents'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- COLUMNA IZQUIERDA: ACCIONES -->
          <div class="space-y-6 lg:col-span-1">
            <!-- Tarjeta Subida -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="p-4 border-b border-gray-100 bg-gray-50">
                <h3 class="font-semibold text-gray-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  Subir Archivo
                </h3>
              </div>
              
              <div class="p-5">
                <div 
                  @dragover.prevent="onDragOver"
                  @dragleave.prevent="onDragLeave"
                  @drop.prevent="onDrop"
                  @click="triggerFileUpload"
                  :class="[
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200',
                    isDragging ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                  ]"
                >
                  <input 
                    ref="fileInputRef"
                    type="file" 
                    class="hidden" 
                    @change="onFileChange" 
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  
                  <div v-if="!fileToUpload" class="space-y-2">
                    <div class="mx-auto h-12 w-12 text-gray-400 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600 font-medium">Haz clic o arrastra un archivo aquí</p>
                    <p class="text-xs text-gray-400">PDF, JPG, PNG (Max 10MB)</p>
                  </div>

                  <div v-else class="space-y-3">
                    <div class="mx-auto h-12 w-12 text-green-600 bg-green-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p class="text-sm font-bold text-gray-800 truncate px-2">{{ fileToUpload.name }}</p>
                    <p class="text-xs text-gray-500">{{ (fileToUpload.size / 1024 / 1024).toFixed(2) }} MB</p>
                    <button 
                      @click.stop="fileToUpload = null" 
                      class="text-xs text-red-500 hover:underline"
                    >Cancelar</button>
                  </div>
                </div>

                <button 
                  @click="handleUpload" 
                  class="btn-primary w-full mt-4 flex justify-center items-center gap-2"
                  :disabled="!fileToUpload || isDocumentsLoading"
                >
                  <span v-if="isDocumentsLoading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  {{ isDocumentsLoading ? 'Subiendo...' : 'Guardar Archivo' }}
                </button>
              </div>
            </div>

            <!-- Tarjeta Consentimiento -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="p-4 border-b border-gray-100 bg-gray-50">
                <h3 class="font-semibold text-gray-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                  </svg>
                  Documentos Legales
                </h3>
              </div>
              <div class="p-5">
                <p class="text-sm text-gray-600 mb-4">Genera consentimientos informados listos para firmar.</p>
                <button @click="isConsentModalOpen = true" class="w-full py-2.5 px-4 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors flex justify-center items-center gap-2">
                  Generar Consentimiento
                </button>
              </div>
            </div>
          </div>

          <!-- COLUMNA DERECHA: LISTA DE ARCHIVOS -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
              <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 class="font-semibold text-gray-800">Historial de Archivos</h3>
                <span class="text-xs font-medium bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">{{ documents.length }} archivos</span>
              </div>

              <div v-if="isDocumentsLoading && documents.length === 0" class="p-8 text-center text-gray-400">
                <p>Cargando lista...</p>
              </div>

              <div v-else-if="documents.length === 0" class="flex-1 flex flex-col items-center justify-center p-12 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No hay documentos subidos aún.</p>
              </div>

              <ul v-else class="divide-y divide-gray-100 overflow-y-auto max-h-[600px]">
                <li v-for="doc in documents" :key="doc.id" class="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                  
                  <div class="flex items-center gap-4 overflow-hidden">
                    <!-- Icono según tipo -->
                    <div class="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      :class="{
                        'bg-red-100 text-red-600': getFileIcon(doc.fileName) === 'pdf',
                        'bg-blue-100 text-blue-600': getFileIcon(doc.fileName) === 'image',
                        'bg-gray-100 text-gray-600': getFileIcon(doc.fileName) === 'file'
                      }"
                    >
                      <svg v-if="getFileIcon(doc.fileName) === 'pdf'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" /></svg>
                      <svg v-else-if="getFileIcon(doc.fileName) === 'image'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" /></svg>
                    </div>

                    <div class="min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate cursor-pointer hover:underline" @click.prevent="openDocument(doc)">{{ doc.fileName }}</p>
                      <p class="text-xs text-gray-500">Documento disponible</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click.prevent="openDocument(doc)" 
                      class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Ver"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button 
                      v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'assistant'"
                      @click="documentsStore.deleteDocument(selectedPatient.id, doc.id)"
                      class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Pestaña: Periodontograma -->
      <div v-if="activeTab === 'periodontogram'">
        <Periodontogram />
      </div>

      <!-- Pestaña: Información General -->
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

      <!-- Pestaña: Odontograma -->
      <!-- PESTAÑA ODONTOGRAMA (Con Switch Inicial/Actual) -->
      <div v-if="activeTab === 'odontogram'">
         <div class="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 class="text-xl font-bold text-text-dark">Odontograma</h2>
            <!-- Switch -->
            <div class="bg-gray-100 p-1 rounded-lg flex items-center shadow-inner">
                <button 
                    @click="handleOdontogramViewChange(OdontogramRecordType.INITIAL)"
                    :class="['px-4 py-2 rounded-md text-sm font-medium transition-all duration-200', currentRecordType === OdontogramRecordType.INITIAL ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                >
                    Inicial (Ingreso)
                </button>
                <button 
                    @click="handleOdontogramViewChange(OdontogramRecordType.EVOLUTION)"
                    :class="['px-4 py-2 rounded-md text-sm font-medium transition-all duration-200', currentRecordType === OdontogramRecordType.EVOLUTION ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                >
                    Actual (Evolución)
                </button>
            </div>
         </div>

         <!-- Aviso visual si es Inicial -->
         <div v-if="currentRecordType === OdontogramRecordType.INITIAL" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-yellow-700">
                        <strong>Modo Histórico:</strong> Estás viendo el estado inicial del paciente. Para registrar nuevos tratamientos, cambia a <strong>Actual</strong>.
                    </p>
                </div>
            </div>
         </div>

         <div v-if="isOdontogramLoading" class="text-center py-10">Cargando odontograma...</div>
         <Odontogram v-else :whole-teeth="wholeTeeth" :surfaces="surfaces" :patient-age="Number(age)" :user-role="authStore.user?.role" />
         <TreatmentPlan @generate-budget="handleGenerateBudget" @register-history="handleRegisterHistory" @clear-plan="handleClearPlan" />
      </div>

      <!-- Pestaña: Anamnesis -->
      <div v-if="activeTab === 'medical-history'">
        <AnamnesisHub />
      </div>

      <!-- Pestaña: Historial Clínico -->
      <div v-if="activeTab === 'history'">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-text-dark">Evolución del Paciente</h2>
          <button v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'dentist'" @click="openNewHistoryModal" class="btn-primary">
            + Nueva Entrada
          </button>
        </div>
        <div v-if="isHistoryLoading" class="text-center py-8">Cargando historial...</div>
        <ClinicalHistoryList 
           v-else 
           :entries="historyEntries" 
           @view-entry="handleViewHistoryEntry" 
           @edit-entry="handleEditHistoryEntry"
        />
      </div>

      <!-- Pestaña: Presupuestos (CON RESPONSIVIDAD Y FILTRO DE DOCTOR) -->
      <div v-if="activeTab === 'budgets'">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 class="text-xl font-bold text-text-dark">Planes de Tratamiento</h2>
          
          <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <!-- SELECT DE DOCTOR (VISIBLE SOLO PARA ADMIN/ASISTENTE) -->
            <select 
              v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'assistant'" 
              v-model="selectedDoctorId" 
              class="input-style w-full sm:w-64"
            >
              <option value="all">Ver todos los doctores</option>
              <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">{{ doctor.fullName }}</option>
            </select>
            
            <button @click="openNewBudgetModal" class="btn-primary w-full sm:w-auto whitespace-nowrap">+ Nuevo Presupuesto</button>
          </div>
        </div>
        
        <div v-if="isBudgetsLoading && budgets.length === 0">Cargando...</div>
        <BudgetList 
          v-else 
          :budgets="filteredBudgets" 
          @manage-payments="handleManagePayments" 
          @print-budget="handleOpenPrintModal" 
          @discount-updated="handleBudgetDiscountUpdated" 
          @budget-deleted="handleBudgetDeleted" 
        />
      </div>

      <!-- Pestaña: Citas -->
      <div v-if="activeTab === 'appointments'">
        <h2 class="text-xl font-bold text-text-dark mb-4">Historial de Citas</h2>
        <div v-if="isAppointmentsLoading" class="text-center py-8">Cargando citas...</div>
        <AppointmentList v-else :appointments="patientAppointments" />
      </div>
    </div>

    <!-- MODALES FUERA DEL V-IF PRINCIPAL -->
    <Modal :isOpen="isHistoryModalOpen" @close="isHistoryModalOpen = false">
      <template #header>
          {{ historyInitialData && historyInitialData.id ? 'Editar Entrada' : 'Nueva Entrada de Historial' }}
      </template>
      <template #default>
        <ClinicalHistoryForm 
           v-if="isHistoryModalOpen" 
           :initial-data="historyInitialData" 
           :loading="isHistoryLoading" 
           @submit="handleSaveHistoryEntry" 
           @cancel="isHistoryModalOpen = false" 
        />
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
        <ClinicalHistoryEntryDetail 
           v-if="isHistoryDetailModalOpen" 
           :entry="selectedHistoryEntry" 
           @edit="handleEditHistoryEntry"
        />
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
      <template #header>Imprimir Presupuesto</template>
      <template #default>
        <PrintBudgetModal 
          v-if="isPrintModalOpen"
          :budget-id="budgetToPrintId!" 
          @close="isPrintModalOpen = false" 
          @generate="handleGeneratePreview" 
        />
      </template>
    </Modal>

    <BudgetPrintPreviewModal 
       v-if="isPrintPreviewOpen"
       :budget-id="budgetToPrintId!"
       :formats="printFormats"
       :extras="printExtras"
       @close="isPrintPreviewOpen = false"
    />

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

    <!-- NUEVO: Modal de Reporte Completo -->
    <PatientFullReportModal 
      v-if="isReportModalOpen"
      :patient-id="selectedPatient?.id || ''"
      @close="isReportModalOpen = false"
    />

  </div>
</template>

<style scoped>
.btn-primary { 
 @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; 
}
.btn-secondary {
 @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold;
}
/* Input estilo para el select de doctor */
.input-style {
  @apply border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm;
}
</style>