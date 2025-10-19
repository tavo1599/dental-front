<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuthStore } from '@/stores/auth';
import { useAppointmentsStore } from '@/stores/appointments';
import { storeToRefs } from 'pinia';
import type { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import Modal from '@/components/Modal.vue';
import AppointmentForm from '@/components/AppointmentForm.vue';
import AppointmentDetailModal from '@/components/AppointmentDetailModal.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
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
const selectedDateInfo = ref<any>(null);
const selectedAppointment = ref<Appointment | null>(null);
const dropEventInfo = ref<any>(null);
const resizeEventInfo = ref<any>(null);

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
  return filteredAppointments.value.map(appt => {
    const style = getStatusStyle(appt.status);
    
    // 1. Creamos objetos Date a partir de los strings UTC del backend.
    // El navegador los convierte automáticamente a la zona horaria local.
    const startDate = new Date(appt.startTime);
    const endDate = new Date(appt.endTime);

    // 2. Creamos una función para formatear la fecha a "YYYY-MM-DDTHH:mm:ss"
    // Esto crea un string de fecha local sin información de zona horaria.
    const toLocalISOString = (date: Date) => {
      const pad = (num: number) => num.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
            `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    return {
      id: appt.id,
      title: appt.patient.fullName,
      // 3. Le pasamos al calendario el string de fecha local.
      start: toLocalISOString(startDate),
      end: toLocalISOString(endDate),
      backgroundColor: style.color,
      borderColor: style.color,
      className: style.className,
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
  eventResizableFromStart: true, // Permite estirar desde el inicio
  eventResize: handleEventResize, // <-- Conecta el nuevo manejador
  eventClassNames: 'custom-event',
};

onMounted(async () => {
  await appointmentsStore.fetchAppointments();
  try {
    const response = await getDoctors();
    doctors.value = response.data;
    
    // Si el usuario es doctor O admin, selecciona su ID por defecto
    if (authStore.user?.role === 'dentist' || authStore.user?.role === 'admin') {
      selectedDoctorId.value = authStore.user.id;
    }
    
  } catch (error) {
    console.error("No se pudo cargar la lista de doctores", error);
  }
});
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <h1 class="text-3xl font-bold text-text-dark">Agenda de Citas</h1>
      
      <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
    
    <select @change="handleStatusFilterChange" :value="selectedStatus" class="input-style w-full sm:w-48">
      <option value="all">Todos los Estados</option>
      <option v-for="status in AppointmentStatus" :key="status" :value="status">
        {{ translateAppointmentStatus(status) }}
      </option>
    </select>
    
    <select v-model="selectedDoctorId" class="input-style w-full sm:w-64">
      <option value="all">Todos los Doctores</option>
      <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
        {{ doctor.fullName }}
      </option>
    </select>
    
    </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <FullCalendar ref="calendarRef" :options="calendarOptions" />
    </div>

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

    <ConfirmationModal 
  :isOpen="isDropConfirmModalOpen"
  title="Reprogramar Cita"
  message="¿Estás seguro de que deseas mover esta cita al nuevo horario?"
  confirmButtonText="Sí, Reprogramar" @confirm="confirmReschedule"
  @cancel="cancelReschedule"
>
  <template #icon>
    <img src="@/assets/diente-calendario.png" alt="Icono de calendario y diente" class="h-19 w-19" />
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
    <img src="@/assets/diente-calendario.png" alt="Icono de calendario y diente" class="h-19 w-19" />
  </template>
  </ConfirmationModal>
  </div>
</template>

<style>
/* Estilo para hacer los eventos del calendario un poco más estrechos */
.custom-event {
  width: 85% !important;
  margin: 0 auto !important;
}

/* Estilo para citas canceladas o no asistidas */
.event-cancelled .fc-event-title {
  text-decoration: line-through;
}

/* Estilo para citas completadas (un poco transparente) */
.event-completed {
  opacity: 0.7;
}
</style>