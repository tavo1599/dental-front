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

const logoSrc = computed(() => {
  if (selectedBudget.value?.tenant?.logoUrl) {
    return `${import.meta.env.VITE_API_BASE_URL}${selectedBudget.value.tenant.logoUrl}`;
  }
  isLogoLoaded.value = true; 
  return null;
});

// --- NUEVO CÁLCULO ---
const finalTotal = computed(() => {
  if (!selectedBudget.value) return 0;
  return Number(selectedBudget.value.totalAmount) - Number(selectedBudget.value.discountAmount || 0);
});

const tryPrint = () => {
  if (areFormatsRendered.value && isLogoLoaded.value) {
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
  }
});

function closeWindow() {
  window.close();
}

async function downloadPDF() {
  if (!selectedBudget.value) return;
  isDownloading.value = true;
  await nextTick();
  const element = document.getElementById('print-root');
  if (!element) {
    alert('No se encontró el contenido para descargar.');
    isDownloading.value = false;
    return;
  }

  try {
    // Renderiza el contenido a canvas
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    // Configuración A4 en mm
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // mm
    const pageHeight = 297; // mm
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

    pdf.save(`presupuesto_${selectedBudget.value.id}.pdf`);
  } catch (error) {
    console.error(error);
    alert('Error al generar el PDF.');
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
      <p class="text-text-light mb-2">Preparando para imprimir...</p>
      <p class="text-text-light mb-2">Ctrl + P para imprimir</p>
      <div class="flex justify-center gap-3">
        <button @click="downloadPDF" :disabled="isDownloading" class="btn-primary">
          {{ isDownloading ? 'Generando...' : 'Descargar PDF' }}
        </button>
        <button @click="closeWindow" class="btn-secondary">Cerrar Ventana</button>
      </div>
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
            <img :src="logoSrc" @load="isLogoLoaded = true" alt="Logo de la Clínica" class="max-h-24 max-w-24 object-contain" />
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
  .btn-secondary { @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; }
  @media print {
  .print\:page-break-after-always {
    page-break-after: always;
  }
  .break-inside-avoid {
    page-break-inside: avoid;
  }
  }
</style>