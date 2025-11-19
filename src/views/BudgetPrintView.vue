<script setup lang="ts">
import { onMounted, ref, computed, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useBudgetsStore } from '@/stores/budgets';
import { storeToRefs } from 'pinia';
import type { Budget } from '@/types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const route = useRoute();
const budgetsStore = useBudgetsStore();
const { selectedBudget, isLoading } = storeToRefs(budgetsStore);

const isLogoLoaded = ref(false);
const areFormatsRendered = ref(false);
const isDownloading = ref(false);

const formatsToPrint = computed(() => route.query.formats?.toString().split(',') || []);

// --- CORRECCIÓN DE LOGO PARA PDF (R2 + CORS) ---
const logoSrc = computed(() => {
  const url = selectedBudget.value?.tenant?.logoUrl;
  
  if (!url) {
    isLogoLoaded.value = true; 
    return null;
  }

  // Añadimos un timestamp para evitar problemas de caché con CORS
  const timestamp = new Date().getTime();

  // 1. URL Absoluta (Cloudflare R2)
  if (url.startsWith('http')) {
    return `${url}?t=${timestamp}`;
  }

  // 2. URL Relativa (Legacy)
  return `${import.meta.env.VITE_API_BASE_URL}${url}?t=${timestamp}`;
});
// -----------------------------------------------

const finalTotal = computed(() => {
  if (!selectedBudget.value) return 0;
  return Number(selectedBudget.value.totalAmount) - Number(selectedBudget.value.discountAmount || 0);
});

const tryPrint = () => {
  // Solo imprimimos si los formatos están listos Y el logo cargó
  if (areFormatsRendered.value && (isLogoLoaded.value || !logoSrc.value)) {
    window.print();
  }
};

watch([areFormatsRendered, isLogoLoaded], tryPrint);

onMounted(async () => {
  const budgetId = route.params.id as string;
  if (budgetId) {
    await budgetsStore.fetchBudgetForPrint(budgetId);
    await nextTick();
    areFormatsRendered.value = true;
    // Si no hay logo, marcamos como cargado para no bloquear
    if (!selectedBudget.value?.tenant?.logoUrl) {
        isLogoLoaded.value = true;
    }
  }
});

function closeWindow() {
  window.close();
}

// --- HELPER: Generar PDF ---
async function getPDFObject() {
  await nextTick();
  const element = document.getElementById('print-root');
  if (!element) throw new Error('No se encontró el contenido.');

  // Esperamos un momento extra por seguridad si hay logo
  if (logoSrc.value && !isLogoLoaded.value) {
      await new Promise(resolve => setTimeout(resolve, 500));
  }

  const canvas = await html2canvas(element, { 
      scale: 2, 
      useCORS: true, // CRUCIAL para imágenes externas (R2)
      logging: false
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = position - pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  return pdf;
}

// --- ACCIÓN 1: DESCARGAR PDF ---
async function downloadPDF() {
  if (!selectedBudget.value) return;
  isDownloading.value = true;
  try {
    const pdf = await getPDFObject();
    pdf.save(`Presupuesto_${selectedBudget.value.patient.fullName}.pdf`);
  } catch (error) {
    console.error(error);
    alert('Error al generar el PDF.');
  } finally {
    isDownloading.value = false;
  }
}

// --- ACCIÓN 2: WHATSAPP ---
async function sendToWhatsAppWithPDF() {
  if (!selectedBudget.value) return;
  
  let phone = selectedBudget.value.patient.phone?.replace(/\D/g, '');
  if (!phone) {
    alert('El paciente no tiene un número de teléfono registrado.');
    return;
  }
  if (phone.length === 9) phone = `51${phone}`;

  isDownloading.value = true; 

  try {
    const pdf = await getPDFObject();
    pdf.save(`Presupuesto_${selectedBudget.value.patient.fullName}.pdf`);

    const clinicName = selectedBudget.value.tenant.name;
    const patientName = selectedBudget.value.patient.fullName;
    const total = finalTotal.value.toFixed(2);
    
    const message = `Hola *${patientName}*, le saludamos de *${clinicName}*.\n\n` +
                    `📄 *Adjunto encontrará el PDF detallado de su presupuesto.*\n` +
                    `💰 Monto Total: S/. ${total}\n\n` +
                    `(Por favor, revise el archivo descargado)`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    setTimeout(() => window.open(url, '_blank'), 500);

  } catch (error) {
    console.error(error);
    alert('Error al preparar WhatsApp.');
  } finally {
    isDownloading.value = false;
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
};
</script>

<template>
  <div class="p-4 md:p-8 bg-gray-100 font-sans">
    <div class="print:hidden text-center mb-4 bg-white p-4 rounded-lg shadow-md max-w-4xl mx-auto">
      <p class="text-text-light mb-2">Vista previa del documento</p>
      
      <div class="flex flex-wrap justify-center gap-3 mt-4">
        <button @click="downloadPDF" :disabled="isDownloading" class="btn-primary">
          {{ isDownloading ? 'Procesando...' : 'Descargar PDF' }}
        </button>
        <button @click="sendToWhatsAppWithPDF" :disabled="isDownloading" class="btn-whatsapp flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          Enviar PDF por WhatsApp
        </button>

        <button @click="closeWindow" class="btn-secondary">Cerrar</button>
      </div>
      <p v-if="isDownloading" class="text-xs text-primary mt-2 font-semibold animate-pulse">Generando documento, por favor espere...</p>
    </div>

    <div v-if="isLoading" class="text-center py-12">Cargando presupuesto...</div>
    
    <div v-else-if="selectedBudget" id="print-root" class="max-w-4xl mx-auto space-y-8">
      
      <div v-if="formatsToPrint.includes('patient')" id="patient-format" class="p-10 bg-white shadow-lg print:page-break-after-always">
        <header class="flex justify-between items-start pb-6 border-b-2 border-primary">
          <div>
            <h1 class="text-3xl font-bold text-primary">{{ selectedBudget.tenant.name }}</h1>
            <p class="text-sm text-gray-500 mt-1">{{ selectedBudget.tenant.address }}</p>
            <p class="text-sm text-gray-500">{{ selectedBudget.tenant.phone }}</p>
            <p class="text-sm text-gray-500">{{ selectedBudget.tenant.email }}</p>
          </div>
          <div v-if="logoSrc" class="w-24 h-24 flex-shrink-0">
            <img 
              :src="logoSrc" 
              @load="isLogoLoaded = true" 
              crossorigin="anonymous"
              alt="Logo de la Clínica" 
              class="max-h-24 max-w-24 object-contain" 
            />
          </div>
        </header>

        <section class="mt-8 grid grid-cols-2 gap-8">
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Presupuesto para</h3>
            <p class="font-bold text-lg text-text-dark">{{ selectedBudget.patient.fullName }}</p>
            <p class="text-text-light">DNI: {{ selectedBudget.patient.dni }}</p>
          </div>
          <div class="text-right">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Fecha de Emisión</h3>
            <p class="font-bold text-lg text-text-dark">{{ formatDate(selectedBudget.creationDate) }}</p>
          </div>
        </section>

        <section class="my-8">
          <table class="w-full text-left">
            <thead class="border-b-2 border-gray-300">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-500 uppercase">Tratamiento</th>
                <th class="p-3 text-center text-sm font-semibold text-gray-500 uppercase">Cant.</th>
                <th class="p-3 text-right text-sm font-semibold text-gray-500 uppercase">P/U</th>
                <th class="p-3 text-right text-sm font-semibold text-gray-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedBudget.items" :key="item.id" class="border-b border-gray-100">
                <td class="p-3">{{ item.treatment.name }}</td>
                <td class="p-3 text-center">{{ item.quantity }}</td>
                <td class="p-3 text-right">S/. {{ Number(item.priceAtTimeOfBudget).toFixed(2) }}</td>
                <td class="p-3 text-right">S/. {{ (item.priceAtTimeOfBudget * item.quantity).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </section>
        
        <footer class="mt-8 flex justify-end">
          <div class="w-full sm:w-2/5 text-right">
            <div class="space-y-2">
              <div class="flex justify-between text-lg">
                <span class="text-gray-600">Subtotal:</span>
                <span class="text-gray-800">S/. {{ Number(selectedBudget.totalAmount).toFixed(2) }}</span>
              </div>
              <div v-if="selectedBudget.discountAmount > 0" class="flex justify-between text-lg text-red-600">
                <span class="text-gray-600">Descuento:</span>
                <span class="font-semibold">- S/. {{ Number(selectedBudget.discountAmount).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between font-bold text-2xl text-primary border-t-2 border-primary mt-2 pt-2">
                <span>TOTAL:</span>
                <span>S/. {{ finalTotal.toFixed(2) }}</span>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-6">Presupuesto válido por 30 días.</p>
          </div>
        </footer>
      </div>

      <div v-if="formatsToPrint.includes('doctor')" id="doctor-format" class="font-mono p-4 bg-white border border-dashed text-xs shadow-lg break-inside-avoid">
        <h2 class="text-lg font-bold">Ficha Interna de Presupuesto</h2>
        <p><strong>ID Presupuesto:</strong> {{ selectedBudget.id }}</p>
        <p><strong>Paciente:</strong> {{ selectedBudget.patient.fullName }} (ID: {{ selectedBudget.patient.id }})</p>
        <p><strong>Fecha:</strong> {{ new Date(selectedBudget.creationDate).toLocaleString('es-PE') }}</p>
        <hr class="my-2">
        <ul>
          <li v-for="item in selectedBudget.items" :key="item.id">
            - {{ item.treatment.name }} (x{{ item.quantity }}) @ S/.{{ Number(item.priceAtTimeOfBudget).toFixed(2) }}
          </li>
        </ul>
        <hr class="my-2">
        <p><strong>Subtotal:</strong> S/. {{ Number(selectedBudget.totalAmount).toFixed(2) }}</p>
        <p v-if="selectedBudget.discountAmount > 0"><strong>Descuento:</strong> - S/. {{ Number(selectedBudget.discountAmount).toFixed(2) }}</p>
        <p class="font-bold"><strong>Total Final:</strong> S/. {{ finalTotal.toFixed(2) }}</p>
        <p><strong>Pagado:</strong> S/. {{ Number(selectedBudget.paidAmount).toFixed(2) }}</p>
        <p><strong>Saldo:</strong> S/. {{ (finalTotal - selectedBudget.paidAmount).toFixed(2) }}</p>
        <p><strong>Estado:</strong> {{ selectedBudget.status }}</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
  .btn-primary {
     @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold;
  }
  .btn-secondary { 
    @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; 
  }
  .btn-whatsapp {
    @apply px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors;
  }

  @media print {
    .print\:page-break-after-always {
      page-break-after: always;
    }
    .break-inside-avoid {
      page-break-inside: avoid;
    }
  }
</style>