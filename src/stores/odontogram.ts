import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { 
  getOdontogram as getApi, 
  updateOdontogram as updateApi,
  saveToothState as saveToothStateApi,
  clearToothState as clearToothStateApi
} from '@/services/odontogramService';
import type { Tooth, ToothSurfaceState, ToothStatus, OdontogramData, ToothState, ToothUpdate } from '@/types';

type WholeToothMap = Record<number, Tooth>;
type SurfaceStateMap = Record<number, Record<string, ToothSurfaceState>>;
type ToothStateMap = Record<number, ToothState[]>; // <-- NUEVO TIPO

export const useOdontogramStore = defineStore('odontogram', () => {
  const toast = useToast();
  const wholeTeeth = ref<WholeToothMap>({});
  const surfaces = ref<SurfaceStateMap>({});
  const toothStates = ref<ToothStateMap>({}); // <-- NUEVO ESTADO
  const isLoading = ref(false);

  // Helper actualizado para procesar los TRES tipos de datos
  function processOdontogramData(data: OdontogramData) {
    const teethMap = Object.values(data.wholeTeeth || {}).reduce((acc, tooth) => {
      acc[tooth.toothNumber] = tooth;
      return acc;
    }, {} as WholeToothMap);

    const surfacesMap = Object.values(data.surfaces || {}).reduce((acc, state) => {
      if (!acc[state.toothNumber]) acc[state.toothNumber] = {};
      acc[state.toothNumber][state.surface] = state;
      return acc;
    }, {} as SurfaceStateMap);

    const statesMap = (data.toothStates || []).reduce((acc, state) => {
      if (!acc[state.toothNumber]) {
        acc[state.toothNumber] = [];
      }
      acc[state.toothNumber].push(state);
      return acc;
    }, {} as ToothStateMap);

    wholeTeeth.value = teethMap;
    surfaces.value = surfacesMap;
    toothStates.value = statesMap;
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

  // Tu función antigua se mantiene intacta
  async function updateOdontogram(patientId: string, updates: ToothUpdate[]) {
    try {
      const response = await updateApi(patientId, updates);
      processOdontogramData(response.data);
      toast.success('Odontograma actualizado.');
    } catch (error) {
      toast.error('No se pudo actualizar el odontograma.');
    }
  }

  // --- NUEVAS ACCIONES PARA EL "TOP BOX" ---
  async function saveToothState(patientId: string, data: Partial<ToothState>) {
    try {
      const response = await saveToothStateApi(patientId, data);
      const newState = response.data;

      if (!toothStates.value[newState.toothNumber]) {
        toothStates.value[newState.toothNumber] = [];
      }
      const index = toothStates.value[newState.toothNumber].findIndex(s => s.condition === newState.condition);
      if (index > -1) {
        toothStates.value[newState.toothNumber][index] = newState;
      } else {
        toothStates.value[newState.toothNumber].push(newState);
      }
      toast.success('Estado del diente guardado.');
    } catch (error) {
      toast.error('Error al guardar el estado del diente.');
    }
  }

  async function clearToothState(patientId: string, stateId: string, toothNumber: number) {
    try {
      await clearToothStateApi(patientId, stateId);
      if (toothStates.value[toothNumber]) {
        toothStates.value[toothNumber] = toothStates.value[toothNumber].filter(s => s.id !== stateId);
      }
      toast.success('Estado del diente eliminado.');
    } catch (error) {
      toast.error('Error al eliminar el estado.');
    }
  }

  return { 
    wholeTeeth, 
    surfaces, 
    isLoading, 
    toothStates, // <-- Exporta el nuevo estado
    fetchOdontogram, 
    updateOdontogram,
    saveToothState, // <-- Exporta la nueva acción
    clearToothState // <-- Exporta la nueva acción
  };
});