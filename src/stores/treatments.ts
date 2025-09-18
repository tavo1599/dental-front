import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import type { Treatment } from '@/types';
import { getTreatments, createTreatment as createApi, updateTreatment as updateApi, deleteTreatment as deleteApi } from '@/services/treatmentService';


export const useTreatmentsStore = defineStore('treatments', () => {
  const toast = useToast();
  const treatments = ref<Treatment[]>([]);
  const isLoading = ref(false);

  async function fetchTreatments() {
    isLoading.value = true;
    try {
      const response = await getTreatments();
      treatments.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar la lista de tratamientos.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createTreatment(data: Omit<Treatment, 'id'>) {
    isLoading.value = true;
    try {
      await createApi(data);
      toast.success('Tratamiento creado con éxito.');
      await fetchTreatments();
      return true;
    } catch (error) {
      toast.error('Error al crear el tratamiento.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateTreatment(id: string, data: Partial<Treatment>) {
    isLoading.value = true;
    try {
      await updateApi(id, data);
      toast.success('Tratamiento actualizado con éxito.');
      await fetchTreatments();
      return true;
    } catch (error) {
      toast.error('Error al actualizar el tratamiento.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteTreatment(id: string) {
    isLoading.value = true;
    try {
      await deleteApi(id);
      toast.success('Tratamiento eliminado con éxito.');
      await fetchTreatments(); // Actualiza la lista
    } catch (error) {
      toast.error('Error al eliminar el tratamiento.');
    } finally {
      isLoading.value = false;
    }
  }

  return { treatments, isLoading, fetchTreatments, createTreatment, updateTreatment, deleteTreatment };
});