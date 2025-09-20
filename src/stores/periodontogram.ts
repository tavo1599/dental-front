import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import * as service from '@/services/periodontogramService';
import type { PeriodontalMeasurement } from '@/types';

export const usePeriodontogramStore = defineStore('periodontogram', () => {
  const toast = useToast();
  const measurements = ref<PeriodontalMeasurement[]>([]);
  const isLoading = ref(false);

  async function fetchPeriodontogram(patientId: string) {
    isLoading.value = true;
    try {
      const response = await service.getPeriodontogram(patientId);
      measurements.value = response.data;
    } finally {
      isLoading.value = false;
    }
  }

  async function updatePeriodontogram(patientId: string, updates: any[]) {
    try {
      await service.updatePeriodontogram(patientId, updates);
      toast.success('Periodontograma guardado con éxito.');
      await fetchPeriodontogram(patientId);
    } catch (error) {
      toast.error('No se pudo guardar el periodontograma.');
    }
  }

  return { measurements, isLoading, fetchPeriodontogram, updatePeriodontogram };
});