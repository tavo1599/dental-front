<script setup lang="ts">
import { ref } from 'vue';
import { useAppointmentsStore } from '@/stores/appointments';
import { useAuthStore } from '@/stores/auth';
import type { Appointment } from '@/types';
import { AppointmentStatus } from '@/types';
import IconWhatsapp from './icons/IconWhatsapp.vue';
import { translateAppointmentStatus } from '@/utils/formatters';
import ConfirmationModal from './ConfirmationModal.vue';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';

const props = defineProps<{
  appointment: Appointment | null;
}>();

const emit = defineEmits(['close', 'status-updated']);

const appointmentsStore = useAppointmentsStore();
const authStore = useAuthStore();
const selectedStatus = ref(props.appointment?.status || AppointmentStatus.SCHEDULED);
const isDeleteConfirmModalOpen = ref(false);

async function handleUpdateStatus() {
  if (props.appointment && selectedStatus.value) {
    if (props.appointment.status !== selectedStatus.value) {
      const success = await appointmentsStore.updateAppointmentStatus(props.appointment.id, selectedStatus.value);
      if (success) {
        emit('status-updated');
      }
    } else {
      emit('close');
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
  const clinicName = doctor.tenant.name;
  const appointmentDate = new Date(startTime).toLocaleDateString('es-PE', { day: '2-digit', month: 'long' });
  const appointmentTime = new Date(startTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  const message = `Hola ${patient.fullName}, te contactamos de ${clinicName} para tu cita agendada el ${appointmentDate} a las ${appointmentTime} con el Dr(a). ${doctor.fullName}. Por favor, CONFIRMAR tu asistencia respondiendo este mensaje. ¡Gracias por tu confianza!`;

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

// --- [NUEVA FUNCIÓN] ---
// Crea y envía el mensaje para invitar a reprogramar una cita perdida.
function sendRescheduleInvitation() {
  if (!props.appointment) return;
  const { patient, doctor } = props.appointment;
  const clinicName = doctor.tenant.name;

  const message = `Hola ${patient.fullName}, te saludamos de ${clinicName} porque notamos que no pudiste asistir a tu última cita. Si deseas reprogramarla según tu disponibilidad, Estamos atentos para poder ayudarte a agendar una nueva cita. ¡Que tengas un buen día!`;

  openWhatsApp(patient.phone, message);
}
// --- FIN DE LA NUEVA FUNCIÓN ---

async function handleDelete() {
  if (props.appointment) {
    const success = await appointmentsStore.deleteAppointment(props.appointment.id);
    if (success) {
      isDeleteConfirmModalOpen.value = false;
      emit('close');
    }
  }
}
</script>

<template>
  <div v-if="!appointment" class="text-center">Cargando...</div>
  <div v-else class="space-y-4">
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
        <option v-for="s in AppointmentStatus" :key="s" :value="s">{{ translateAppointmentStatus(s) }}</option>
      </select>
    </div>

    <div class="flex justify-between items-center pt-4 border-t mt-4">
      
      <div class="flex gap-2">
        <button v-if="appointment.status === AppointmentStatus.SCHEDULED" @click="sendConfirmationRequest" type="button" class="btn-icon bg-blue-500 hover:bg-blue-600" title="Solicitar confirmación">
          <IconWhatsapp class="h-5 w-5" />
          <span>Confirmar</span>
        </button>
        <button v-if="appointment.status === AppointmentStatus.CONFIRMED" @click="sendDayOfReminder" type="button" class="btn-icon bg-green-500 hover:bg-green-600" title="Enviar recordatorio">
          <IconWhatsapp class="h-5 w-5" />
          <span>Recordar</span>
        </button>
        
        <!-- --- [NUEVO BOTÓN] --- -->
        <!-- Este botón solo aparecerá si el estado de la cita es 'NO_SHOW' -->
        <button v-if="appointment.status === AppointmentStatus.NO_SHOW" @click="sendRescheduleInvitation" type="button" class="btn-icon bg-orange-500 hover:bg-orange-600" title="Enviar mensaje para reprogramar">
          <IconWhatsapp class="h-5 w-5" />
          <span>Reprogramar</span>
        </button>
        <!-- --- FIN DEL NUEVO BOTÓN --- -->
        
        <Menu as="div" class="relative inline-block text-left">
          <div>
            <MenuButton class="btn-icon !bg-gray-200 !text-gray-700 hover:!bg-gray-300" title="Más opciones">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
              </svg>
            </MenuButton>
          </div>

          <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <MenuItems class="absolute bottom-full mb-2 w-48 origin-bottom-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div class="py-1">
                <MenuItem v-slot="{ active }">
                  <button @click="isDeleteConfirmModalOpen = true" :class="[ active ? 'bg-red-100 text-red-900' : 'text-red-700', 'group flex w-full items-center px-4 py-2 text-sm font-semibold' ]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mr-3 h-5 w-5 text-red-400">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 0 0-2.09 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    Eliminar Cita
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
      </div>

      <div class="flex space-x-4">
        <button @click="emit('close')" type="button" class="btn-secondary">Cancelar</button>
        <button @click="handleUpdateStatus" type="button" class="btn-primary" :disabled="appointmentsStore.isLoading">
          {{ appointmentsStore.isLoading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>

  <ConfirmationModal 
    :isOpen="isDeleteConfirmModalOpen"
    title="Eliminar Cita"
    message="¿Estás seguro de que deseas ELIMINAR esta cita? Esta acción es irreversible."
    confirmButtonText="Sí, Eliminar"
    @confirm="handleDelete"
    @cancel="isDeleteConfirmModalOpen = false"
  >
    <template #icon>
      <img src="@/assets/diente-calendario.png" alt="Icono de calendario y diente" class="h-16 w-16" />
    </template>
  </ConfirmationModal>
</template>

<style scoped>
.input-style { @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
.btn-primary { @apply px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; }
.btn-secondary { @apply px-6 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; }
.btn-icon {
  @apply flex items-center gap-2 px-3 py-2 text-white rounded-lg font-semibold text-sm;
}
</style>