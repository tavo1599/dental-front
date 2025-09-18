<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useBudgetsStore } from '@/stores/budgets';
import LogoDental from '@/components/icons/LogoDental.vue';
import type { Budget } from '@/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const route = useRoute();
const budgetsStore = useBudgetsStore();
const budget = ref<Budget | null>(null);
const isLoading = ref(true);
const isGeneratingPdf = ref(false);

const formatsToPrint = computed(() => route.query.formats?.toString().split(',') || []);

onMounted(async () => {
  const budgetId = route.params.id as string;
  const fetchedBudget = await budgetsStore.fetchBudgetById(budgetId);
  if (fetchedBudget) {
    budget.value = fetchedBudget;
    isLoading.value = false;
  }
});

async function generatePdf() {
  if (!budget.value) return;
  isGeneratingPdf.value = true;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const options = { scale: 2, useCORS: true };

  if (formatsToPrint.value.includes('patient')) {
    const patientElement = document.getElementById('patient-format');
    if (patientElement) {
      const canvas = await html2canvas(patientElement, options);
      const imgData = canvas.toDataURL('image/png');
      const { width } = pdf.internal.pageSize;
      const imgHeight = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, imgHeight);
    }
  }

  if (formatsToPrint.value.includes('patient') && formatsToPrint.value.includes('doctor')) {
    pdf.addPage();
  }

  if (formatsToPrint.value.includes('doctor')) {
    const doctorElement = document.getElementById('doctor-format');
    if (doctorElement) {
      const canvas = await html2canvas(doctorElement, options);
      const imgData = canvas.toDataURL('image/png');
      const { width } = pdf.internal.pageSize;
      const imgHeight = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, imgHeight);
    }
  }

  pdf.save(`presupuesto-${budget.value.patient.dni || 'paciente'}.pdf`);
  isGeneratingPdf.value = false;
}

function closeWindow() {
  // eslint-disable-next-line no-undef
  window.close();
}
</script>

<template>
  <div class="p-4 md:p-8 bg-gray-200">
    <div class="print:hidden text-center mb-4 space-x-4 bg-white p-4 rounded-lg shadow-md max-w-4xl mx-auto">
      <button @click="generatePdf" class="btn-primary" :disabled="isGeneratingPdf">
        {{ isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF' }}
      </button>
      <button @click="closeWindow" class="btn-secondary">Cerrar Ventana</button>
    </div>

    <div v-if="isLoading" class="text-center py-12">Cargando presupuesto...</div>
    <div v-else-if="budget" class="max-w-4xl mx-auto space-y-8">
      <div v-if="formatsToPrint.includes('patient')" id="patient-format" class="font-sans p-6 bg-white">
        <header class="flex justify-between items-start pb-4 border-b">
          <div>
            <h1 class="text-2xl font-bold text-primary">{{ budget.tenant.name }}</h1>
            <p class="text-text-light">Plan de Tratamiento</p>
          </div>
          <LogoDental class="h-16 w-auto text-secondary" />
        </header>
        <section class="mt-6 text-sm">
          <p><strong class="text-text-light">Paciente:</strong> {{ budget.patient.fullName }}</p>
          <p><strong class="text-text-light">Fecha:</strong> {{ new Date(budget.creationDate).toLocaleDateString('es-PE') }}</p>
        </section>
        <table class="w-full mt-6 text-left text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-2 font-semibold">Tratamiento</th>
              <th class="p-2 text-center font-semibold">Cant.</th>
              <th class="p-2 text-right font-semibold">Precio Unit.</th>
              <th class="p-2 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in budget.items" :key="item.id" class="border-b">
              <td class="p-2">{{ item.treatment.name }}</td>
              <td class="p-2 text-center">{{ item.quantity }}</td>
              <td class="p-2 text-right">S/. {{ Number(item.priceAtTimeOfBudget).toFixed(2) }}</td>
              <td class="p-2 text-right">S/. {{ (Number(item.priceAtTimeOfBudget) * item.quantity).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <footer class="mt-6 text-right">
          <p class="text-2xl font-bold text-text-dark">Total: S/. {{ Number(budget.totalAmount).toFixed(2) }}</p>
        </footer>
      </div>

      <div v-if="formatsToPrint.includes('doctor')" id="doctor-format" class="font-mono p-4 bg-white border border-dashed text-xs">
         <h2 class="text-lg font-bold">Ficha Interna de Presupuesto</h2>
         <p><strong>ID Presupuesto:</strong> {{ budget.id }}</p>
         <p><strong>Paciente:</strong> {{ budget.patient.fullName }} (ID: {{ budget.patient.id }})</p>
         <p><strong>Fecha:</strong> {{ new Date(budget.creationDate).toLocaleString('es-PE') }}</p>
         <hr class="my-2">
         <ul>
          <li v-for="item in budget.items" :key="item.id">
            - {{ item.treatment.name }} (x{{ item.quantity }}) @ S/.{{ Number(item.priceAtTimeOfBudget).toFixed(2) }}
          </li>
         </ul>
         <hr class="my-2">
         <p><strong>Total:</strong> S/. {{ Number(budget.totalAmount).toFixed(2) }} / <strong>Pagado:</strong> S/. {{ Number(budget.paidAmount).toFixed(2) }}</p>
         <p><strong>Estado:</strong> {{ budget.status }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; }
  .btn-secondary { @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; }
</style>