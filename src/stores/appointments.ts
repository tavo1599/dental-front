import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { 
  getAppointments,
  createAppointment as createApi, 
  updateAppointmentTime as updateTimeApi, 
  updateAppointmentStatus as updateStatusApi, 
  getAppointmentsForPatient as getForPatientApi, 
  getNextDayPending as getNextDayPendingApi 
} from '@/services/appointmentService';
import type { Appointment, AppointmentStatus } from '@/types';

export const useAppointmentsStore = defineStore('appointments', () => {
  const toast = useToast();
  const appointments = ref<Appointment[]>([]);
  const patientAppointments = ref<Appointment[]>([]);
  const isLoading = ref(false);
  const nextDayPending = ref<Appointment[]>([]);

  async function fetchAppointments() {
    isLoading.value = true;
    try {
      const response = await getAppointments();
      appointments.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar la agenda.');
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

  async function createAppointment(data: any) {
    isLoading.value = true;
    try {
      await createApi(data);
      toast.success('Cita creada con éxito.');
      await fetchAppointments();
      return true;
    } catch (error) {
      toast.error('Error al crear la cita.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // --- LÓGICA DE 'updateAppointmentTime' CORREGIDA Y SIMPLIFICADA ---
  async function updateAppointmentTime(id: string, data: { startTime: string; endTime?: string }) {
    try {
      const response = await updateTimeApi(id, data);
      const updatedAppointment = response.data;

      const index = appointments.value.findIndex(a => a.id === id);
      if (index !== -1) {
        appointments.value[index] = { ...appointments.value[index], ...updatedAppointment };
      }
      toast.success('Cita reprogramada con éxito.');
    } catch (error) {
      toast.error('No se pudo reprogramar la cita. Revirtiendo cambio.');
      await fetchAppointments();
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

  async function fetchNextDayPending() {
    try {
      const response = await getNextDayPendingApi();
      nextDayPending.value = response.data;
    } catch (error) {
      console.error('Error fetching next day pending appointments', error);
    }
  }

  return { appointments, patientAppointments, isLoading, nextDayPending, fetchAppointments, fetchAppointmentsForPatient, createAppointment, updateAppointmentTime, updateAppointmentStatus, fetchNextDayPending };
});