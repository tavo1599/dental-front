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
const isLogoLoaded = ref(false); // Control de carga de imagen
const areFormatsRendered = ref(false);

// --- LÓGICA INTELIGENTE PARA EL LOGO (R2 + Cache Busting) ---
const logoSrc = computed(() => {
  const url = selectedPayment.value?.budget?.tenant?.logoUrl;
  
  if (!url) {
    isLogoLoaded.value = true; // Si no hay logo, no bloqueamos la impresión
    return null;
  }

  const timestamp = new Date().getTime(); // Truco para evitar caché CORS

  // 1. Si es URL absoluta (R2/Cloudflare)
  if (url.startsWith('http')) {
    return `${url}?t=${timestamp}`;
  }

  // 2. Si es relativa (Legacy)
  return `${import.meta.env.VITE_API_BASE_URL}${url}?t=${timestamp}`;
});
// -----------------------------------------------------------

const tryPrint = () => {
  // Esperamos a que todo esté renderizado y el logo cargado (o que no exista)
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
    
    // Si no tiene logo, marcamos como cargado manualmente para no bloquear
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

  // Espera de seguridad para la imagen (CRUCIAL para que aparezca el logo)
  if (logoSrc.value && !isLogoLoaded.value) {
      await new Promise(resolve => setTimeout(resolve, 500));
  }

  const canvas = await html2canvas(element, { 
      scale: 2, 
      useCORS: true, // OBLIGATORIO para R2
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

// --- DESCARGAR ---
async function downloadPDF() {
  if (!selectedPayment.value) return;
  isDownloading.value = true;
  try {
    const pdf = await getPDFObject();
    pdf.save(`Recibo_Pago_${selectedPayment.value.budget.patient.fullName}.pdf`);
  } catch (error) {
    console.error(error);
    alert('Error al generar el PDF.');
  } finally {
    isDownloading.value = false;
  }
}

// --- WHATSAPP ---
async function sendToWhatsAppWithPDF() {
  if (!selectedPayment.value) return;
  
  let phone = selectedPayment.value.budget.patient.phone?.replace(/\D/g, '');
  if (!phone) {
    alert('El paciente no tiene un número de teléfono registrado.');
    return;
  }
  if (phone.length === 9) phone = `51${phone}`;

  isDownloading.value = true;

  try {
    const pdf = await getPDFObject();
    const fileName = `Recibo_${selectedPayment.value.budget.patient.fullName}.pdf`;
    pdf.save(fileName);

    const clinicName = selectedPayment.value.budget.tenant.name;
    const patientName = selectedPayment.value.budget.patient.fullName;
    const amount = Number(selectedPayment.value.amount).toFixed(2);
    const date = formatDate(selectedPayment.value.paymentDate);
    
    const message = `Hola *${patientName}*, le saludamos de *${clinicName}*.\n\n` +
                    `✅ *Confirmación de Pago*\n` +
                    `Hemos recibido su abono de *S/. ${amount}* con fecha *${date}*.\n\n` +
                    `📄 *Adjunto encontrará su recibo en PDF.*\n` +
                    `(Por favor, revise el archivo descargado)`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    setTimeout(() => { window.open(url, '_blank'); }, 500);

  } catch (error) {
    console.error(error);
    alert('Error al preparar el envío.');
  } finally {
    isDownloading.value = false;
  }
}

const printReceipt = () => {
  window.print();
};

const closeWindow = () => {
  window.close();
};
</script>

<template>
  <div class="p-4 md:p-8 bg-gray-100 font-sans min-h-screen flex flex-col items-center">
    
    <!-- BARRA DE HERRAMIENTAS -->
    <div class="print:hidden text-center mb-6 bg-white p-4 rounded-lg shadow-md w-full max-w-3xl sticky top-0 z-50">
      <p class="text-text-light mb-3 text-sm">Opciones del Recibo</p>
      
      <div class="flex flex-wrap justify-center gap-3">
        <button @click="printReceipt" class="btn-secondary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Imprimir
        </button>

        <button @click="downloadPDF" :disabled="isDownloading" class="btn-primary flex items-center gap-2">
           <span v-if="!isDownloading">Descargar PDF</span>
           <span v-else>Procesando...</span>
        </button>

        <button @click="sendToWhatsAppWithPDF" :disabled="isDownloading" class="btn-whatsapp flex items-center gap-2 shadow-sm hover:shadow-md transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          Enviar PDF por WhatsApp
        </button>

        <button @click="closeWindow" class="btn-secondary text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">Cerrar</button>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12">Cargando boleta...</div>
    
    <!-- CONTENIDO DEL RECIBO -->
    <div v-else-if="selectedPayment" id="receipt-content" class="w-full max-w-3xl bg-white shadow-lg p-10 print:shadow-none relative">
      
      <!-- HEADER CON LOGO AL EXTREMO -->
      <header class="flex justify-between items-start pb-6 border-b-2 border-primary">
        <!-- Datos Clínica (Izquierda) -->
        <div class="flex-1 pr-4">
          <h1 class="text-3xl font-bold text-primary uppercase">{{ selectedPayment.budget.tenant.name }}</h1>
          <p class="text-sm text-gray-600 mt-2 leading-snug">{{ selectedPayment.budget.tenant.address }}</p>
          <p class="text-sm text-gray-600">{{ selectedPayment.budget.tenant.phone }}</p>
          <p class="text-sm text-gray-600">{{ selectedPayment.budget.tenant.email }}</p>
        </div>
        
        <!-- Logo (Derecha Extrema) -->
        <div v-if="logoSrc" class="w-32 h-32 flex-shrink-0 flex items-start justify-end">
          <!-- IMPORTANTE: crossorigin="anonymous" y @load son VITALES -->
          <img 
            :src="logoSrc" 
            @load="isLogoLoaded = true" 
            crossorigin="anonymous" 
            alt="Logo de la Clínica" 
            class="max-h-32 max-w-full object-contain" 
          />
        </div>
      </header>

      <section class="mt-8 grid grid-cols-2 gap-8">
        <div>
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Recibo para</h3>
          <p class="font-bold text-lg text-text-dark">{{ selectedPayment.budget.patient.fullName }}</p>
          <p class="text-text-light">DNI: {{ selectedPayment.budget.patient.dni }}</p>
        </div>
        <div class="text-right">
          <h2 class="text-2xl font-bold text-gray-800">RECIBO DE PAGO</h2>
          <p class="text-gray-600 mt-1 font-mono text-lg">N°: {{ selectedPayment.id.substring(0, 8).toUpperCase() }}</p>
        </div>
      </section>

      <section class="my-8">
        <h3 class="text-md font-semibold text-gray-700 mb-2">Tratamientos del Presupuesto Asociado</h3>
        <table class="w-full text-left text-sm">
          <thead class="border-b-2 border-gray-300 bg-gray-50">
            <tr>
              <th class="p-3 text-sm font-semibold text-gray-600 uppercase">Descripción</th>
              <th class="p-3 text-center text-sm font-semibold text-gray-600 uppercase w-24">Cant.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in selectedPayment.budget.items" :key="item.id" class="border-b border-gray-100">
              <td class="p-3">{{ item.treatment.name }}</td>
              <td class="p-3 text-center">{{ item.quantity }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="my-8">
        <table class="w-full text-left">
          <thead class="border-b-2 border-gray-300 bg-gray-50">
            <tr>
              <th class="p-3 text-sm font-semibold text-gray-600 uppercase">Detalle del Pago</th>
              <th class="p-3 text-right text-sm font-semibold text-gray-600 uppercase w-40">Fecha</th>
              <th class="p-3 text-right text-sm font-semibold text-gray-600 uppercase w-40">Monto Pagado</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-100">
              <td class="p-3">
                Abono a presupuesto 
                <span class="font-mono text-gray-600 text-xs">#{{ selectedPayment.budget.id.substring(0, 8).toUpperCase() }}</span>
              </td>
              <td class="p-3 text-right">{{ formatDate(selectedPayment.paymentDate) }}</td>
              <td class="p-3 text-right font-bold text-gray-900">S/. {{ Number(selectedPayment.amount).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </section>
      
      <footer class="mt-12">
        <div class="flex justify-end">
          <div class="w-full sm:w-1/2 text-right">
            <div class="flex justify-between items-center font-bold text-xl text-primary border-t-2 border-primary pt-3">
              <span>TOTAL PAGADO:</span>
              <span>S/. {{ Number(selectedPayment.amount).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <div class="mt-24 flex justify-center">
          <div class="border-t border-gray-400 w-64 text-center pt-2">
            <p class="text-sm text-gray-500 mb-1">Recibí Conforme</p>
            <p class="text-md font-semibold text-gray-800">{{ selectedPayment.budget.patient.fullName }}</p>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
  .btn-primary {
    @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold border border-transparent;
  }
  .btn-secondary {
    @apply px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors;
  }
  .btn-whatsapp {
    @apply px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold border border-transparent transition-colors;
  }

  @media print {
    body {
      background: white;
    }
    body * { 
      visibility: hidden; 
    }
    #receipt-content, #receipt-content * { 
      visibility: visible; 
    }
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
    .print\:hidden { 
      display: none !important; 
    }
  }
</style>