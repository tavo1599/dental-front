import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { getPatients, createPatient as createPatientApi, updatePatient as updatePatientApi, getPatientById as getByIdApi } from '@/services/patientService';
import type { Patient, MedicalHistory, OdontopediatricHistory, OrthodonticAnamnesis } from '@/types';

import * as service from '@/services/patientService';

export const usePatientsStore = defineStore('patients', () => {
  const toast = useToast();
  const patients = ref<Patient[]>([]);
  const selectedPatient = ref<Patient | null>(null);
  const medicalHistory = ref<MedicalHistory | null>(null);
  const odontopediatricHistory = ref<OdontopediatricHistory | null>(null);
  const orthodonticHistory = ref<OrthodonticAnamnesis | null>(null);
  const isLoading = ref(false);
  const isHistoryLoading = ref(false);

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

  async function fetchMedicalHistory(patientId: string) {
    isHistoryLoading.value = true;
    try {
      const response = await service.getMedicalHistory(patientId);
      medicalHistory.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar la Anamnesis General.');
    } finally {
      isHistoryLoading.value = false;
    }
  }

async function updateMedicalHistory(patientId: string, data: MedicalHistory): Promise<boolean> {
    isHistoryLoading.value = true; // <-- Usa el nuevo estado
    try {
      const response = await service.updateMedicalHistory(patientId, data);
      medicalHistory.value = response.data;
      toast.success('Anamnesis General actualizada.');
      return true;
    } catch (error) {
      toast.error('No se pudo actualizar la Anamnesis General.');
      return false;
    } finally {
      isHistoryLoading.value = false; // <-- Usa el nuevo estado
    }
  }

  async function fetchOdontopediatricHistory(patientId: string) {
    isHistoryLoading.value = true; // <-- Usa el nuevo estado
    try {
      const response = await service.getOdontopediatricHistory(patientId);
      odontopediatricHistory.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar la anamnesis pediátrica.');
    } finally {
      isHistoryLoading.value = false; // <-- Usa el nuevo estado
    }
  }

  async function updateOdontopediatricHistory(patientId: string, data: OdontopediatricHistory): Promise<boolean> {
    isHistoryLoading.value = true; // <-- Usa el nuevo estado
    try {
      const response = await service.updateOdontopediatricHistory(patientId, data);
      odontopediatricHistory.value = response.data;
      toast.success('Anamnesis Pediátrica actualizada.');
      return true;
    } catch (error) {
      toast.error('No se pudo actualizar la Anamnesis Pediátrica.');
      return false;
    } finally {
      isHistoryLoading.value = false; // <-- Usa el nuevo estado
    }
  }

  async function fetchOrthodonticHistory(patientId: string) {
    isHistoryLoading.value = true;
    try {
      const response = await service.getOrthodonticHistory(patientId);
      orthodonticHistory.value = response.data;
    } catch (error) {
      console.error('Error fetching orthodontic history:', error);
      orthodonticHistory.value = null; // Asegura que esté nulo si falla
    } finally {
      isHistoryLoading.value = false;
    }
  }

  async function updateOrthodonticHistory(patientId: string, data: Partial<OrthodonticAnamnesis>): Promise<boolean> {
    isHistoryLoading.value = true;
    try {
      const response = await service.updateOrthodonticHistory(patientId, data);
      orthodonticHistory.value = response.data;
      toast.success('Anamnesis de Ortodoncia actualizada con éxito.');
      return true;
    } catch (error) {
      toast.error('Error al actualizar la Anamnesis de Ortodoncia.');
      return false;
    } finally {
      isHistoryLoading.value = false;
    }
  }


  return { patients, selectedPatient, medicalHistory, orthodonticHistory, odontopediatricHistory, isLoading, isHistoryLoading, fetchPatients, createPatient, updatePatient, fetchPatientById, fetchMedicalHistory,
    updateMedicalHistory, fetchOdontopediatricHistory, updateOdontopediatricHistory, fetchOrthodonticHistory, updateOrthodonticHistory, };
});