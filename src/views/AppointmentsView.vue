<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
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
import type { Appointment, User } from '@/types';
import { AppointmentStatus } from '@/types';
import { getDoctors } from '@/services/userService';

const appointmentsStore = useAppointmentsStore();
const { appointments, isLoading } = storeToRefs(appointmentsStore);
const authStore = useAuthStore();

const doctors = ref<User[]>([]);
const selectedDoctorId = ref<string>('all');
const isFormModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const isDropConfirmModalOpen = ref(false);
const selectedDateInfo = ref<any>(null);
const selectedAppointment = ref<Appointment | null>(null);
const dropEventInfo = ref<any>(null);

const filteredAppointments = computed(() => {
  if (selectedDoctorId.value === 'all') return appointments.value;
  return appointments.value.filter(appt => appt.doctor.id === selectedDoctorId.value);
});

const getStatusStyle = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.CONFIRMED: return { color: '#10B981', className: '' };
    case AppointmentStatus.COMPLETED: return { color: '#6B7280', className: 'event-completed' };
    case AppointmentStatus.CANCELLED:
    case AppointmentStatus.NO_SHOW: return { color: '#EF4444', className: 'event-cancelled' };
    default: return { color: '#2563EB', className: '' };
  }
};

const calendarEvents = computed(() => {
  return filteredAppointments.value.map(appt => {
    const style = getStatusStyle(appt.status);
    return {
      id: appt.id,
      title: appt.patient.fullName,
      start: appt.startTime,
      end: appt.endTime,
      backgroundColor: style.color,
      borderColor: style.color,
      className: style.className,
      extendedProps: { 
        appointmentData: appt
      }
    }
  });
});

function handleTimeSelect(selectInfo: any) {
  const compatibleData = { date: selectInfo.start, dateStr: selectInfo.startStr };
  selectedDateInfo.value = compatibleData;
  isFormModalOpen.value = true;
}

function handleEventClick(clickInfo: any) {
  selectedAppointment.value = clickInfo.event.extendedProps.appointmentData;
  isDetailModalOpen.value = true;
}

function handleEventDrop(dropInfo: any) {
  dropEventInfo.value = dropInfo;
  isDropConfirmModalOpen.value = true;
}

async function handleSaveAppointment(data: any) {
  const success = await appointmentsStore.createAppointment(data);
  if (success) isFormModalOpen.value = false;
}

function confirmReschedule() {
  if (dropEventInfo.value) {
    const { event } = dropEventInfo.value;
    const payload: { startTime: string; endTime?: string } = { startTime: event.startStr };
    if (event.endStr) payload.endTime = event.endStr;
    appointmentsStore.updateAppointmentTime(event.id, payload);
  }
  isDropConfirmModalOpen.value = false;
}

function cancelReschedule() {
  if (dropEventInfo.value) dropEventInfo.value.revert();
  isDropConfirmModalOpen.value = false;
}

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
  timeZone: 'America/Lima',
  allDaySlot: false,
  slotMinTime: '07:00:00',
  slotMaxTime: '20:00:00',
  selectable: true,
  select: handleTimeSelect,
  eventClick: handleEventClick,
  editable: true,
  eventDrop: handleEventDrop,
  eventClassNames: 'custom-event',
};

onMounted(async () => {
  await appointmentsStore.fetchAppointments();
  try {
    const response = await getDoctors();
    doctors.value = response.data;
    if (authStore.user?.role === 'dentist' || authStore.user?.role === 'admin') {
      selectedDoctorId.value = authStore.user.sub;
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
      <div class="w-full md:w-auto">
        <select v-if="authStore.user?.role === 'assistant' || authStore.user?.role === 'admin'" v-model="selectedDoctorId" id="doctorFilter" class="input-style w-full md:w-64">
          <option value="all">Todos los Doctores</option>
          <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
            {{ doctor.fullName }}
          </option>
        </select>
        <div v-else class="text-right">
          <p class="font-semibold text-text-dark">{{ authStore.user?.fullName }}</p>
          <p class="text-sm text-text-light">Mi Agenda</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-lg shadow-md p-6">
      <FullCalendar
        :key="calendarEvents.length"
        :options="calendarOptions"
        :events="calendarEvents"
      />
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
      confirmButtonText="Sí, Reprogramar" 
      @confirm="confirmReschedule"
      @cancel="cancelReschedule"
    >
      <template #icon>
        <img src="@/assets/diente-calendario.png" alt="Icono de calendario y diente" class="h-10 w-10" />
      </template>
    </ConfirmationModal>
  </div>
</template>

<style>
/* Estilos */
.custom-event {
  width: 90% !important;
  margin: 0 auto !important;
  font-size: 0.75rem;
  padding: 2px;
}
.event-cancelled .fc-event-title {
  text-decoration: line-through;
}
.event-completed {
  opacity: 0.7;
}
.input-style { 
  @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; 
}
</style>