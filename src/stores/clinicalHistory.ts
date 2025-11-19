import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
// Importamos las funciones desde el servicio específico
import { 
  getClinicalHistory, 
  createClinicalHistoryEntry as createApi,
  updateClinicalHistoryEntry as updateApi // <-- Importamos la función de editar
} from '@/services/clinicalHistoryService';
import type { ClinicalHistoryEntry } from '@/types';

export const useClinicalHistoryStore = defineStore('clinicalHistory', () => {
  const toast = useToast();
  const entries = ref<ClinicalHistoryEntry[]>([]);
  const isLoading = ref(false);

  // Acción: Obtener historial
  async function fetchHistory(patientId: string) {
    isLoading.value = true;
    try {
      const response = await getClinicalHistory(patientId);
      entries.value = response.data;
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cargar el historial clínico.');
    } finally {
      isLoading.value = false;
    }
  }

  // Acción: Crear entrada
  async function createHistoryEntry(patientId: string, data: any) {
    isLoading.value = true;
    try {
      await createApi(patientId, data);
      toast.success('Entrada de historial creada con éxito.');
      await fetchHistory(patientId); // Recargamos la lista
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Error al crear la entrada.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // --- LO QUE FALTABA: Acción Editar entrada ---
  async function editHistoryEntry(patientId: string, entryId: string, data: any) {
    isLoading.value = true;
    try {
      await updateApi(patientId, entryId, data);
      toast.success('Entrada actualizada con éxito.');
      await fetchHistory(patientId); // Recargamos la lista para ver cambios
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar la entrada.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return { 
    entries, 
    isLoading, 
    fetchHistory, 
    createHistoryEntry,
    editHistoryEntry // <-- No olvides exportarla
  };
});