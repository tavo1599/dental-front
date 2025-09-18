<script setup lang="ts">
import { ref } from 'vue';
import { useAppointmentsStore } from '@/stores/appointments';
import type { Appointment } from '@/types';
import { AppointmentStatus } from '@/types';
import IconWhatsapp from './icons/IconWhatsapp.vue';

const props = defineProps<{
  appointment: Appointment | null;
}>();

const emit = defineEmits(['close', 'status-updated']);
const appointmentsStore = useAppointmentsStore();
const selectedStatus = ref(props.appointment?.status);

async function handleUpdateStatus() {
  if (props.appointment && selectedStatus.value) {
    const success = await appointmentsStore.updateAppointmentStatus(props.appointment.id, selectedStatus.value);
    if (success) {
      emit('status-updated');
    }
  }
}

function openWhatsApp(phone: string, message: string) {
  const internationalPhone = `51${phone.replace(/[^0-9]/g, '')}`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${internationalPhone}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

function sendConfirmationRequest() {
  if (!props.appointment) return;
  const { patient, doctor, startTime } = props.appointment;
  const clinicName = doctor.tenant.name ;
  const appointmentDate = new Date(startTime).toLocaleDateString('es-PE', { day: '2-digit', month: 'long' });
  const appointmentTime = new Date(startTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  const message = `Hola ${patient.fullName}, te contactamos de ${clinicName} para tu cita agendada el ${appointmentDate} a las ${appointmentTime} con el Dr(a). ${doctor.fullName}. Por favor, responde para CONFIRMAR tu asistencia. ¡Gracias!`;
  
  openWhatsApp(patient.phone, message);
}

function sendDayOfReminder() {
  if (!props.appointment) return;
  const { patient, doctor, startTime } = props.appointment;
  const clinicName = doctor.tenant.name;
  const appointmentTime = new Date(startTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  const message = `¡Hola ${patient.fullName}! Te recordamos tu cita en ${clinicName} el día de HOY a las ${appointmentTime} con el Dr(a). ${doctor.fullName}. ¡Te esperamos!`;
  
  openWhatsApp(patient.phone, message);
}
</script>

<template>
  <div v-if="appointment" class="space-y-4">
    <div>
      <h3 class="text-lg font-bold text-primary">{{ appointment.patient.fullName }}</h3>
      <p class="text-sm text-text-light">Doctor: {{ appointment.doctor.fullName }}</p>
      <p class="text-sm text-text-light">
        {{ new Date(appointment.startTime).toLocaleString('es-PE', { dateStyle: 'full', timeStyle: 'short' }) }}
      </p>
    </div>

    <div v-if="appointment.notes">
      <label class="block text-sm font-medium text-text-light">Notas</label>
      <p class="mt-1 p-2 bg-light-gray rounded-md">{{ appointment.notes }}</p>
    </div>

    <div>
      <label for="status" class="block text-sm font-medium text-text-light">Cambiar Estado</label>
      <select v-model="selectedStatus" id="status" class="mt-1 block w-full input-style">
        <option v-for="s in AppointmentStatus" :key="s" :value="s" class="capitalize">{{ s.replace('_', ' ') }}</option>
      </select>
    </div>

    <div class="flex justify-between items-center pt-4 border-t mt-4">
      <div>
        <button v-if="appointment.status === 'scheduled'" @click="sendConfirmationRequest" type="button" class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold" title="Solicitar confirmación">
          <IconWhatsapp class="h-5 w-5" />
          <span>Solicitar Confirmación</span>
        </button>
        <button v-if="appointment.status === 'confirmed'" @click="sendDayOfReminder" type="button" class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold" title="Enviar recordatorio">
          <IconWhatsapp class="h-5 w-5" />
          <span>Enviar Recordatorio</span>
        </button>
      </div>
      
      <div class="flex space-x-4">
        <button @click="emit('close')" type="button" class="btn-secondary">Cerrar</button>
        <button @click="handleUpdateStatus" type="button" class="btn-primary" :disabled="appointmentsStore.isLoading">
          {{ appointmentsStore.isLoading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-style { @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
.btn-primary { @apply px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; }
.btn-secondary { @apply px-6 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; }
</style>