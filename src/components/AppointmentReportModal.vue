<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useUsersStore } from '@/stores/users';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import apiClient from '@/services/api';

const props = defineProps<{}>();
const emit = defineEmits(['close']);

const authStore = useAuthStore();
const usersStore = useUsersStore();
const { doctors } = storeToRefs(usersStore);

// --- UTILIDAD PARA FECHA LOCAL YYYY-MM-DD ---
const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- FILTROS ---
const todayStr = getLocalDateString();
const startDate = ref(todayStr);
const endDate = ref(todayStr);
const selectedDoctorId = ref('all');
const selectedStatus = ref('all');

const isLoading = ref(false);
const isGenerating = ref(false);
const reportData = ref<any[]>([]);

const statusOptions = [
  { value: 'all', label: 'Todos los Estados' },
  { value: 'scheduled', label: 'Agendado (Pendiente)' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'completed', label: 'Completado (Atendido)' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'no_show', label: 'No Asistió' },
];

// --- FUNCIONES DE FILTRO RÁPIDO ---
const setQuickFilter = (type: 'today' | 'tomorrow') => {
  const d = new Date();
  if (type === 'tomorrow') {
    d.setDate(d.getDate() + 1);
  }
  const dateStr = getLocalDateString(d);
  startDate.value = dateStr;
  endDate.value = dateStr;
  fetchReport(); // Generar automáticamente al hacer clic
};

const fetchReport = async () => {
  isLoading.value = true;
  try {
    const response = await apiClient.get('/appointments', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
      }
    });

    let data = response.data || [];

    // --- FILTRO MANUAL DE FECHAS (CLIENT-SIDE) ---
    if (startDate.value && endDate.value) {
        data = data.filter((a: any) => {
            // Convertir fecha de la cita a local YYYY-MM-DD
            const appDate = new Date(a.startTime);
            const appDateStr = getLocalDateString(appDate);
            return appDateStr >= startDate.value && appDateStr <= endDate.value;
        });
    }

    // Filtrar por Doctor
    if (selectedDoctorId.value !== 'all') {
      data = data.filter((a: any) => a.doctor?.id === selectedDoctorId.value);
    }

    // Filtrar por Estado
    if (selectedStatus.value !== 'all') {
      data = data.filter((a: any) => a.status === selectedStatus.value);
    }

    // Ordenar por fecha
    data.sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    reportData.value = data;
  } catch (error) {
    console.error(error);
    alert('Error al generar el reporte.');
  } finally {
    isLoading.value = false;
  }
};

const totalAppointments = computed(() => reportData.value.length);

// --- CORRECCIÓN DE FECHA EN REPORTE ---
// Usamos timeZone: 'UTC' para que al formatear "2025-12-28" no le reste horas y muestre el día anterior.
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-PE', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Para la hora sí usamos la zona local
const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

// Para la fecha de la tabla (que viene completa con hora), usamos local
const formatDateTable = (dateString: string) => new Date(dateString).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });


const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    completed: 'Completado',
    cancelled: 'Cancelado',
    no_show: 'No Asistió'
  };
  return map[status] || status;
};

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    scheduled: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-orange-100 text-orange-800'
  };
  return map[status] || 'bg-gray-100';
};

async function downloadPDF() {
  if (reportData.value.length === 0) return;
  isGenerating.value = true;
  await nextTick();
  
  const element = document.getElementById('report-content');
  if (!element) return;

  try {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '210mm';
    clone.style.padding = '10mm';
    clone.style.height = 'auto';
    clone.style.overflow = 'visible';
    clone.style.position = 'fixed';
    clone.style.top = '-10000px';
    clone.style.backgroundColor = 'white';
    document.body.appendChild(clone);

    const canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    if (imgHeight > 297) {
        let heightLeft = imgHeight;
        let position = 0;
        const pageHeight = 295;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pageHeight;
        }
    } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
    }

    pdf.save(`Reporte_Citas_${startDate.value}.pdf`);
    document.body.removeChild(clone);
  } catch (e) {
    console.error(e);
  } finally {
    isGenerating.value = false;
  }
}

const printReport = () => {
    const printContent = document.getElementById('report-content')?.innerHTML;
    
    if (!printContent) return;

    const win = window.open('', '', 'height=700,width=900');
    if(win) {
        win.document.write('<html><head><title>Reporte de Citas</title>');
        win.document.write('<script src="https://cdn.tailwindcss.com"><\/script>'); 
        win.document.write('</head><body class="p-8 bg-white">');
        win.document.write(printContent);
        win.document.write('</body></html>');
        win.document.close();
        
        setTimeout(() => {
            win.print();
        }, 1000);
    }
}

onMounted(() => {
  usersStore.fetchDoctors();
  fetchReport();
});
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex justify-center items-start overflow-y-auto pt-10 pb-10">
    <div class="bg-white w-full max-w-4xl rounded-lg shadow-xl flex flex-col max-h-[90vh]">
      
      <!-- HEADER -->
      <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
        <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Reporte de Citas
        </h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- FILTROS -->
      <div class="p-6 bg-white border-b space-y-4">
        
        <!-- Botones Rápidos -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wide mr-1">Rápido:</span>
          <button @click="setQuickFilter('today')" class="px-3 py-1 rounded-full text-xs font-medium border border-gray-200 hover:border-primary hover:text-primary transition-colors" :class="startDate === todayStr && endDate === todayStr ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600'">
            Hoy
          </button>
          <button @click="setQuickFilter('tomorrow')" class="px-3 py-1 rounded-full text-xs font-medium border border-gray-200 hover:border-primary hover:text-primary transition-colors">
            Mañana
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Desde</label>
            <input type="date" v-model="startDate" class="w-full border rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Hasta</label>
            <input type="date" v-model="endDate" class="w-full border rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Doctor</label>
            <select v-model="selectedDoctorId" class="w-full border rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary">
              <option value="all">Todos los Doctores</option>
              <option v-for="doc in doctors" :key="doc.id" :value="doc.id">{{ doc.fullName }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
            <select v-model="selectedStatus" class="w-full border rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary">
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="md:col-span-4 flex justify-end gap-2 mt-2">
              <button @click="fetchReport" class="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 text-sm font-bold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  Generar / Actualizar
              </button>
          </div>
        </div>
      </div>

      <!-- PREVISUALIZACIÓN -->
      <div class="flex-1 overflow-y-auto bg-gray-100 p-6">
        <div v-if="isLoading" class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="reportData.length === 0" class="text-center py-10 text-gray-500">
            No se encontraron citas con los filtros seleccionados.
        </div>

        <div v-else id="report-content" class="bg-white shadow-sm p-8 min-h-[20cm]">
            <!-- Encabezado del Documento -->
            <div class="flex justify-between items-center border-b-2 border-gray-800 pb-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-blue-600 uppercase">{{ authStore.user?.tenant?.name || 'REPORTE DE AGENDA' }}</h1>
                    <p class="text-sm text-gray-600">Reporte de Citas</p>
                </div>
                <div class="text-right text-xs text-gray-500">
                    <p>Generado el: {{ new Date().toLocaleDateString() }}</p>
                    <p>Por: {{ authStore.user?.fullName }}</p>
                </div>
            </div>

            <!-- Resumen de Filtros -->
            <div class="bg-gray-50 p-4 rounded border mb-6 text-sm">
                <div class="grid grid-cols-2 gap-2">
                    <p><strong>Periodo:</strong> {{ formatDate(startDate) }} - {{ formatDate(endDate) }}</p>
                    <p><strong>Total Registros:</strong> {{ totalAppointments }}</p>
                    <p><strong>Filtro Doctor:</strong> {{ selectedDoctorId === 'all' ? 'Todos' : doctors.find(d => d.id === selectedDoctorId)?.fullName }}</p>
                    <p><strong>Filtro Estado:</strong> {{ statusOptions.find(o => o.value === selectedStatus)?.label }}</p>
                </div>
            </div>

            <!-- Tabla de Datos -->
            <table class="w-full text-sm text-left border-collapse">
                <thead>
                    <tr class="bg-gray-100 border-b-2 border-gray-300 font-bold text-gray-700 uppercase text-xs">
                        <th class="p-2 border">Fecha</th>
                        <th class="p-2 border">Hora</th>
                        <th class="p-2 border">Paciente</th>
                        <th class="p-2 border">Doctor</th>
                        <th class="p-2 border">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in reportData" :key="item.id" class="border-b border-gray-200 hover:bg-gray-50">
                        <td class="p-2 border text-gray-600">{{ formatDateTable(item.startTime) }}</td>
                        <td class="p-2 border font-mono">{{ formatTime(item.startTime) }}</td>
                        <td class="p-2 border font-medium">{{ item.patient?.fullName }}</td>
                        <td class="p-2 border">{{ item.doctor?.fullName }}</td>
                        <td class="p-2 border">
                            <span :class="['px-2 py-0.5 rounded text-[10px] font-bold uppercase', getStatusColor(item.status)]">
                                {{ translateStatus(item.status) }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

      <!-- FOOTER ACCIONES -->
      <div class="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button @click="printReport" class="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Imprimir
          </button>
          <button @click="downloadPDF" :disabled="isGenerating || reportData.length === 0" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {{ isGenerating ? 'Generando...' : 'Descargar PDF' }}
          </button>
      </div>

    </div>
  </div>
</template>