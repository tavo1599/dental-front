<script setup lang="ts">
import { onMounted, nextTick, computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useBudgetsStore } from '@/stores/budgets';
import { storeToRefs } from 'pinia';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const route = useRoute();
const budgetsStore = useBudgetsStore();
const { selectedPayment, isLoading } = storeToRefs(budgetsStore);

const isDownloading = ref(false);
const isLogoLoaded = ref(false);
const areFormatsRendered = ref(false);

// --- LÓGICA DE LOGO (R2) ---
const logoSrc = computed(() => {
  const url = selectedPayment.value?.budget?.tenant?.logoUrl;
  if (!url) {
    isLogoLoaded.value = true;
    return null;
  }
  const timestamp = new Date().getTime();
  if (url.startsWith('http')) return `${url}?t=${timestamp}`;
  return `${import.meta.env.VITE_API_BASE_URL}${url}?t=${timestamp}`;
});

// --- DETECCIÓN ORTODONCIA ---
const isOrtho = computed(() => {
    const b = selectedPayment.value?.budget;
    if (!b) return false;
    return !!b.isOrthodontic || !!b.orthoType || (Number(b.installments) > 0);
});

// --- CÁLCULOS FINANCIEROS DEL PLAN ---
const planDetails = computed(() => {
    const b = selectedPayment.value?.budget;
    if (!b) return { total: 0, paid: 0, balance: 0 };
    
    const total = Number(b.totalAmount) - Number(b.discountAmount || 0);
    const paid = Number(b.paidAmount); 
    const balance = Math.max(0, total - paid);
    
    return { total, paid, balance };
});

const tryPrint = () => {
  if (areFormatsRendered.value && (isLogoLoaded.value || !logoSrc.value)) {
    window.print();
  }
};

watch([areFormatsRendered, isLogoLoaded], tryPrint);

onMounted(async () => {
  const paymentId = route.params.id as string;
  if (paymentId) {
    await budgetsStore.fetchPaymentForReceipt(paymentId);
    await nextTick();
    areFormatsRendered.value = true;
    if (!selectedPayment.value?.budget?.tenant?.logoUrl) {
        isLogoLoaded.value = true;
    }
  }
});

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

// --- HELPER PDF ---
async function getPDFObject() {
  await nextTick();
  const element = document.getElementById('receipt-content');
  if (!element) throw new Error('No se encontró el contenido del recibo.');

  if (logoSrc.value && !isLogoLoaded.value) {
      await new Promise(resolve => setTimeout(resolve, 500));
  }

  const canvas = await html2canvas(element, { 
      scale: 2, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = 210;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
  return pdf;
}

// --- ACCIONES ---
async function downloadPDF() {
  if (!selectedPayment.value) return;
  isDownloading.value = true;
  try {
    const pdf = await getPDFObject();
    pdf.save(`Recibo_${selectedPayment.value.budget.patient.fullName}.pdf`);
  } catch (error) {
    console.error(error);
    alert('Error al generar PDF.');
  } finally {
    isDownloading.value = false;
  }
}

async function sendToWhatsAppWithPDF() {
  if (!selectedPayment.value) return;
  const phone = selectedPayment.value.budget.patient.phone?.replace(/\D/g, '');
  if (!phone) return alert('Paciente sin celular.');
  
  isDownloading.value = true;
  try {
    const pdf = await getPDFObject();
    pdf.save(`Recibo.pdf`);

    const clinic = selectedPayment.value.budget.tenant.name;
    const amount = Number(selectedPayment.value.amount).toFixed(2);
    
    let message = '';
    if (isOrtho.value) {
        message = `Hola, confirmamos su pago de *S/. ${amount}* a su tratamiento de ortodoncia en *${clinic}*.\n` +
                  `Saldo restante: S/. ${planDetails.value.balance.toFixed(2)}`;
    } else {
        message = `Hola, confirmamos su pago de *S/. ${amount}* en *${clinic}*.`;
    }

    const url = `https://wa.me/51${phone}?text=${encodeURIComponent(message)}`;
    setTimeout(() => window.open(url, '_blank'), 500);
  } finally {
    isDownloading.value = false;
  }
}

const printReceipt = () => window.print();
const closeWindow = () => window.close();
</script>

<template>
  <div class="p-6 bg-gray-100 font-sans min-h-screen flex flex-col items-center">
    
    <!-- BARRA DE HERRAMIENTAS -->
    <div class="print:hidden text-center mb-6 bg-white p-4 rounded-lg shadow-md w-full max-w-3xl sticky top-0 z-50 border border-gray-200">
      <p class="text-text-light mb-3 text-sm">Opciones del Recibo</p>
      <div class="flex flex-wrap justify-center gap-3">
        <button @click="printReceipt" class="btn-secondary flex items-center gap-2">Imprimir</button>
        <button @click="downloadPDF" :disabled="isDownloading" class="btn-primary flex items-center gap-2">
           <span v-if="!isDownloading">Descargar PDF</span><span v-else>Procesando...</span>
        </button>
        <button @click="sendToWhatsAppWithPDF" :disabled="isDownloading" class="btn-whatsapp flex items-center gap-2">WhatsApp</button>
        <button @click="closeWindow" class="btn-secondary text-red-600 border-red-200">Cerrar</button>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12">Cargando...</div>
    
    <!-- CONTENIDO DEL RECIBO -->
    <div v-else-if="selectedPayment" id="receipt-content" class="w-full max-w-3xl bg-white shadow-xl p-[15mm] print:shadow-none relative">
      
      <!-- Header -->
      <header class="flex justify-between items-start pb-6 border-b-2 border-primary mb-6">
        <div class="flex-1 pr-4">
          <h1 class="text-2xl font-bold text-primary uppercase">{{ selectedPayment.budget.tenant.name }}</h1>
          <p class="text-xs text-gray-500 mt-2">{{ selectedPayment.budget.tenant.address }}</p>
          <p class="text-xs text-gray-500">{{ selectedPayment.budget.tenant.phone }}</p>
        </div>
        <div v-if="logoSrc" class="w-24 h-24 flex-shrink-0 flex justify-end">
          <img :src="logoSrc" @load="isLogoLoaded = true" crossorigin="anonymous" class="max-h-full object-contain" />
        </div>
      </header>

      <!-- Info Recibo -->
      <div class="flex justify-between items-end mb-8">
        <div>
           <p class="text-xs text-gray-400 uppercase font-bold">Recibo para:</p>
           <p class="text-lg font-bold text-gray-800">{{ selectedPayment.budget.patient.fullName }}</p>
           <p class="text-sm text-gray-500">DNI: {{ selectedPayment.budget.patient.dni }}</p>
           
           <div v-if="isOrtho" class="mt-2 inline-block bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded border border-blue-200 uppercase font-bold">
              Ortodoncia
           </div>
        </div>
        <div class="text-right">
           <h2 class="text-3xl font-black text-gray-200 tracking-widest uppercase">Recibo</h2>
           <p class="text-sm font-mono text-gray-600">N° OP: {{ selectedPayment.id.substring(0, 8).toUpperCase() }}</p>
           <p class="text-sm text-gray-600">{{ formatDate(selectedPayment.paymentDate) }}</p>
        </div>
      </div>

      <!-- DETALLE DE ITEMS DEL PRESUPUESTO -->
      <section class="mb-6">
        <h4 class="text-xs font-bold text-gray-500 uppercase mb-2 border-b pb-1">
            {{ isOrtho ? 'Detalle del Plan / Tratamientos' : 'Tratamientos Incluidos' }}
        </h4>
        <ul class="text-sm space-y-2 text-gray-700">
            <!-- Caso Ortodoncia: Costo Base -->
            <li v-if="isOrtho && Number(selectedPayment.budget.baseTreatmentCost) > 0" class="flex justify-between border-b border-dashed border-gray-100 pb-1">
                <span>• Honorarios Profesionales Base</span>
                <!-- Se reemplazó "Global" por el monto exacto -->
                <span class="text-gray-700 text-xs font-medium">S/. {{ Number(selectedPayment.budget.baseTreatmentCost).toFixed(2) }}</span>
            </li>
            
            <!-- Items (con Cantidad y Precio) -->
            <li v-for="item in selectedPayment.budget.items" :key="item.id" class="flex justify-between border-b border-dashed border-gray-100 pb-1 last:border-0 items-center">
                <span>• {{ item.treatment.name }}</span>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold bg-gray-100 px-1.5 rounded text-gray-600">x{{ item.quantity }}</span>
                    <!-- Agregado precio unitario -->
                    <span class="text-xs font-medium text-gray-700">S/. {{ Number(item.priceAtTimeOfBudget).toFixed(2) }}</span>
                </div>
            </li>
        </ul>
        
        <!-- Descuento Global -->
        <div v-if="selectedPayment.budget.discountAmount > 0" class="text-right text-xs text-red-500 mt-2">
            Descuento total aplicado al plan: - S/. {{ Number(selectedPayment.budget.discountAmount).toFixed(2) }}
        </div>
      </section>

      <!-- DETALLE DEL PAGO Y ESTADO DE CUENTA -->
      <section class="mb-8">
        
        <!-- CASO A: ORTODONCIA (RESUMEN FINANCIERO) -->
        <div v-if="isOrtho" class="bg-blue-50 rounded-lg p-5 border border-blue-100">
            <h3 class="text-sm font-bold text-blue-900 mb-3 border-b border-blue-200 pb-2 uppercase">Estado de Cuenta</h3>
            
            <div class="grid grid-cols-3 gap-4 text-center mb-4">
                <div class="bg-white p-2 rounded border border-blue-100">
                    <p class="text-[10px] text-gray-500 uppercase">Costo Total</p>
                    <p class="font-bold text-gray-800">S/. {{ planDetails.total.toFixed(2) }}</p>
                </div>
                <div class="bg-white p-2 rounded border border-blue-100">
                    <p class="text-[10px] text-gray-500 uppercase">Abonado</p>
                    <p class="font-bold text-green-600">S/. {{ planDetails.paid.toFixed(2) }}</p>
                </div>
                <div class="bg-white p-2 rounded border border-blue-100">
                    <p class="text-[10px] text-gray-500 uppercase">Saldo Restante</p>
                    <p class="font-bold text-red-500">S/. {{ planDetails.balance.toFixed(2) }}</p>
                </div>
            </div>

            <!-- Bloque Azul de Pago con Fecha Agregada -->
            <div class="bg-blue-600 text-white p-3 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2">
                <div class="flex flex-col text-center sm:text-left">
                    <span class="font-medium text-sm text-blue-100 uppercase tracking-wide">Monto Pagado</span>
                    <span class="text-xs text-blue-200">Fecha: {{ formatDate(selectedPayment.paymentDate) }}</span>
                </div>
                <span class="font-bold text-3xl">S/. {{ Number(selectedPayment.amount).toFixed(2) }}</span>
            </div>
        </div>

        <!-- CASO B: TRATAMIENTO ESTÁNDAR (TABLA DETALLADA) -->
        <div v-else>
            <table class="w-full text-left text-sm border-collapse">
              <thead>
                <tr class="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-xs">
                  <th class="p-3 rounded-l-lg">Concepto</th>
                  <th class="p-3 text-center w-32">Fecha de Pago</th>
                  <th class="p-3 text-right w-32 rounded-r-lg">Monto</th>
                </tr>
              </thead>
              <tbody class="text-gray-700">
                <tr class="border-b border-gray-50">
                  <td class="p-3 font-medium">Pago a cuenta del presupuesto #{{ selectedPayment.budget.id.substring(0,8).toUpperCase() }}</td>
                  <td class="p-3 text-center text-gray-500">{{ formatDate(selectedPayment.paymentDate) }}</td>
                  <td class="p-3 text-right font-bold text-lg">S/. {{ Number(selectedPayment.amount).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="mt-4 flex justify-end">
               <div class="text-right">
                  <p class="text-xs text-gray-500">Saldo pendiente del presupuesto:</p>
                  <p class="font-bold text-red-500 text-lg">S/. {{ planDetails.balance.toFixed(2) }}</p>
               </div>
            </div>
        </div>

      </section>
      
      <!-- Footer -->
      <footer class="mt-12 pt-16 border-t border-dashed border-gray-300 flex flex-col items-center gap-4">
         <div class="w-64 border-b border-gray-400"></div>
         <p class="text-sm font-semibold text-gray-700">Recibí Conforme</p>
         <p class="text-[10px] text-gray-400 mt-2">Documento generado electrónicamente por SonriAndes.</p>
      </footer>

    </div>
  </div>
</template>

<style scoped>
  .btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold border border-transparent; }
  .btn-secondary { @apply px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold; }
  .btn-whatsapp { @apply px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold border border-transparent; }

  @media print {
    body { background: white; margin: 0; }
    body * { visibility: hidden; }
    #receipt-content, #receipt-content * { visibility: visible; }
    #receipt-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      margin: 0;
      padding: 0;
      box-shadow: none;
      border: none;
    }
    .print\:hidden { display: none !important; }
  }
</style>