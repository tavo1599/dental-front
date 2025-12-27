<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuthStore } from '@/stores/auth';
import { useAppointmentsStore } from '@/stores/appointments';
import { storeToRefs } from 'pinia';
import type { CalendarOptions } from '@fullcalendar/core';
import Modal from '@/components/Modal.vue';
import AppointmentForm from '@/components/AppointmentForm.vue';
import AppointmentDetailModal from '@/components/AppointmentDetailModal.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
// --- IMPORTACIÓN NUEVA ---
import AppointmentReportModal from '@/components/AppointmentReportModal.vue'; 
// -------------------------
import type { Appointment, User } from '@/types';
import { AppointmentStatus } from '@/types';
import { translateAppointmentStatus } from '@/utils/formatters';
import { getDoctors } from '@/services/userService';

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null);
const appointmentsStore = useAppointmentsStore();
const { appointments, isLoading, selectedStatus } = storeToRefs(appointmentsStore);
const authStore = useAuthStore();

const doctors = ref<User[]>([]);
const selectedDoctorId = ref<string>('all');
const isFormModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const isDropConfirmModalOpen = ref(false);
const isResizeConfirmModalOpen = ref(false);
// --- ESTADO NUEVO ---
const isReportModalOpen = ref(false); 
// --------------------
const selectedDateInfo = ref<any>(null);
const selectedAppointment = ref<Appointment | null>(null);
const dropEventInfo = ref<any>(null);
const resizeEventInfo = ref<any>(null);
const searchQuery = ref<string>('');

const filteredAppointments = computed(() => {
  if (selectedDoctorId.value === 'all') return appointments.value;
  return appointments.value.filter(appt => appt.doctor.id === selectedDoctorId.value);
});

// Lógica de colores por estado de la cita
const getStatusStyle = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.CONFIRMED:
      return { color: '#10B981', className: '' };
    case AppointmentStatus.COMPLETED:
      return { color: '#6B7280', className: 'event-completed' };
    case AppointmentStatus.CANCELLED:
    case AppointmentStatus.NO_SHOW:
      return { color: '#EF4444', className: 'event-cancelled' };
    default:
      return { color: '#2563EB', className: '' };
  }
};

const calendarEvents = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  return filteredAppointments.value.map(appt => {
    const style = getStatusStyle(appt.status);
    let eventClassName = style.className ? [style.className] : [];
    
    // Lógica de búsqueda visual (atenuar si no coincide)
    if (query) {
      const patientName = appt.patient.fullName.toLowerCase();
      if (!patientName.includes(query)) {
        eventClassName.push('event-faded');
      }
    }
    
    const startDate = new Date(appt.startTime);
    const endDate = new Date(appt.endTime);

    const toLocalISOString = (date: Date) => {
      const pad = (num: number) => num.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
             `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    return {
      id: appt.id,
      title: appt.patient.fullName,
      start: toLocalISOString(startDate),
      end: toLocalISOString(endDate),
      backgroundColor: style.color,
      borderColor: style.color,
      className: eventClassName.join(' '),
      extendedProps: { 
        notes: appt.notes, 
        doctor: appt.doctor.fullName 
      }
    }
  });
});

watch(calendarEvents, (newEvents) => {
  const calendarApi = calendarRef.value?.getApi();
  if (calendarApi) {
    calendarApi.removeAllEvents();
    calendarApi.addEventSource(newEvents);
  }
});

// --- MANEJADORES DE EVENTOS ---

function handleTimeSelect(selectInfo: any) {
  const compatibleData = { date: selectInfo.start, dateStr: selectInfo.startStr };
  selectedDateInfo.value = compatibleData;
  isFormModalOpen.value = true;
}

function handleEventClick(clickInfo: any) {
  const appt = appointments.value.find(a => a.id === clickInfo.event.id);
  if (appt) {
    selectedAppointment.value = appt;
    isDetailModalOpen.value = true;
  }
}

function handleEventDrop(dropInfo: any) {
  dropEventInfo.value = dropInfo;
  isDropConfirmModalOpen.value = true;
}

function handleEventResize(resizeInfo: any) {
  resizeEventInfo.value = resizeInfo;
  isResizeConfirmModalOpen.value = true;
}

async function handleSaveAppointment(data: any) {
  const success = await appointmentsStore.createAppointment(data);
  if (success) {
    isFormModalOpen.value = false;
  }
}

function confirmReschedule() {
  if (dropEventInfo.value) {
    const { event } = dropEventInfo.value;
    const payload = { startTime: event.startStr, endTime: event.endStr || undefined };
    appointmentsStore.updateAppointmentTime(event.id, payload);
  }
  isDropConfirmModalOpen.value = false;
}

function cancelReschedule() {
  if (dropEventInfo.value) {
    dropEventInfo.value.revert();
  }
  isDropConfirmModalOpen.value = false;
}

function confirmResize() {
  if (resizeEventInfo.value) {
    const { event } = resizeEventInfo.value;
    const payload = { startTime: event.startStr, endTime: event.endStr };
    appointmentsStore.updateAppointmentTime(event.id, payload);
  }
  isResizeConfirmModalOpen.value = false;
}

function cancelResize() {
  if (resizeEventInfo.value) resizeEventInfo.value.revert();
  isResizeConfirmModalOpen.value = false;
}

function handleStatusFilterChange(event: Event) {
  const newStatus = (event.target as HTMLSelectElement).value as AppointmentStatus | 'all';
  appointmentsStore.filterByStatus(newStatus);
}

// --- CONFIGURACIÓN DE FULLCALENDAR ---

const calendarOptions: CalendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  locale: 'es',
  buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' },
  allDaySlot: false,
  timeZone: 'America/Lima',
  slotMinTime: '07:00:00',
  slotMaxTime: '21:00:00',
  selectable: true,
  select: handleTimeSelect,
  eventClick: handleEventClick,
  editable: true,
  eventDrop: handleEventDrop,
  eventResizableFromStart: true,
  eventResize: handleEventResize,
  eventClassNames: 'custom-event',
  height: 'auto', // Permite que el calendario se ajuste mejor en móviles
};

onMounted(async () => {
  await appointmentsStore.fetchAppointments();
  try {
    const response = await getDoctors();
    doctors.value = response.data;
    if (authStore.user?.role === 'dentist' || authStore.user?.role === 'admin') {
      selectedDoctorId.value = authStore.user.id;
    }
  } catch (error) {
    console.error("No se pudo cargar la lista de doctores", error);
  }
});
</script>

<template>
  <div class="p-4 md:p-6"> <!-- Padding responsivo -->
    
    <!-- HEADER Y FILTROS RESPONSIVOS -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
      <h1 class="text-2xl md:text-3xl font-bold text-text-dark">Agenda de Citas</h1>
      
      <!-- Grupo de Filtros -->
      <div class="flex flex-col md:flex-row gap-3 w-full lg:w-auto items-end md:items-center">
        
        <!-- Buscador -->
        <div class="relative w-full md:w-auto">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar paciente..." 
            class="input-style w-full md:w-56 pl-10"
          />
        </div>

        <!-- Filtro Estado -->
        <select @change="handleStatusFilterChange" :value="selectedStatus" class="input-style w-full md:w-48">
          <option value="all">Todos los Estados</option>
          <option v-for="status in AppointmentStatus" :key="status" :value="status">
            {{ translateAppointmentStatus(status) }}
          </option>
        </select>
        
        <!-- Filtro Doctor -->
        <select v-model="selectedDoctorId" class="input-style w-full md:w-64">
          <option value="all">Todos los Doctores</option>
          <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
            {{ doctor.fullName }}
          </option>
        </select>

        <!-- BOTÓN NUEVO: REPORTES -->
        <button 
          @click="isReportModalOpen = true"
          class="input-style bg-white hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer text-gray-700 font-medium h-[42px] w-full md:w-auto"
          title="Generar Reportes"
        >
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
           </svg>
           <span>Reportes</span>
        </button>
        
      </div>
    </div>
    
    <!-- CONTENEDOR CALENDARIO -->
    <div class="bg-white rounded-lg shadow-md p-2 md:p-6 overflow-x-auto">
      <!-- Min-width para evitar que el calendario se rompa en pantallas muy angostas -->
      <div class="min-w-[600px] md:min-w-0"> 
         <FullCalendar ref="calendarRef" :options="calendarOptions" />
      </div>
    </div>

    <!-- MODALES -->
    <Modal :isOpen="isFormModalOpen" @close="isFormModalOpen = false">
      <template #header>Agendar Nueva Cita</template>
      <template #default>
        <AppointmentForm 
          v-if="isFormModalOpen" 
          :initial-data="selectedDateInfo" 
          :loading="isLoading" 
          @submit="handleSaveAppointment" 
          @cancel="isFormModalOpen = false" 
        />
      </template>
    </Modal>

    <Modal :isOpen="isDetailModalOpen" @close="isDetailModalOpen = false">
      <template #header>Detalles de la Cita</template>
      <template #default>
        <AppointmentDetailModal 
          v-if="isDetailModalOpen" 
          :appointment="selectedAppointment" 
          @close="isDetailModalOpen = false"
          @status-updated="isDetailModalOpen = false"
        />
      </template>
    </Modal>

    <!-- MODAL NUEVO: REPORTES -->
    <AppointmentReportModal 
      v-if="isReportModalOpen" 
      @close="isReportModalOpen = false" 
    />

    <ConfirmationModal 
      :isOpen="isDropConfirmModalOpen"
      title="Reprogramar Cita"
      message="¿Estás seguro de que deseas mover esta cita al nuevo horario?"
      confirmButtonText="Sí, Reprogramar" @confirm="confirmReschedule"
      @cancel="cancelReschedule"
    >
      <template #icon>
        <img src="@/assets/diente-calendario.png" alt="Icono de calendario y diente" class="h-16 w-16 mx-auto" />
      </template>
    </ConfirmationModal>

    <ConfirmationModal 
      :isOpen="isResizeConfirmModalOpen"
      title="Actualizar Duración"
      message="¿Estás seguro de que deseas cambiar la duración de esta cita?"
      confirmButtonText="Sí, Actualizar" 
      @confirm="confirmResize"
      @cancel="cancelResize"
    >
      <template #icon>
        <img src="@/assets/diente-calendario.png" alt="Icono de calendario y diente" class="h-16 w-16 mx-auto" />
      </template>
    </ConfirmationModal>
  </div>
</template>

<style>
/* Estilos Globales para FullCalendar Events */
.custom-event {
  width: 90% !important;
  margin: 0 auto !important;
  border-radius: 4px;
  font-size: 0.85em;
}

.event-cancelled .fc-event-title {
  text-decoration: line-through;
}

.event-completed {
  opacity: 0.7;
}

.event-faded {
  opacity: 0.2 !important;
  transition: opacity 0.3s ease-in-out;
}
.event-faded:hover {
  opacity: 1 !important;
}

/* Inputs */
.input-style {
  @apply border border-gray-300 rounded-lg shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all;
}
</style>