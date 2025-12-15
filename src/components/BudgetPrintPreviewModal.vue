<script setup lang="ts">
import { onMounted, ref, computed, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useBudgetsStore } from '@/stores/budgets';
import { storeToRefs } from 'pinia';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { Budget } from '@/types';

const props = defineProps<{ 
  budgetId: string;
  formats: string[]; // ['patient', 'doctor']
}>();

const emit = defineEmits(['close']);

const route = useRoute();
const budgetsStore = useBudgetsStore();
const { selectedBudget, isLoading } = storeToRefs(budgetsStore);

const isLogoLoaded = ref(false);
const isDownloading = ref(false);

const currentId = computed(() => props.budgetId || route.params.id as string);

// --- PROPS PARA MOSTRAR FORMATOS ---
const showPatientFormat = computed(() => props.formats.includes('patient'));
const showDoctorFormat = computed(() => props.formats.includes('doctor'));

// --- LOGO (Con corrección R2 + Cache) ---
const logoSrc = computed(() => {
  const url = selectedBudget.value?.tenant?.logoUrl;
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
    const b = selectedBudget.value;
    if (!b) return false;
    return !!b.isOrthodontic || !!b.orthoType || (b.installments !== undefined && b.installments > 0);
});

const finalTotal = computed(() => {
  if (!selectedBudget.value) return 0;
  return Number(selectedBudget.value.totalAmount) - Number(selectedBudget.value.discountAmount || 0);
});

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
};

// --- CARGA ---
onMounted(async () => {
  if (currentId.value) {
    await budgetsStore.fetchBudgetForPrint(currentId.value);
    await nextTick();
    if (!selectedBudget.value?.tenant?.logoUrl) isLogoLoaded.value = true;
  }
});

// --- GENERADOR PDF PROFESIONAL (Técnica de Clonado) ---
async function getPDFObject() {
  await nextTick();
  
  // 1. Buscamos las hojas originales en pantalla
  const originalPages = document.querySelectorAll('.a4-page-capture');
  if (originalPages.length === 0) throw new Error('No hay páginas para generar.');

  // Esperar carga de logo
  if (logoSrc.value && !isLogoLoaded.value) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Un poco más de tiempo por seguridad
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = 210;
  const pdfHeight = 297;

  // 2. Procesamos hoja por hoja
  for (let i = 0; i < originalPages.length; i++) {
    const original = originalPages[i] as HTMLElement;

    // A. CLONAMOS EL NODO para manipularlo sin afectar la vista del usuario
    // Esto evita que salgan scrollbars o bordes raros
    const clone = original.cloneNode(true) as HTMLElement;
    
    // B. Configuramos el clon para que sea perfecto para impresión
    clone.style.position = 'fixed';
    clone.style.top = '-10000px'; // Lo sacamos de la vista
    clone.style.left = '-10000px';
    clone.style.width = '210mm';   // Ancho A4 exacto
    clone.style.height = '297mm';  // Alto A4 exacto
    clone.style.margin = '0';
    clone.style.padding = '15mm'; // Padding interno para márgenes de impresión
    clone.style.transform = 'scale(1)'; // Sin zoom
    clone.style.zIndex = '-1';
    clone.classList.remove('shadow-2xl'); // Quitamos la sombra visual
    
    // Inyectamos al body para que html2canvas pueda renderizarlo
    document.body.appendChild(clone);

    try {
        // C. Capturamos el clon limpio
        const canvas = await html2canvas(clone, { 
            scale: 2, // Alta calidad (Retina)
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794, // Ancho en px para A4 a 96DPI (aprox)
            height: 1123
        });

        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
    } finally {
        // D. Limpiamos
        document.body.removeChild(clone);
    }
  }
  
  return pdf;
}

// --- ACCIONES ---
async function downloadPDF() {
  if (!selectedBudget.value) return;
  isDownloading.value = true;
  try {
    const pdf = await getPDFObject();
    pdf.save(`Presupuesto_${selectedBudget.value.patient.fullName}.pdf`);
  } catch (error) {
    console.error(error);
    alert('Error al generar PDF. Intente de nuevo.');
  } finally {
    isDownloading.value = false;
  }
}

async function sendToWhatsApp() {
  if (!selectedBudget.value) return;
  const phone = selectedBudget.value.patient.phone?.replace(/\D/g, '');
  if (!phone) return alert('El paciente no tiene celular registrado.');
  
  isDownloading.value = true;
  try {
    const pdf = await getPDFObject();
    pdf.save(`Presupuesto.pdf`);

    const total = finalTotal.value.toFixed(2);
    let message = '';
    
    if (isOrtho.value) {
       message = `Hola *${selectedBudget.value.patient.fullName}*, adjunto su *Plan de Ortodoncia*.\n` +
                 `💰 Total: S/. ${total}\n` +
                 `🗓 Mensualidad: S/. ${Number(selectedBudget.value.monthlyPayment).toFixed(2)}\n\n` +
                 `(Por favor, envíe el PDF descargado)`;
    } else {
       message = `Hola *${selectedBudget.value.patient.fullName}*, adjunto su presupuesto.\n` +
                 `💰 Total: S/. ${total}`;
    }

    const url = `https://wa.me/51${phone}?text=${encodeURIComponent(message)}`;
    setTimeout(() => window.open(url, '_blank'), 500);
  } finally {
    isDownloading.value = false;
  }
}

/**
 * Imprime usando un iframe limpio para evitar que estilos del modal
 * o del resto de la app afecten la paginación y evitemos páginas duplicadas.
 */
const printWindow = async () => {
  // Buscar páginas visibles a imprimir
  const pages = Array.from(document.querySelectorAll('.a4-page-capture'))
    .filter((el: Element) => (el as HTMLElement).offsetParent !== null) as HTMLElement[];

  if (pages.length === 0) return alert('No hay páginas para imprimir.');

  // Construir HTML limpio
  // Copiar estilos del documento actual (links y estilos) para que el iframe herede diseño
  const parentFontSize = getComputedStyle(document.documentElement).fontSize || '16px';
  const pageCss = `
    @page { size: A4; margin: 10mm; }
    html, body { margin: 0; padding: 0; background: #fff; font-size: ${parentFontSize}; }
    .a4-page { width: 190mm; height: 277mm; /* consider page margins */ box-sizing: border-box; margin: 0 auto; overflow: visible; }
    .a4-page * { box-sizing: border-box; }
  `;

  const headStyles = Array.from(document.head.querySelectorAll('link[rel="stylesheet"], style'))
    .map((n: Element) => n.outerHTML)
    .join('\n');

  const docHtmlStart = `<!doctype html><html><head><meta charset="utf-8"><title>Imprimir</title>${headStyles}<style>${pageCss}</style></head><body>`;
  const docHtmlEnd = `</body></html>`;

  const pagesHtml = pages.map(p => {
    // Clone and remove toolbars, hidden elements
    const clone = p.cloneNode(true) as HTMLElement;
    // Remove any elements with print:hidden class (tailwind)
    clone.querySelectorAll('.print\\:hidden').forEach(n => n.remove());
    return `<div class="a4-page">${clone.innerHTML}</div>`;
  }).join('\n');

  const finalHtml = docHtmlStart + pagesHtml + docHtmlEnd;

  // Crear iframe y escribir documento
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return window.print();
  }

  iframeDoc.open();
  iframeDoc.write(finalHtml);
  iframeDoc.close();

  // Esperar a que el iframe cargue el contenido y luego imprimir
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Error printing iframe:', e);
      window.print();
    } finally {
      setTimeout(() => { document.body.removeChild(iframe); }, 500);
    }
  }, 500);
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex justify-center items-start preview-scroll pt-8 pb-8 backdrop-blur-sm">
    <div class="w-full max-w-[230mm] flex flex-col items-center gap-6 animate-fade-in">
      
      <!-- TOOLBAR FLOTANTE -->
      <div class="bg-white p-3 rounded-full shadow-2xl flex gap-3 sticky top-4 z-50 px-6 items-center border border-gray-200 print:hidden transform transition-all hover:scale-105">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 border-r pr-3">Vista Previa</span>
        
        <button @click="downloadPDF" :disabled="isDownloading" class="btn-tool bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
           {{ isDownloading ? 'Procesando...' : 'Descargar PDF' }}
        </button>
        
        <button @click="sendToWhatsApp" :disabled="isDownloading" class="btn-tool bg-green-500 hover:bg-green-600 text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          WhatsApp
        </button>
        
        <button @click="printWindow" class="btn-tool bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
           Imprimir
        </button>

        <button @click="emit('close')" class="btn-tool text-red-500 hover:text-red-700 font-bold ml-2">✕</button>
      </div>

      <div v-if="isLoading" class="text-white mt-10 text-xl font-light">Cargando presupuesto...</div>

      <!-- CONTENEDOR DE HOJAS A4 -->
      <div v-else-if="selectedBudget" id="print-root" class="flex flex-col gap-8 w-full items-center">
        
        <!-- HOJA 1: FORMATO PACIENTE (A4 Completo) -->
        <!-- 'p-[15mm]' es el margen visual en pantalla, pero al clonar para PDF se ajusta -->
        <div v-if="showPatientFormat" class="a4-page a4-page-capture bg-white shadow-2xl relative flex flex-col justify-between p-[15mm]">
           
           <!-- Header -->
           <header class="flex justify-between items-start pb-6 border-b-2 border-primary mb-8">
              <div class="flex-1 pr-4">
                <h1 class="text-3xl font-extrabold text-slate-800 uppercase tracking-tight">{{ selectedBudget.tenant.name }}</h1>
                <div class="mt-2 space-y-1 text-sm text-gray-500">
                   <p class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> {{ selectedBudget.tenant.address }}</p>
                   <p class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> {{ selectedBudget.tenant.phone }}</p>
                </div>
              </div>
              <div v-if="logoSrc" class="w-32 h-28 flex justify-end items-center">
                <img :src="logoSrc" @load="isLogoLoaded = true" crossorigin="anonymous" class="max-h-full max-w-full object-contain" />
              </div>
           </header>

           <div class="flex-1">
              <!-- Info Paciente -->
              <div class="flex justify-between bg-slate-50 p-6 rounded-lg mb-8 border border-slate-100">
                <div>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Paciente</p>
                  <p class="text-xl font-bold text-slate-800">{{ selectedBudget.patient.fullName }}</p>
                  <p class="text-sm text-slate-600 font-medium">DNI: {{ selectedBudget.patient.dni }}</p>
                  
                  <div v-if="isOrtho" class="mt-3 inline-flex items-center gap-1.5 bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide shadow-sm">
                     <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                     Plan de Ortodoncia
                  </div>
                </div>
                <div class="text-right">
                   <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Presupuesto N°</p>
                   <p class="text-2xl font-mono text-slate-800">{{ selectedBudget.id.substring(0,8).toUpperCase() }}</p>
                   <p class="text-sm text-slate-500 mt-1">{{ formatDate(selectedBudget.creationDate) }}</p>
                </div>
              </div>

              <!-- Tabla -->
              <div class="mb-6">
                <h4 class="font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-4 text-sm uppercase tracking-wide flex justify-between">
                    <span>{{ isOrtho ? 'Detalle de Tratamiento' : 'Descripción de Servicios' }}</span>
                </h4>
                
                <table class="w-full text-sm border-collapse">
                  <thead>
                    <tr class="bg-slate-100 text-slate-600 uppercase text-[11px] tracking-wide">
                      <th class="p-3 text-left rounded-l-md font-bold">Descripción</th>
                      <th class="p-3 text-center w-20 font-bold">Cant.</th>
                      <th class="p-3 text-right w-28 font-bold">Precio Unit.</th>
                      <th class="p-3 text-right w-28 rounded-r-md font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody class="text-slate-700">
                    <tr v-if="isOrtho && Number(selectedBudget.baseTreatmentCost) > 0" class="border-b border-slate-100 hover:bg-slate-50">
                      <td class="p-3 font-medium text-blue-900">Honorarios Profesionales (Tratamiento Base)</td>
                      <td class="p-3 text-center text-slate-400">1</td>
                      <td class="p-3 text-right text-slate-500">S/. {{ Number(selectedBudget.baseTreatmentCost).toFixed(2) }}</td>
                      <td class="p-3 text-right font-bold text-slate-800">S/. {{ Number(selectedBudget.baseTreatmentCost).toFixed(2) }}</td>
                    </tr>
                    <tr v-for="item in selectedBudget.items" :key="item.id" class="border-b border-slate-100 hover:bg-slate-50">
                      <td class="p-3 font-medium">{{ item.treatment?.name }}</td>
                      <td class="p-3 text-center text-slate-500">{{ item.quantity }}</td>
                      <td class="p-3 text-right text-slate-500">S/. {{ Number(item.priceAtTimeOfBudget).toFixed(2) }}</td>
                      <td class="p-3 text-right font-bold text-slate-800">S/. {{ (item.priceAtTimeOfBudget * item.quantity).toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
           </div>

           <!-- Footer Financiero -->
           <div class="border-t-2 border-slate-100 pt-6">
              <div class="flex flex-col items-end">
                 <div class="w-2/3 md:w-1/2 space-y-2 text-right">
                    
                    <div class="flex justify-between text-slate-500 text-sm">
                       <span>Subtotal:</span>
                       <span class="font-medium text-slate-800">S/. {{ Number(selectedBudget.totalAmount).toFixed(2) }}</span>
                    </div>
                    
                    <div v-if="selectedBudget.discountAmount > 0" class="flex justify-between text-red-500 text-sm font-medium">
                       <span>Descuento:</span>
                       <span>- S/. {{ Number(selectedBudget.discountAmount).toFixed(2) }}</span>
                    </div>

                    <!-- Plan de Pagos Ortho -->
                    <div v-if="isOrtho" class="bg-blue-50 border border-blue-100 rounded-lg p-4 my-4 text-sm text-left shadow-sm">
                        <p class="text-[10px] uppercase font-bold text-blue-400 mb-2 tracking-wider">Plan de Financiamiento</p>
                        <div class="flex justify-between mb-2">
                            <span class="text-slate-600">Cuota Inicial:</span>
                            <span class="font-bold text-green-700 text-base">S/. {{ Number(selectedBudget.initialPayment).toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between pt-2 border-t border-blue-200">
                            <span class="text-slate-600">Mensual ({{ selectedBudget.installments }} cuotas):</span>
                            <span class="font-bold text-blue-800 text-base">S/. {{ Number(selectedBudget.monthlyPayment).toFixed(2) }}</span>
                        </div>
                    </div>

                    <div class="flex justify-between items-center bg-slate-800 text-white p-3 rounded-lg mt-4 shadow-md">
                       <span class="text-sm font-medium uppercase tracking-widest">Total a Pagar</span>
                       <span class="text-2xl font-bold">S/. {{ finalTotal.toFixed(2) }}</span>
                    </div>
                 </div>
              </div>
              
              <footer class="mt-10 text-center text-[10px] text-slate-400 border-t pt-4">
                Generado por Sistema <strong>SonriAndes</strong>. Válido por 30 días.
              </footer>
           </div>
        </div>

        <!-- HOJA 2: FICHA INTERNA (DOCTOR) -->
        <div v-if="showDoctorFormat" class="a4-page a4-page-capture bg-white shadow-2xl p-[20mm] relative flex flex-col font-mono text-sm print:break-before-page">
           <div class="border-4 border-black p-8 h-full flex flex-col">
              <h2 class="text-center font-black text-2xl border-b-4 border-black pb-4 mb-8 tracking-[0.2em] uppercase">FICHA TÉCNICA</h2>
              
              <div class="grid grid-cols-2 gap-8 mb-8 text-base">
                 <div>
                    <p class="mb-2"><strong>ID:</strong> <span class="bg-gray-200 px-1">{{ selectedBudget.id.substring(0,8).toUpperCase() }}</span></p>
                    <p class="mb-2"><strong>FECHA:</strong> {{ formatDate(selectedBudget.creationDate) }}</p>
                    <p><strong>DR(A):</strong> {{ selectedBudget.doctor?.fullName || '---' }}</p>
                 </div>
                 <div class="text-right">
                    <p class="mb-2 text-lg"><strong>{{ selectedBudget.patient.fullName }}</strong></p>
                    <p class="mb-2">DNI: {{ selectedBudget.patient.dni }}</p>
                    <p v-if="isOrtho" class="mt-4 font-bold bg-black text-white inline-block px-3 py-1">ORTODONCIA</p>
                 </div>
              </div>

              <div class="flex-1 border-t-2 border-black py-6">
                 <p class="font-bold underline mb-4 uppercase">Detalle de Procedimientos:</p>
                 <ul class="space-y-3 pl-4">
                    <li v-if="isOrtho && Number(selectedBudget.baseTreatmentCost) > 0" class="flex justify-between items-center border-b border-dashed border-gray-400 pb-1">
                       <span>[ ] Honorarios Base Tratamiento</span>
                       <span class="font-bold">{{ selectedBudget.baseTreatmentCost }}</span>
                    </li>
                    <li v-for="item in selectedBudget.items" :key="item.id" class="flex justify-between items-center border-b border-dashed border-gray-400 pb-1">
                       <span>[ ] ({{ item.quantity }}) {{ item.treatment?.name }}</span>
                       <span class="font-bold">{{ (item.priceAtTimeOfBudget * item.quantity).toFixed(2) }}</span>
                    </li>
                 </ul>
              </div>

              <div class="border-t-4 border-black pt-6">
                 <div class="flex justify-between text-xl font-bold mb-4 bg-gray-100 p-2">
                    <span>TOTAL:</span> <span>S/. {{ finalTotal.toFixed(2) }}</span>
                 </div>
                 
                 <div v-if="isOrtho" class="grid grid-cols-2 gap-4 text-center text-xs">
                     <div class="border-2 border-black p-2">
                        <div class="font-bold">INICIAL</div>
                        <div class="text-lg">{{ selectedBudget.initialPayment }}</div>
                     </div>
                     <div class="border-2 border-black p-2">
                        <div class="font-bold">CUOTAS ({{ selectedBudget.installments }})</div>
                        <div class="text-lg">{{ selectedBudget.monthlyPayment }}</div>
                     </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
  .btn-tool {
    @apply px-4 py-2 rounded-full font-bold text-xs shadow hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide;
  }

  .a4-page {
    /* Dimensiones A4 estándar */
    width: 210mm;
    height: 297mm;
    /* Margen en la vista previa para separar hojas */
    margin-bottom: 30px;
    box-sizing: border-box;
    background: white;
    overflow: hidden;
    /* Espacio superior visual en la vista previa */
    padding-top: 8mm;
  }

  /* Evita que el navegador divida una página A4 en múltiples páginas al imprimir */
  .a4-page { page-break-inside: avoid; break-inside: avoid; }

  /* Ocultar scrollbar en la vista previa (solo visual) */
  .preview-scroll {
    overflow-y: auto;
    -ms-overflow-style: none; /* IE 10+ */
    scrollbar-width: none; /* Firefox */
  }
  .preview-scroll::-webkit-scrollbar { display: none; } /* Chrome/Safari */

  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }

  @media print {
    @page { size: A4; margin: 10mm; }

    html, body { background: white !important; margin: 0 !important; padding: 0 !important; }

    /* Ocultar todo lo que no sea el root de impresión */
    body * { visibility: hidden !important; }
    #print-root, #print-root * { visibility: visible !important; }

    /* Centrar el root en la página de impresión */
    #print-root {
      position: relative !important;
      left: auto !important;
      top: auto !important;
      width: 210mm !important;
      margin: 0 auto !important;
      padding: 0 !important;
      box-shadow: none !important;
      border: none !important;
      transform: none !important;
    }

    /* En impresión, eliminamos márgenes y sombras del contenedor A4
       Forzamos tamaño A4 exacto para evitar que el navegador fragmente
       o duplique el mismo contenido en varias páginas. */
    .a4-page {
      margin: 0;
      box-shadow: none;
      width: 210mm;
      height: 297mm;
      box-sizing: border-box;
      /* Espacio superior para impresión */
      padding-top: 8mm;
      overflow: hidden;
      /* Forzar separacion entre paginas cuando hay varias .a4-page */
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    /* Evitar que contenidos queden recortados a la derecha
       y asegurar que cada .a4-page se centre en el papel */
    .a4-page { margin-left: auto; margin-right: auto; }
    .a4-page + .a4-page { page-break-before: always; break-before: page; }
    .a4-page:last-child { page-break-after: auto; }
    
    .print\:hidden { display: none !important; }
    .print\:break-before-page { break-before: page; }
  }
</style>