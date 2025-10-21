<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'; // ref y computed ya estaban, solo los usamos más
import { useDashboardStore } from '@/stores/dashboard';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import IconWhatsapp from '@/components/icons/IconWhatsapp.vue';
import BarChart from '@/components/charts/BarChart.vue';
import HorizontalBarChart from '@/components/charts/HorizontalBarChart.vue';
import DoughnutChart from '@/components/charts/DoughnutChart.vue';

const dashboardStore = useDashboardStore();
const { summary, monthlyRevenueChartData, appointmentStatusChartData, isLoading } = storeToRefs(dashboardStore);

onMounted(() => {
  dashboardStore.fetchSummary();
});

// --- [NUEVO] LÓGICA DE PAGINACIÓN DE AGENDA ---
const todayCurrentPage = ref(1);
const tomorrowCurrentPage = ref(1);
const appointmentPageSize = 5; // Mostrar 5 citas por página

// Paginación para "Agenda del Día"
const todayTotalPages = computed(() => {
  const total = summary.value.todayAppointments?.length || 0;
  return Math.ceil(total / appointmentPageSize);
});

const paginatedTodayAppointments = computed(() => {
  if (!summary.value.todayAppointments) return [];
  const startIndex = (todayCurrentPage.value - 1) * appointmentPageSize;
  const endIndex = startIndex + appointmentPageSize;
  return summary.value.todayAppointments.slice(startIndex, endIndex);
});

function nextPageToday() {
  if (todayCurrentPage.value < todayTotalPages.value) todayCurrentPage.value++;
}
function prevPageToday() {
  if (todayCurrentPage.value > 1) todayCurrentPage.value--;
}

// Paginación para "Agenda de Mañana"
const tomorrowTotalPages = computed(() => {
  const total = summary.value.tomorrowAppointments?.length || 0;
  return Math.ceil(total / appointmentPageSize);
});

const paginatedTomorrowAppointments = computed(() => {
  if (!summary.value.tomorrowAppointments) return [];
  const startIndex = (tomorrowCurrentPage.value - 1) * appointmentPageSize;
  const endIndex = startIndex + appointmentPageSize;
  return summary.value.tomorrowAppointments.slice(startIndex, endIndex);
});

function nextPageTomorrow() {
  if (tomorrowCurrentPage.value < tomorrowTotalPages.value) tomorrowCurrentPage.value++;
}
function prevPageTomorrow() {
  if (tomorrowCurrentPage.value > 1) tomorrowCurrentPage.value--;
}
// --- FIN DE LA LÓGICA DE PAGINACIÓN ---


// --- DATOS PARA LOS GRÁFICOS ---
const monthlyChartData = computed(() => ({
  labels: monthlyRevenueChartData.value.labels,
  datasets: [{
    label: 'Ingresos Mensuales (S/.)',
    backgroundColor: '#2563EB',
    data: monthlyRevenueChartData.value.data,
  }],
}));

const topTreatmentsChartData = computed(() => {
  const labels = summary.value.topTreatments?.map((t: any) => t.name) || [];
  const data = summary.value.topTreatments?.map((t: any) => t.total) || [];
  return {
    labels,
    datasets: [{
      label: 'Ingresos por Tratamiento',
      backgroundColor: ['#2563EB', '#10B981', '#F59E0B', '#0EA5E9', '#8B5CF6'],
      data,
    }]
  }
});

const statusChartData = computed(() => {
  return {
    labels: appointmentStatusChartData.value.labels.map(l => l.charAt(0).toUpperCase() + l.slice(1).replace('_', ' ')),
    datasets: [{
      backgroundColor: [
        '#2563EB', // scheduled
        '#10B981', // confirmed
        '#6B7280', // completed
        '#EF4444', // cancelled
        '#F97316', // no_show
      ],
      data: appointmentStatusChartData.value.data,
    }]
  }
});

// --- FUNCIONES AUXILIARES ---
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
};

const incomeComparison = computed(() => {
  if (summary.value.lastMonthIncome === undefined || summary.value.lastMonthIncome === 0) {
    return { text: 'N/A vs mes pasado', class: 'text-gray-500' };
  }
  const percentageChange = ((summary.value.monthlyIncome - summary.value.lastMonthIncome) / summary.value.lastMonthIncome) * 100;
  if (percentageChange >= 0) {
    return { text: `+${percentageChange.toFixed(0)}% vs mes pasado`, class: 'text-green-500' };
  }
  return { text: `${percentageChange.toFixed(0)}% vs mes pasado`, class: 'text-red-500' };
});

const isToday = (birthDate: string) => {
  const today = new Date();
  const date = new Date(birthDate);
  return today.getDate() === date.getUTCDate() && today.getMonth() === date.getUTCMonth();
};

function sendBirthdayMessage(patient: any) {
  const phone = patient.phone.replace(/[^0-9]/g, '');
  const internationalPhone = `51${phone}`;
  const message = `¡Feliz Cumpleaños, ${patient.fullName}! 🎂 De parte de todo el equipo de tu clínica dental, te deseamos un día excelente.`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${internationalPhone}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}
</script>

<template>
  <div v-if="isLoading" class="text-center py-12">Cargando dashboard...</div>
  <div v-else class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-text-light font-semibold">Ingresos del Mes</h3>
        <p class="text-3xl font-bold text-green-600 mt-2">S/. {{ Number(summary.monthlyIncome || 0).toFixed(2) }}</p>
        <p :class="incomeComparison.class" class="text-sm mt-1 font-semibold">{{ incomeComparison.text }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-text-light font-semibold">Citas para Hoy</h3>
        <p class="text-3xl font-bold text-primary mt-2">{{ summary.todayAppointments?.length || 0 }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-text-light font-semibold">Pacientes Nuevos (Mes)</h3>
        <p class="text-3xl font-bold text-secondary mt-2">{{ summary.newPatientsThisMonth || 0 }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-text-light font-semibold">Total de Pacientes</h3>
        <p class="text-3xl font-bold text-indigo-500 mt-2">{{ summary.patientCount || 0 }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h3 class="text-xl font-bold text-text-dark mb-4">Agenda del Día</h3>
          <div class="flex-1">
            <div v-if="summary.todayAppointments?.length > 0" class="space-y-4">
              <RouterLink v-for="appt in paginatedTodayAppointments" :key="appt.id" :to="{ name: 'patient-detail', params: { id: appt.patient.id } }" class="flex items-center p-3 bg-gray-50 rounded-md hover:bg-primary hover:text-white transition-colors group">
                <div class="font-semibold text-primary w-24 group-hover:text-white">{{ formatTime(appt.startTime) }}</div>
                <div class="flex-1">
                  <p class="font-semibold text-text-dark group-hover:text-white">{{ appt.patient.fullName }}</p>
                </div>
              </RouterLink>
            </div>
            <div v-else class="text-center py-4 text-text-light">No hay citas programadas para hoy.</div>
          </div>
          
          <div v-if="todayTotalPages > 1" class="flex justify-between items-center mt-4 pt-4 border-t">
            <button @click="prevPageToday" :disabled="todayCurrentPage === 1" class="btn-pagination">
              &lt; Ant
            </button>
            <span class="text-sm font-semibold text-text-light">
              {{ todayCurrentPage }} / {{ todayTotalPages }}
            </span>
            <button @click="nextPageToday" :disabled="todayCurrentPage === todayTotalPages" class="btn-pagination">
              Sig &gt;
            </button>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h3 class="text-xl font-bold text-text-dark mb-4">Agenda de Mañana</h3>
          <div class="flex-1">
            <div v-if="summary.tomorrowAppointments?.length > 0" class="space-y-4">
              <RouterLink v-for="appt in paginatedTomorrowAppointments" :key="appt.id" :to="{ name: 'patient-detail', params: { id: appt.patient.id } }" class="flex items-center p-3 bg-gray-50 rounded-md hover:bg-primary hover:text-white transition-colors group">
                <div class="font-semibold text-primary w-24 group-hover:text-white">{{ formatTime(appt.startTime) }}</div>
                <div class="flex-1">
                  <p class="font-semibold text-text-dark group-hover:text-white">{{ appt.patient.fullName }}</p>
                </div>
              </RouterLink>
            </div>
            <div v-else class="text-center py-4 text-text-light">No hay citas programadas para mañana.</div>
          </div>

          <div v-if="tomorrowTotalPages > 1" class="flex justify-between items-center mt-4 pt-4 border-t">
            <button @click="prevPageTomorrow" :disabled="tomorrowCurrentPage === 1" class="btn-pagination">
              &lt; Ant
            </button>
            <span class="text-sm font-semibold text-text-light">
              {{ tomorrowCurrentPage }} / {{ tomorrowTotalPages }}
            </span>
            <button @click="nextPageTomorrow" :disabled="tomorrowCurrentPage === tomorrowTotalPages" class="btn-pagination">
              Sig &gt;
            </button>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-bold text-text-dark mb-4">Próximos Cumpleaños</h3>
        <div v-if="summary.upcomingBirthdays?.length > 0" class="space-y-3">
          <div v-for="p in summary.upcomingBirthdays" :key="p.fullName" :class="['border-b pb-2 last:border-b-0 flex justify-between items-center', { 'bg-yellow-100 p-2 rounded-md': isToday(p.birthDate) }]">
            <div>
              <p class="font-semibold text-text-dark">{{ p.fullName }}</p>
              <p class="text-sm text-text-light">
                <span v-if="isToday(p.birthDate)" class="font-bold text-yellow-600">¡Hoy!</span>
                {{ new Date(p.birthDate).toLocaleDateString('es-PE', { month: 'long', day: 'numeric', timeZone: 'UTC' }) }}
              </p>
            </div>
            <button @click="sendBirthdayMessage(p)" class="p-2 rounded-full text-green-500 hover:bg-green-100" title="Enviar saludo por WhatsApp">
              <IconWhatsapp class="h-6 w-6" />
            </button>
          </div>
        </div>
        <div v-else class="text-center py-4 text-text-light">No hay cumpleaños próximos.</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-bold text-text-dark mb-4">Evolución de Ingresos</h3>
        <div class="h-80">
          <BarChart :chart-data="monthlyChartData" />
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-bold text-text-dark mb-4">Top 5 Tratamientos (Mes)</h3>
        <div class="h-80">
          <HorizontalBarChart :chart-data="topTreatmentsChartData" />
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-bold text-text-dark mb-4">Estado de Citas (Mes)</h3>
        <div class="h-80">
          <DoughnutChart :chart-data="statusChartData" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-pagination {
  @apply px-3 py-1 text-sm font-semibold text-primary bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}
</style>