import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { getPatients, createPatient as createPatientApi, updatePatient as updatePatientApi, getPatientById as getByIdApi } from '@/services/patientService';
import type { Patient } from '@/types';

export const usePatientsStore = defineStore('patients', () => {
  const toast = useToast();
  const patients = ref<Patient[]>([]);
  const selectedPatient = ref<Patient | null>(null);
  const isLoading = ref(false);

  async function fetchPatients() {
    isLoading.value = true;
    try {
      const response = await getPatients();
      patients.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar la lista de pacientes.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createPatient(patientData: Omit<Patient, 'id'>) {
    isLoading.value = true;
    try {
      await createPatientApi(patientData);
      toast.success('Paciente registrado con éxito.');
      await fetchPatients();
      return true;
    } catch (error) {
      toast.error('Error al registrar el paciente.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // --- FUNCIÓN 'updatePatient' CORREGIDA ---
  async function updatePatient(id: string, patientData: Partial<Patient>) {
    isLoading.value = true;
    try {
      const response = await updatePatientApi(id, patientData);
      const updatedPatient = response.data;

      // Actualizamos el estado del paciente seleccionado
      selectedPatient.value = updatedPatient;

      // Actualizamos al paciente dentro de la lista general
      const index = patients.value.findIndex(p => p.id === id);
      if (index !== -1) {
        patients.value[index] = updatedPatient;
      }

      toast.success('Paciente actualizado con éxito.');
      return true;
    } catch (error) {
      toast.error('Error al actualizar el paciente.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchPatientById(id: string) {
    isLoading.value = true;
    selectedPatient.value = null;
    try {
      const response = await getByIdApi(id);
      selectedPatient.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar la información del paciente.');
    } finally {
      isLoading.value = false;
    }
  }

  return { patients, selectedPatient, isLoading, fetchPatients, createPatient, updatePatient, fetchPatientById };
});