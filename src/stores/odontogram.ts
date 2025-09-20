import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { getOdontogram as getApi, updateOdontogram as updateApi } from '@/services/odontogramService';
import type { ToothSurfaceState, ToothStatus } from '@/types';
import { ToothStatus as ToothStatusEnum } from '@/types';

export const useOdontogramStore = defineStore('odontogram', () => {
  const toast = useToast();
  const toothStates = ref<Record<number, Record<string, ToothSurfaceState>>>({});
  const isLoading = ref(false);

  // --- LÓGICA PARA ESTADOS DE DIENTE COMPLETO ---
  const wholeToothStatuses = [
    ToothStatusEnum.CROWN,
    ToothStatusEnum.ENDODONTICS,
    ToothStatusEnum.IMPLANT,
    ToothStatusEnum.EXTRACTION_NEEDED,
    ToothStatusEnum.EXTRACTED,
  ];
  
  const surfaces = ['vestibular', 'lingual', 'palatal', 'mesial', 'distal', 'occlusal'];
  // --- FIN ---

  async function fetchOdontogram(patientId: string) {
    isLoading.value = true;
    try {
      const response = await getApi(patientId);
      const flatArray: ToothSurfaceState[] = response.data;
      const nestedObject = flatArray.reduce((acc, state) => {
        const { toothNumber, surface } = state;
        if (!acc[toothNumber]) {
          acc[toothNumber] = {};
        }
        acc[toothNumber][surface] = state;
        return acc;
      }, {} as Record<number, Record<string, ToothSurfaceState>>);
      toothStates.value = nestedObject;
    } catch (error) {
      toast.error('No se pudo cargar el odontograma.');
    } finally {
      isLoading.value = false;
    }
  }

  // --- FUNCIÓN 'updateToothState' MODIFICADA ---
  async function updateToothState(
    patientId: string, 
    toothNumber: number, 
    surface: string, 
    status: ToothStatus
  ) {
    let updates = [{ toothNumber, surface, status }];

    // Si el estado es de diente completo, genera actualizaciones para todas las superficies
    if (wholeToothStatuses.includes(status)) {
      updates = surfaces.map(s => ({ toothNumber, surface: s, status }));
    }
    
    // Llama a la función de actualización múltiple, que ya tiene la lógica principal
    await updateMultipleToothStates(patientId, updates);
  }

  // --- FUNCIÓN 'updateMultipleToothStates' MODIFICADA ---
  async function updateMultipleToothStates(
    patientId: string, 
    updates: { toothNumber: number, surface: string, status: ToothStatus }[]
  ) {
    let finalUpdates: { toothNumber: number, surface: string, status: ToothStatus }[] = [];
    const toothNumbersToUpdate = new Map<number, ToothStatus>();

    updates.forEach(update => {
      if (wholeToothStatuses.includes(update.status)) {
        toothNumbersToUpdate.set(update.toothNumber, update.status);
      }
    });
    
    finalUpdates.push(...updates.filter(upd => !toothNumbersToUpdate.has(upd.toothNumber)));
    
    toothNumbersToUpdate.forEach((status, toothNumber) => {
      surfaces.forEach(s => finalUpdates.push({ toothNumber, surface: s, status }));
    });

    try {
      // 1. Llamamos a la API. El backend nos devuelve la lista completa y actualizada.
      const response = await updateApi(patientId, finalUpdates);
      const updatedStates: ToothSurfaceState[] = response.data;
      
      // 2. Reconstruimos nuestro objeto de estado local desde cero con los datos frescos.
      const nestedObject = updatedStates.reduce((acc, state) => {
        const { toothNumber, surface } = state;
        if (!acc[toothNumber]) {
          acc[toothNumber] = {};
        }
        acc[toothNumber][surface] = state;
        return acc;
      }, {} as Record<number, Record<string, ToothSurfaceState>>);
      
      toothStates.value = nestedObject; // <-- Actualización completa y segura

      toast.success(`${updates.length} superficie(s) actualizada(s).`);
      return true;
    } catch (error) {
      toast.error('No se pudieron actualizar las superficies.');
      return false;
    }
  }

  return { toothStates, isLoading, fetchOdontogram, updateToothState, updateMultipleToothStates };
});