<script setup lang="ts">
import { onMounted, ref, computed, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useBudgetsStore } from '@/stores/budgets';
import { useOdontogramStore } from '@/stores/odontogram'; 
import { usePatientsStore } from '@/stores/patients'; 
import { useClinicalHistoryStore } from '@/stores/clinicalHistory'; 
import { storeToRefs } from 'pinia';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Odontogram from '@/components/Odontogram.vue';

const props = defineProps<{ 
  budgetId: string;
  formats: string[]; // ['patient', 'doctor']
  extras: { odontogram: boolean; evolution: boolean };
}>();

const emit = defineEmits(['close']);

const route = useRoute();
const budgetsStore = useBudgetsStore();
const odontogramStore = useOdontogramStore();
const patientsStore = usePatientsStore();
const clinicalHistoryStore = useClinicalHistoryStore();

const { selectedBudget, isLoading } = storeToRefs(budgetsStore);
// Traemos también el estado de carga específico del odontograma
const { wholeTeeth, surfaces, isLoading: isOdontoLoading } = storeToRefs(odontogramStore);
const { entries: historyEntries } = storeToRefs(clinicalHistoryStore);
const { selectedPatient } = storeToRefs(patientsStore);

const isLogoLoaded = ref(false);
const areFormatsRendered = ref(false);
const isDownloading = ref(false);

const currentId = computed(() => props.budgetId || route.params.id as string);

// --- ESTADOS DE ANEXOS ---
const attachOdontogram = computed(() => props.extras?.odontogram);
const attachEvolution = computed(() => props.extras?.evolution);

const showPatientFormat = computed(() => props.formats.includes('patient'));
const showDoctorFormat = computed(() => props.formats.includes('doctor'));

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

const finalTotal = computed(() => {
  if (!selectedBudget.value) return 0;
  return Number(selectedBudget.value.totalAmount) - Number(selectedBudget.value.discountAmount || 0);
});

const isOrtho = computed(() => {
    const b = selectedBudget.value;
    if (!b) return false;
    return !!b.isOrthodontic || !!b.orthoType || (Number(b.installments) > 0);
});

const patientAge = computed(() => {
    // Prioridad: Paciente del store > Paciente del presupuesto
    const pStore = selectedPatient.value;
    const pBudget = selectedBudget.value?.patient;
    
    // Si tenemos fecha de nacimiento, calculamos edad
    const birthDateStr = pStore?.birthDate || pBudget?.birthDate;
    
    if (birthDateStr) {
        const birth = new Date(birthDateStr);
        const diff = Date.now() - birth.getTime();
        const ageDt = new Date(diff);
        return Math.abs(ageDt.getUTCFullYear() - 1970);
    }
    return 0; // Default a 0 si no hay fecha
});

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
};

// --- CARGA DE DATOS ---
onMounted(async () => {
  if (currentId.value) {
    await budgetsStore.fetchBudgetForPrint(currentId.value);
    
    if (selectedBudget.value?.patient?.id) {
        const pId = selectedBudget.value.patient.id;
        const promises = [];
        
        if (attachOdontogram.value) {
           promises.push(odontogramStore.fetchOdontogram(pId));
           // Importante: Cargar paciente si no está en el store para tener la edad correcta
           if (!selectedPatient.value) {
              promises.push(patientsStore.fetchPatientById(pId));
           }
        }
        if (attachEvolution.value) {
           promises.push(clinicalHistoryStore.fetchHistory(pId));
        }

        if (promises.length > 0) {
            await Promise.all(promises);
        }
    }

    await nextTick();
    areFormatsRendered.value = true;
    if (!selectedBudget.value?.tenant?.logoUrl) isLogoLoaded.value = true;
  }
});

function closeWindow() {
  emit('close');
}

// --- HELPER PDF ---
async function getPDFObject() {
  await nextTick();
  const pages = Array.from(document.querySelectorAll('.a4-page-capture')) as HTMLElement[];
  if (pages.length === 0) throw new Error('No hay páginas para generar.');

  if (logoSrc.value && !isLogoLoaded.value) {
      await new Promise(resolve => setTimeout(resolve, 800));
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = 210;

  for (let i = 0; i < pages.length; i++) {
    const pageElement = pages[i];
    if (i > 0) pdf.addPage();

    const clone = pageElement.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.top = '-10000px';
    clone.style.left = '-10000px';
    clone.style.width = '210mm';
    clone.style.height = '297mm'; 
    clone.style.margin = '0';
    clone.style.padding = '15mm'; 
    clone.style.transform = 'scale(1)'; 
    clone.style.zIndex = '-1';
    clone.classList.remove('shadow-2xl', 'mb-8', 'hidden'); 
    clone.style.display = 'flex'; 
    clone.style.flexDirection = 'column';

    const odontoContainer = clone.querySelector('.odontogram-scale-container') as HTMLElement;
    if (odontoContainer) {
        odontoContainer.style.transform = 'scale(0.85)';
        odontoContainer.style.transformOrigin = 'top center';
        odontoContainer.style.width = '100%';
        odontoContainer.style.display = 'block';
    }

    document.body.appendChild(clone);

    try {
        const canvas = await html2canvas(clone, { 
            scale: 2, 
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794, 
            height: 1123,
            windowWidth: 1000 
        });

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, 297);
    } finally {
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
    alert('Error al generar PDF.');
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
    let message = `Hola *${selectedBudget.value.patient.fullName}*, adjunto su presupuesto.\n💰 Total: S/. ${total}`;
    
    if (attachOdontogram.value || attachEvolution.value) {
        message += `\n(Incluye anexos clínicos)`;
    }

    const url = `https://wa.me/51${phone}?text=${encodeURIComponent(message)}`;
    setTimeout(() => window.open(url, '_blank'), 500);
  } finally {
    isDownloading.value = false;
  }
}

const printWindow = () => {
  const pages = Array.from(document.querySelectorAll('.a4-page-capture'))
    .filter((el: Element) => (el as HTMLElement).offsetParent !== null) as HTMLElement[];

  if (pages.length === 0) return alert('No hay páginas para imprimir.');

  const styles = Array.from(document.styleSheets)
      .map(sheet => {
          try {
              return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
          } catch (e) { return ''; }
      }).join('\n');
  
  const parentFontSize = getComputedStyle(document.documentElement).fontSize || '16px';

  const pagesHtml = pages.map(p => {
    const clone = p.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.print\\:hidden').forEach(n => n.remove());
    const odonto = clone.querySelector('.odontogram-scale-container') as HTMLElement;
    if(odonto) {
        odonto.style.transform = 'scale(0.85)';
        odonto.style.transformOrigin = 'top center';
    }
    return `<div class="a4-page">${clone.innerHTML}</div>`;
  }).join('\n');

  const docHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Imprimir</title>
          <style>
              ${styles}
              @page { size: A4; margin: 0; }
              html, body { margin: 0; padding: 0; background: white; font-size: ${parentFontSize}; font-family: sans-serif; }
              .a4-page { width: 210mm; height: 297mm; box-sizing: border-box; margin: 0 auto; page-break-after: always; padding: 15mm; overflow: hidden; }
              .a4-page:last-child { page-break-after: auto; }
              button, .no-print { display: none !important; }
          </style>
      </head>
      <body>${pagesHtml}</body>
      </html>
  `;

  const iframe = document.createElement('iframe');
  Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return window.print();
  }

  iframeDoc.open();
  iframeDoc.write(docHtml);
  iframeDoc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 800);
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex justify-center items-start overflow-y-auto pt-10 pb-10 print-modal-wrapper">
    <div class="w-full max-w-[230mm] flex flex-col items-center gap-6 animate-fade-in print-container">
      
      <!-- TOOLBAR FLOTANTE -->
      <div class="bg-white p-3 rounded-lg shadow-2xl flex flex-col md:flex-row gap-4 sticky top-4 z-50 px-6 items-center border border-gray-200 print:hidden w-full max-w-4xl justify-between">
        <div class="flex items-center gap-4 border-r pr-4 mr-2">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Anexar:</span>
            <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-primary select-none">
                <input type="checkbox" v-model="attachOdontogram" disabled class="rounded text-primary focus:ring-primary h-4 w-4 bg-gray-100 cursor-not-allowed checked:bg-blue-500 opacity-60">
                Odontograma
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-primary select-none">
                <input type="checkbox" v-model="attachEvolution" disabled class="rounded text-primary focus:ring-primary h-4 w-4 bg-gray-100 cursor-not-allowed checked:bg-blue-500 opacity-60">
                Evoluciones
            </label>
        </div>
        <div class="flex gap-2 flex-wrap justify-center">
            <button @click="downloadPDF" :disabled="isDownloading" class="btn-tool bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               {{ isDownloading ? '...' : 'Descargar PDF' }}
            </button>
            <button @click="sendToWhatsApp" :disabled="isDownloading" class="btn-tool bg-green-500 hover:bg-green-600 text-white flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </button>
            
            <button @click="printWindow" class="btn-tool bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
               Imprimir
            </button>

            <button @click="emit('close')" class="btn-tool text-red-500 hover:text-red-700 font-bold ml-2">✕</button>
        </div>
      </div>

      <div v-if="isLoading" class="text-white mt-10 text-xl font-light">Cargando presupuesto...</div>

      <!-- CONTENEDOR DE HOJAS VISIBLES -->
      <div v-else-if="selectedBudget" id="print-root" class="flex flex-col gap-8 w-full items-center print:block print:w-full">
        
        <!-- HOJA 1: FORMATO PACIENTE -->
        <div v-if="showPatientFormat" class="a4-page a4-page-capture bg-white shadow-lg p-[15mm] relative flex flex-col justify-between print:shadow-none print:mb-0 print:break-after-page">
           <!-- Header -->
           <header class="flex justify-between items-start pb-6 border-b-2 border-primary mb-6">
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
              <!-- Info -->
              <div class="flex justify-between bg-gray-50 p-5 rounded-lg mb-8 border border-gray-100">
                <div>
                  <p class="text-xs font-bold text-gray-400 uppercase">Paciente</p>
                  <p class="text-xl font-bold text-gray-800">{{ selectedBudget.patient.fullName }}</p>
                  <p class="text-sm text-gray-600">DNI: {{ selectedBudget.patient.dni }}</p>
                  <div v-if="isOrtho" class="mt-2 inline-block bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-bold border border-blue-200 uppercase tracking-wide">
                     PLAN DE ORTODONCIA
                  </div>
                </div>
                <div class="text-right">
                   <p class="text-xs font-bold text-gray-400 uppercase">Presupuesto N°</p>
                   <p class="text-xl font-mono text-gray-800">#{{ selectedBudget.id.substring(0,8).toUpperCase() }}</p>
                   <p class="text-sm text-gray-500 mt-1">{{ formatDate(selectedBudget.creationDate) }}</p>
                </div>
              </div>
              <!-- Tabla -->
              <div class="mb-6">
                <table class="w-full text-sm border-collapse">
                  <thead>
                    <tr class="bg-gray-50 text-gray-600 uppercase text-[11px] tracking-wide">
                      <th class="p-3 text-left rounded-l-md font-bold">Descripción</th>
                      <th class="p-3 text-center w-20 font-bold">Cant.</th>
                      <th class="p-3 text-right w-28 font-bold">Precio Unit.</th>
                      <th class="p-3 text-right w-28 rounded-r-md font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody class="text-gray-700">
                    <tr v-if="isOrtho && Number(selectedBudget.baseTreatmentCost) > 0" class="border-b border-gray-100">
                      <td class="p-3 font-medium text-blue-900">Honorarios Profesionales (Base)</td>
                      <td class="p-3 text-center text-slate-400">1</td>
                      <td class="p-3 text-right text-slate-500">S/. {{ Number(selectedBudget.baseTreatmentCost).toFixed(2) }}</td>
                      <td class="p-3 text-right font-bold text-slate-800">S/. {{ Number(selectedBudget.baseTreatmentCost).toFixed(2) }}</td>
                    </tr>
                    <tr v-for="item in selectedBudget.items" :key="item.id" class="border-b border-gray-100">
                      <td class="p-3 font-medium">{{ item.treatment?.name }}</td>
                      <td class="p-3 text-center text-slate-500">{{ item.quantity }}</td>
                      <td class="p-3 text-right text-slate-500">S/. {{ Number(item.priceAtTimeOfBudget).toFixed(2) }}</td>
                      <td class="p-3 text-right font-bold text-slate-800">S/. {{ (item.priceAtTimeOfBudget * item.quantity).toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
           </div>
           <!-- Footer -->
           <div class="border-t-2 border-slate-100 pt-6 flex justify-end">
              <div class="w-1/2 text-right space-y-2">
                 <div class="flex justify-between text-slate-500 text-sm">
                    <span>Subtotal:</span> <span>S/. {{ Number(selectedBudget.totalAmount).toFixed(2) }}</span>
                 </div>
                 <div v-if="selectedBudget.discountAmount > 0" class="flex justify-between text-red-500 text-sm font-medium">
                    <span>Descuento:</span> <span>- S/. {{ Number(selectedBudget.discountAmount).toFixed(2) }}</span>
                 </div>
                 <div v-if="isOrtho" class="bg-blue-50 border border-blue-100 rounded-lg p-4 my-4 text-sm text-left shadow-sm">
                     <div class="flex justify-between mb-2">
                         <span class="text-slate-600">Cuota Inicial:</span>
                         <span class="font-bold text-green-700 text-base">S/. {{ Number(selectedBudget.initialPayment).toFixed(2) }}</span>
                     </div>
                     <div class="flex justify-between pt-2 border-t border-blue-200">
                         <span class="text-slate-600">Mensual ({{ selectedBudget.installments }} cuotas):</span>
                         <span class="font-bold text-blue-800 text-base">S/. {{ Number(selectedBudget.monthlyPayment).toFixed(2) }}</span>
                     </div>
                 </div>
                 <div class="flex justify-between font-extrabold text-2xl text-primary border-t-2 border-primary pt-2 mt-2">
                    <span>TOTAL:</span> <span>S/. {{ finalTotal.toFixed(2) }}</span>
                 </div>
              </div>
           </div>
           <footer class="mt-8 text-center text-[10px] text-gray-400 border-t pt-2">
             Validez: 30 días. Generado por SonriAndes.
           </footer>
        </div>

        <!-- 2. HOJA DOCTOR -->
        <div v-if="showDoctorFormat" class="a4-page a4-page-capture bg-white shadow-lg p-[20mm] relative flex flex-col font-mono text-sm print:break-before-page">
           <div class="border-4 border-black p-8 h-full flex flex-col">
              <h2 class="text-center font-black text-2xl border-b-4 border-black pb-4 mb-6 tracking-[0.2em] uppercase">FICHA TÉCNICA</h2>
              <div class="grid grid-cols-2 gap-8 mb-8 text-base">
                 <div>
                    <p class="mb-2"><strong>ID:</strong> <span class="bg-gray-200 px-1">{{ selectedBudget.id.substring(0,8).toUpperCase() }}</span></p>
                    <p class="mb-2"><strong>FECHA:</strong> {{ formatDate(selectedBudget.creationDate) }}</p>
                 </div>
                 <div class="text-right">
                    <p class="mb-2 text-lg"><strong>{{ selectedBudget.patient.fullName }}</strong></p>
                    <p class="mb-2">DNI: {{ selectedBudget.patient.dni }}</p>
                 </div>
              </div>
              <div class="flex-1 border-t-2 border-black py-6">
                 <ul class="space-y-3 pl-4 list-disc">
                    <li v-if="isOrtho && Number(selectedBudget.baseTreatmentCost) > 0">
                       [BASE] Honorarios - {{ selectedBudget.baseTreatmentCost }}
                    </li>
                    <li v-for="item in selectedBudget.items" :key="item.id">
                       [{{ item.quantity }}] {{ item.treatment?.name }}
                    </li>
                 </ul>
              </div>
              <div class="border-t-4 border-black pt-6 font-bold text-lg flex justify-between">
                 <span>TOTAL:</span> <span>S/. {{ finalTotal.toFixed(2) }}</span>
              </div>
           </div>
        </div>

        <!-- 3. ANEXO ODONTOGRAMA (Visible solo si se marca) -->
        <!-- FIX: Usamos un v-else para mostrar el gráfico o el mensaje de carga dependiendo del estado real de carga del store -->
        <div v-if="attachOdontogram" id="annex-odontogram" class="a4-page a4-page-capture bg-white shadow-lg p-[15mm] relative flex flex-col items-center justify-center print:break-before-page">
            <h2 class="text-2xl font-bold mb-6 uppercase border-b-2 border-black pb-2 w-full text-center">Anexo: Odontograma Actual</h2>
            <p class="mb-8 text-lg font-bold text-slate-800">{{ selectedBudget.patient.fullName }}</p>
            
            <div class="odontogram-scale-container" style="width: 100%;">
                <div v-if="isOdontoLoading" class="text-center text-gray-400 italic py-10">Cargando gráfico dental...</div>
                <Odontogram 
                    v-else
                    :whole-teeth="wholeTeeth || {}" 
                    :surfaces="surfaces || {}" 
                    :patient-age="Number(patientAge)" 
                    user-role="viewer" 
                />
            </div>
            
            <div class="mt-auto text-xs text-gray-500 w-full text-center border-t pt-4">
                Generado el {{ new Date().toLocaleDateString() }}
            </div>
        </div>

        <!-- 4. ANEXO EVOLUCIONES (Visible solo si se marca) -->
        <div v-if="attachEvolution" id="annex-evolution" class="a4-page a4-page-capture bg-white shadow-lg p-[15mm] relative flex flex-col print:break-before-page">
             <h2 class="text-2xl font-bold mb-8 uppercase border-b-2 border-black pb-2 text-center">Anexo: Evolución Clínica</h2>
             <table class="w-full text-sm border-collapse">
                 <thead>
                     <tr class="bg-gray-100 border-b-2 border-black font-bold text-gray-800 uppercase text-xs">
                         <th class="p-3 text-left w-32 border-r border-gray-300">Fecha</th>
                         <th class="p-3 text-left">Descripción / Tratamiento</th>
                     </tr>
                 </thead>
                 <tbody>
                     <tr v-for="entry in historyEntries" :key="entry.id" class="border-b border-gray-200">
                         <td class="p-3 align-top font-mono text-xs border-r border-gray-200 font-bold text-gray-600">
                             {{ formatDate(entry.entryDate) }}
                         </td>
                         <td class="p-3 align-top">
                             <div class="font-bold text-gray-800">{{ entry.description }}</div>
                             <div class="text-xs text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed">{{ entry.evolution }}</div>
                             <div v-if="entry.treatmentPerformed" class="mt-2 text-xs text-blue-600 font-medium">
                                 Tx: {{ entry.treatmentPerformed }}
                             </div>
                         </td>
                     </tr>
                     <tr v-if="historyEntries.length === 0">
                         <td colspan="2" class="p-12 text-center text-gray-400 italic">No hay registros de evolución disponibles para este paciente.</td>
                     </tr>
                 </tbody>
             </table>
             <div class="mt-auto text-xs text-gray-400 w-full text-center border-t pt-4">
                Generado el {{ new Date().toLocaleDateString() }}
            </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-tool { @apply px-4 py-2 rounded-full font-bold text-xs shadow hover:scale-105 transition-transform disabled:opacity-50 uppercase tracking-wide; }

.a4-page {
  /* Dimensiones A4 estándar */
  width: 210mm;
  min-height: 297mm;
  box-sizing: border-box;
  margin-bottom: 20px;
  background-color: white;
}

/* IMPORTANTE: Los anexos deben ser hojas fijas para captura */
#annex-odontogram, #annex-evolution {
    width: 210mm !important;
    min-height: 297mm !important;
    background-color: white !important;
    overflow: hidden;
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }

@media print {
  body { background: white; margin: 0; }
  body * { visibility: hidden; }
  #print-root, #print-root * { visibility: visible; }
  #print-root { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
  .a4-page { margin: 0; box-shadow: none; page-break-after: always; width: 100%; min-height: 100vh; }
  .a4-page:last-child { page-break-after: auto; }
  .print\:hidden { display: none !important; }
  .print\:break-before-page { break-before: page; }
}
</style>