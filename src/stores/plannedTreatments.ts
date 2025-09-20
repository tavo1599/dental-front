import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import * as service from '@/services/plannedTreatmentService';
import type { PlannedTreatment } from '@/types';

export const usePlannedTreatmentsStore = defineStore('plannedTreatments', () => {
  const toast = useToast();
  const plannedTreatments = ref<PlannedTreatment[]>([]);
  const isLoading = ref(false);

  async function fetchAll(patientId: string) {
    isLoading.value = true;
    try {
      const response = await service.getPlannedTreatments(patientId);
      plannedTreatments.value = response.data;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(data: any) {
    try {
      await service.createPlannedTreatment(data);
      toast.success('Tratamiento añadido al plan.');
      await fetchAll(data.patientId); // Recarga la lista
    } catch (error) {
      toast.error('No se pudo añadir el tratamiento.');
    }
  }

  async function remove(id: string, patientId: string) {
    try {
      await service.deletePlannedTreatment(id);
      toast.info('Tratamiento quitado del plan.');
      await fetchAll(patientId); // Recarga la lista
    } catch (error) {
      toast.error('No se pudo quitar el tratamiento.');
    }
  }

  async function clearAll(patientId: string) {
  try {
    await service.clearAllPlannedTreatments(patientId);
    // Limpiamos el estado local al instante
    plannedTreatments.value = [];
  } catch (error) {
    toast.error('No se pudo limpiar el plan de tratamiento.');
  }
}

  return { plannedTreatments, isLoading, fetchAll, create, remove, clearAll };
});