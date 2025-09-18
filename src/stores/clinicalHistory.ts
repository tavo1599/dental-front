// src/stores/clinicalHistory.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { getClinicalHistory, createClinicalHistoryEntry as createApi } from '@/services/clinicalHistoryService';
import type { ClinicalHistoryEntry } from '@/types';

export const useClinicalHistoryStore = defineStore('clinicalHistory', () => {
  const toast = useToast();
  const entries = ref<ClinicalHistoryEntry[]>([]);
  const isLoading = ref(false);

  async function fetchHistory(patientId: string) {
    isLoading.value = true;
    try {
      const response = await getClinicalHistory(patientId);
      entries.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar el historial clínico.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createHistoryEntry(patientId: string, data: any) {
    isLoading.value = true;
    try {
      await createApi(patientId, data);
      toast.success('Entrada de historial creada con éxito.');
      await fetchHistory(patientId);
      return true;
    } catch (error) {
      toast.error('Error al crear la entrada.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return { entries, isLoading, fetchHistory, createHistoryEntry };
});