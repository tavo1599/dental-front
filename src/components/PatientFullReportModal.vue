<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
// Stores
import { usePatientsStore } from '@/stores/patients';
import { useOdontogramStore } from '@/stores/odontogram';
import { useClinicalHistoryStore } from '@/stores/clinicalHistory';
import { useBudgetsStore } from '@/stores/budgets';
import { useAppointmentsStore } from '@/stores/appointments';
import { useAuthStore } from '@/stores/auth';
// Componentes visuales
import Odontogram from '@/components/Odontogram.vue';
// Tipos
import { PaymentMethod, Gender } from '@/types'; 

const props = defineProps<{
  patientId: string;
}>();

const emit = defineEmits(['close']);

const authStore = useAuthStore();
const patientsStore = usePatientsStore();
const odontogramStore = useOdontogramStore();
const clinicalHistoryStore = useClinicalHistoryStore();
const budgetsStore = useBudgetsStore();
const appointmentsStore = useAppointmentsStore();

const { selectedPatient, medicalHistory } = storeToRefs(patientsStore);
const { wholeTeeth, surfaces } = storeToRefs(odontogramStore);
const { entries: historyEntries } = storeToRefs(clinicalHistoryStore);
const { budgets } = storeToRefs(budgetsStore);
const { patientAppointments } = storeToRefs(appointmentsStore);

const isLoading = ref(true);
const currentDate = new Date().toLocaleDateString('es-PE');

// --- LOGO (R2) ---
const logoSrc = computed(() => {
  const url = authStore.user?.tenant?.logoUrl;
  if (!url) return null;
  const timestamp = new Date().getTime();
  if (url.startsWith('http')) return `${url}?t=${timestamp}`;
  return `${import.meta.env.VITE_API_BASE_URL}${url}?t=${timestamp}`;
});

const age = computed(() => {
  if (!selectedPatient.value?.birthDate) return '';
  const birth = new Date(selectedPatient.value.birthDate);
  const diff = Date.now() - birth.getTime();
  const ageDt = new Date(diff);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
});

onMounted(async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      patientsStore.fetchMedicalHistory(props.patientId),
      odontogramStore.fetchOdontogram(props.patientId),
      clinicalHistoryStore.fetchHistory(props.patientId),
      budgetsStore.fetchBudgets(props.patientId), 
      appointmentsStore.fetchAppointmentsForPatient(props.patientId)
    ]);
  } catch (error) {
    console.error("Error cargando reporte completo", error);
  } finally {
    isLoading.value = false;
  }
});

function printReport() {
  window.print();
}

// Utilitarios
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('es-PE') : '-';
const formatCurrency = (a: number) => `S/. ${Number(a).toFixed(2)}`;

const formatGender = (gender?: string | Gender) => {
  if (!gender) return '-';
  switch (gender) {
    case 'male': case Gender.MALE: return 'Masculino';
    case 'female': case Gender.FEMALE: return 'Femenino';
    case 'other': case Gender.OTHER: return 'Otro';
    default: return gender;
  }
};

const translatePaymentMethod = (method: string | PaymentMethod) => {
  const map: Record<string, string> = {
    [PaymentMethod.CASH]: 'Efectivo',
    [PaymentMethod.YAPE]: 'Yape',
    [PaymentMethod.CARD]: 'Tarjeta',
    [PaymentMethod.TRANSFER]: 'Transferencia',
    [PaymentMethod.OTHER]: 'Otro',
  };
  return map[method as string] || method;
};
</script>

<template>
  <!-- 
    TELEPORT: Mueve este componente FUERA de tu App principal (fuera del sidebar y layouts).
    Lo pega directamente en el <body> del navegador.
    Esto soluciona los problemas de corte de página.
  -->
  <Teleport to="body">
    <div class="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-start overflow-y-auto pt-10 pb-10 print:p-0 print:block print:bg-white print:static print:h-auto print:overflow-visible">
      
      <!-- CONTENIDO DEL REPORTE -->
      <div id="printable-report" class="bg-white w-full max-w-4xl rounded-lg shadow-xl p-12 relative print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0">
        
        <!-- Botonera (Oculta al imprimir) -->
        <div class="absolute top-4 right-4 flex gap-2 print:hidden">
          <button @click="printReport" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 flex items-center gap-2 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Imprimir
          </button>
          <button @click="emit('close')" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Cerrar
          </button>
        </div>

        <div v-if="isLoading" class="text-center py-20 print:hidden">
          <p class="text-lg text-gray-500">Generando Historia Clínica Completa...</p>
        </div>

        <div v-else-if="selectedPatient" class="space-y-6 text-sm text-gray-800 font-sans print:space-y-4">
          
          <!-- 1. ENCABEZADO -->
          <header class="border-b-2 border-primary pb-4 flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-primary uppercase print:text-xl print:text-black">{{ authStore.user?.tenant?.name || 'Clínica Dental' }}</h1>
              <p class="print:text-xs">{{ authStore.user?.tenant?.address }}</p>
              <p class="print:text-xs">{{ authStore.user?.tenant?.phone }} | {{ authStore.user?.tenant?.email }}</p>
            </div>
            <div v-if="logoSrc">
              <img :src="logoSrc" class="h-20 object-contain print:h-16" crossorigin="anonymous" />
            </div>
          </header>
          
          <div class="text-center py-2 bg-gray-100 rounded print:bg-transparent print:border-b print:border-gray-300 print:mb-4">
            <h2 class="text-xl font-bold uppercase print:text-base">Historia Clínica Integral</h2>
            <p class="text-xs text-gray-500">Fecha de reporte: {{ currentDate }}</p>
          </div>

          <!-- 2. DATOS DEL PACIENTE -->
          <section class="avoid-break">
            <h3 class="section-title">I. DATOS DEL PACIENTE</h3>
            <div class="grid grid-cols-3 gap-x-4 gap-y-2 print:text-xs">
              <div><span class="font-bold">Nombre:</span> {{ selectedPatient.fullName }}</div>
              <div><span class="font-bold">DNI:</span> {{ selectedPatient.dni }}</div>
              
              <!-- Se eliminó el campo "Historia Nº" como pediste -->
              
              <div><span class="font-bold">Edad:</span> {{ age }} años</div>
              <div><span class="font-bold">Sexo:</span> {{ formatGender(selectedPatient.gender) }}</div>
              <div><span class="font-bold">Celular:</span> {{ selectedPatient.phone }}</div>
              <div class="col-span-3"><span class="font-bold">Dirección:</span> {{ selectedPatient.address }}</div>
            </div>
          </section>

          <!-- 3. ANAMNESIS -->
          <section v-if="medicalHistory" class="avoid-break">
            <h3 class="section-title">II. ANAMNESIS</h3>
            <div class="grid grid-cols-1 gap-1 print:text-xs">
              <p><span class="font-bold">Motivo de Consulta:</span> {{ medicalHistory.mainComplaint }}</p>
              <p><span class="font-bold">Antecedentes:</span> {{ medicalHistory.illnessHistory }}</p>
              <p><span class="font-bold">Alergias:</span> {{ medicalHistory.allergies || 'Niega' }}</p>
              <p><span class="font-bold">Medicación:</span> {{ medicalHistory.currentMedications || 'Ninguna' }}</p>
            </div>
          </section>

          <!-- 4. EVOLUCIÓN (Tabla larga que fluye) -->
          <section class="print:mb-4">
            <h3 class="section-title">III. EVOLUCIÓN Y TRATAMIENTOS</h3>
            <table class="w-full border-collapse text-xs">
              <thead>
                <tr class="bg-gray-100 border-b border-gray-300 print:bg-gray-200 header-row">
                  <th class="p-2 text-left font-bold w-24">Fecha</th>
                  <th class="p-2 text-left font-bold">Evolución / Procedimiento</th>
                  <th class="p-2 text-left font-bold w-32">Profesional</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in historyEntries" :key="entry.id" class="border-b border-gray-100 avoid-row-break">
                  <td class="p-2 align-top">{{ formatDate(entry.entryDate) }}</td>
                  <td class="p-2 align-top">
                    <div class="font-bold text-gray-900">{{ entry.description }}</div>
                    <div class="text-gray-600 whitespace-pre-wrap">{{ entry.evolution }}</div>
                    <div v-if="entry.treatmentPerformed" class="text-blue-600 mt-1 italic print:text-black">Tx: {{ entry.treatmentPerformed }}</div>
                  </td>
                  <td class="p-2 align-top text-gray-500">{{ entry.user?.fullName }}</td>
                </tr>
                <tr v-if="historyEntries.length === 0">
                  <td colspan="3" class="p-4 text-center text-gray-400">Sin registros.</td>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- 5. HISTORIAL DE CITAS -->
          <section class="avoid-break">
             <h3 class="section-title">IV. HISTORIAL DE CITAS</h3>
             <table class="w-full border-collapse text-xs">
              <thead>
                <tr class="bg-gray-100 border-b border-gray-300 print:bg-gray-200 header-row">
                  <th class="p-2 text-left font-bold">Fecha</th>
                  <th class="p-2 text-left font-bold">Hora</th>
                  <th class="p-2 text-left font-bold">Doctor</th>
                  <th class="p-2 text-left font-bold">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="apt in patientAppointments" :key="apt.id" class="border-b border-gray-100 avoid-row-break">
                  <td class="p-2">{{ formatDate(apt.startTime) }}</td>
                  <td class="p-2">
                    {{ new Date(apt.startTime).toLocaleTimeString('es-PE', {hour:'2-digit', minute:'2-digit'}) }} - 
                    {{ new Date(apt.endTime).toLocaleTimeString('es-PE', {hour:'2-digit', minute:'2-digit'}) }}
                  </td>
                  <td class="p-2">{{ apt.doctor.fullName }}</td>
                  <td class="p-2 capitalize">{{ apt.status }}</td>
                </tr>
              </tbody>
             </table>
          </section>

          <!-- 6. RESUMEN ECONÓMICO -->
          <section class="print:mb-4">
            <h3 class="section-title">V. RESUMEN ECONÓMICO</h3>
            
            <div v-for="budget in budgets" :key="budget.id" class="mb-4 border rounded p-3 avoid-break print:border-gray-400">
              <div class="flex justify-between font-bold bg-gray-50 p-1 rounded mb-2 print:bg-gray-100">
                 <span>Presupuesto {{ formatDate(budget.creationDate) }}</span>
                 <div class="text-right">
                   <template v-if="budget.discountAmount > 0">
                     <div class="text-[10px] text-gray-500 font-normal">Sub: {{ formatCurrency(budget.totalAmount) }}</div>
                     <div class="text-[10px] text-red-500 font-normal">Dscto: -{{ formatCurrency(budget.discountAmount) }}</div>
                     <span>Total: {{ formatCurrency(budget.totalAmount - budget.discountAmount) }}</span>
                   </template>
                   <template v-else>
                     <span>Total: {{ formatCurrency(budget.totalAmount) }}</span>
                   </template>
                 </div>
              </div>
              
              <table class="w-full text-xs mb-2">
                 <tr v-for="item in budget.items" :key="item.id">
                   <td class="pl-2">• {{ item.treatment?.name || 'Tratamiento no disponible' }}</td>
                   <td class="text-right w-20">x{{ item.quantity }}</td>
                 </tr>
              </table>

              <div v-if="budget.payments && budget.payments.length > 0" class="mt-2 pt-2 border-t border-dashed print:border-gray-400">
                <div class="font-bold text-xs mb-1">Pagos:</div>
                <div v-for="pay in budget.payments" :key="pay.id" class="flex justify-between text-xs text-gray-600 pl-2">
                   <span>{{ formatDate(pay.paymentDate) }} ({{ translatePaymentMethod(pay.paymentMethod) }})</span>
                   <span>{{ formatCurrency(pay.amount) }}</span>
                </div>
              </div>
              
              <div class="text-right text-xs font-bold mt-2 border-t pt-1">
                 <span :class="((budget.totalAmount - (budget.discountAmount || 0)) - budget.paidAmount) > 0.1 ? 'text-red-600' : 'text-green-600'">
                   Saldo: {{ formatCurrency((budget.totalAmount - (budget.discountAmount || 0)) - budget.paidAmount) }}
                 </span>
              </div>
            </div>
            
            <div v-if="budgets.length === 0" class="text-gray-400 text-xs italic">No hay información financiera.</div>
          </section>

          <!-- 7. ODONTOGRAMA (AL FINAL Y EN PÁGINA NUEVA) -->
          <section class="odontogram-page">
            <div class="print-only-header">
              <h3 class="section-title">VI. ODONTOGRAMA ACTUAL</h3>
              <p class="text-xs text-gray-500">Paciente: {{ selectedPatient.fullName }}</p>
            </div>

            <div class="odontogram-vertical-container">
               <Odontogram :whole-teeth="wholeTeeth" :surfaces="surfaces" :patient-age="Number(age)" user-role="viewer" />
            </div>
            
            <footer class="mt-4 text-center text-xs text-gray-400">
               Representación gráfica del estado dental - {{ authStore.user?.tenant?.name }}
            </footer>
          </section>

          <!-- Footer -->
          <footer class="mt-8 pt-4 border-t text-center text-xs text-gray-400 print:hidden">
             Resumen generado por el sistema de gestión clínica SonriAndes.
          </footer>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.section-title {
  @apply font-bold text-primary border-b mb-2;
}

/* Forzar impresión de colores de fondo (crucial para odontograma) */
* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}

@media print {
  @page {
    margin: 1.5cm;
    size: auto;
  }

  /* 1. Ocultar TODO el cuerpo de la app */
  body > *:not(#printable-report-wrapper) { 
    display: none !important; 
  }

  /* 2. Resetear el cuerpo para que no corte páginas */
  html, body {
    height: auto !important;
    overflow: visible !important;
    position: static !important;
    background: white !important;
  }
  
  /* 3. Hacer visible el contenedor teletransportado */
  /* Nota: Usamos selectores genéricos porque Teleport mueve el div al body */
  body > div.fixed {
    position: static !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  #printable-report {
    width: 100% !important;
    max-width: none !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    height: auto !important;
    display: block !important;
  }
  
  /* Estilos de texto */
  .section-title {
    color: black !important;
    border-bottom: 2px solid #000;
    margin-top: 25px;
    break-after: avoid;
  }
  
  /* Paginación Inteligente */
  .avoid-break {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .avoid-row-break {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* --- ODONTOGRAMA (PÁGINA NUEVA Y VERTICAL) --- */
  .odontogram-page {
    break-before: page;
    page-break-before: always; 
    display: block;
    margin-top: 20px;
  }
  
  .odontogram-vertical-container {
    width: 100%;
    transform: scale(0.95); 
    transform-origin: top center;
    margin-top: 10px;
  }

  .print\:hidden {
    display: none !important;
  }
  
  ::-webkit-scrollbar { display: none; }
}
</style>