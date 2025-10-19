import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';
import * as service from '@/services/appointmentService';
import { 
  getAppointments,
  createAppointment as createApi, 
  updateAppointmentTime as updateTimeApi, 
  updateAppointmentStatus as updateStatusApi, 
  getAppointmentsForPatient as getForPatientApi, 
  getNextDayPending as getNextDayPendingApi 
} from '@/services/appointmentService';
import type { Appointment, AppointmentStatus } from '@/types';
import { AppointmentStatus as StatusEnum } from '@/types';

export const useAppointmentsStore = defineStore('appointments', () => {
  const toast = useToast();
  const allAppointments = ref<Appointment[]>([]); // Lista original sin filtrar
  const patientAppointments = ref<Appointment[]>([]);
  const isLoading = ref(false);
  const nextDayPending = ref<Appointment[]>([]);
  const selectedStatus = ref<AppointmentStatus | 'all'>('all'); // Estado para el filtro

  // 'appointments' ahora devuelve la lista filtrada
  const appointments = computed(() => {
    return allAppointments.value.filter(appt => {
      if (selectedStatus.value === 'all') {
        // Por defecto, oculta las canceladas y no presentadas
        return appt.status !== StatusEnum.CANCELLED && appt.status !== StatusEnum.NO_SHOW;
      }
      // Si se selecciona un filtro, muestra solo ese
      return appt.status === selectedStatus.value;
    });
  });

  async function fetchAppointments() {
    isLoading.value = true;
    try {
      const response = await getAppointments();
      allAppointments.value = response.data; // Guarda en la lista original
    } catch (error) {
      toast.error('No se pudo cargar la agenda.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createAppointment(data: any) {
    isLoading.value = true;
    try {
      const response = await createApi(data);
      const newAppointment = response.data;
      
      allAppointments.value.push(newAppointment); // Añade a la lista original
      await fetchNextDayPending();
      
      toast.success('Cita creada con éxito.');
      return true;
    } catch (error) {
      toast.error('Error al crear la cita.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateAppointmentTime(id: string, data: { startTime: string; endTime?: string }) {
    try {
      await updateTimeApi(id, data);
      toast.success('Cita reprogramada con éxito.');
      await fetchAppointments();
    } catch (error) {
      toast.error('No se pudo reprogramar la cita.');
    }
  }

  async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
    isLoading.value = true;
    try {
      await updateStatusApi(id, status);
      toast.success('Estado de la cita actualizado.');
      await fetchAppointments();
      return true;
    } catch (error) {
      toast.error('No se pudo actualizar el estado.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAppointmentsForPatient(patientId: string) {
    isLoading.value = true;
    try {
      const response = await getForPatientApi(patientId);
      patientAppointments.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar las citas del paciente.');
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchNextDayPending() {
    try {
      const response = await getNextDayPendingApi();
      nextDayPending.value = response.data;
    } catch (error) {
      console.error('Error fetching next day pending appointments', error);
    }
  }

  // Nueva función para aplicar el filtro
  function filterByStatus(status: AppointmentStatus | 'all') {
    selectedStatus.value = status;
  }

  async function deleteAppointment(id: string): Promise<boolean> {
    isLoading.value = true;
    try {
      await service.deleteAppointment(id);
      // Elimina la cita de la lista local
      allAppointments.value = allAppointments.value.filter(a => a.id !== id);
      toast.success('Cita eliminada permanentemente.');
      return true;
    } catch (error) {
      toast.error('No se pudo eliminar la cita.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return { 
    appointments, 
    patientAppointments, 
    isLoading, 
    nextDayPending,
    selectedStatus,
    fetchAppointments, 
    fetchAppointmentsForPatient, 
    createAppointment, 
    updateAppointmentTime, 
    updateAppointmentStatus, 
    fetchNextDayPending,
    filterByStatus, deleteAppointment,
  };
});