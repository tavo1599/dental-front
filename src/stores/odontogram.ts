import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { getOdontogram as getApi, updateOdontogram as updateApi } from '@/services/odontogramService';
import type { Tooth, ToothSurfaceState, ToothStatus } from '@/types';

export const useOdontogramStore = defineStore('odontogram', () => {
  const toast = useToast();
  const wholeTeeth = ref<Record<number, Tooth>>({});
  const surfaces = ref<Record<number, Record<string, ToothSurfaceState>>>({});
  const isLoading = ref(false);

  // Helper para procesar la respuesta de la API
  function processOdontogramData(data: { wholeTeeth: Tooth[], surfaces: ToothSurfaceState[] }) {
    const teethMap = data.wholeTeeth.reduce((acc, tooth) => {
      acc[tooth.toothNumber] = tooth;
      return acc;
    }, {} as Record<number, Tooth>);

    const surfacesMap = data.surfaces.reduce((acc, state) => {
      if (!acc[state.toothNumber]) acc[state.toothNumber] = {};
      acc[state.toothNumber][state.surface] = state;
      return acc;
    }, {} as Record<number, Record<string, ToothSurfaceState>>);

    wholeTeeth.value = teethMap;
    surfaces.value = surfacesMap;
  }

  async function fetchOdontogram(patientId: string) {
    isLoading.value = true;
    try {
      const response = await getApi(patientId);
      processOdontogramData(response.data);
    } catch (error) {
      toast.error('No se pudo cargar el odontograma.');
    } finally {
      isLoading.value = false;
    }
  }

  async function updateOdontogram(patientId: string, updates: any[]) {
    try {
      const response = await updateApi(patientId, updates);
      processOdontogramData(response.data);
      toast.success('Odontograma actualizado.');
    } catch (error) {
      toast.error('No se pudo actualizar el odontograma.');
    }
  }

  return { wholeTeeth, surfaces, isLoading, fetchOdontogram, updateOdontogram };
});