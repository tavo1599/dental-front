import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { 
  getOdontogram as getApi, 
  updateOdontogram as updateApi,
  saveToothState as saveToothStateApi,
  clearToothState as clearToothStateApi,
  // IMPORTANTE: Importamos las funciones del servicio para puentes
  saveBridge as saveBridgeApi,
  deleteBridge as deleteBridgeApi
} from '@/services/odontogramService';
import type { Tooth, ToothSurfaceState, OdontogramData, ToothState, ToothUpdate, DentalBridge } from '@/types';

// Tipos para los mapas (mejoran la legibilidad)
type WholeToothMap = Record<number, Tooth>;
type SurfaceStateMap = Record<number, Record<string, ToothSurfaceState>>;
type ToothStateMap = Record<number, ToothState[]>;

export const useOdontogramStore = defineStore('odontogram', () => {
  const toast = useToast();
  
  // Estados existentes
  const wholeTeeth = ref<WholeToothMap>({});
  const surfaces = ref<SurfaceStateMap>({});
  const toothStates = ref<ToothStateMap>({});
  const bridges = ref<DentalBridge[]>([]); // Estado de puentes
  const isLoading = ref(false);

  // Helper para procesar los datos que vienen del backend
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

    // Asignamos a los refs
    wholeTeeth.value = teethMap;
    surfaces.value = surfacesMap;
    toothStates.value = statesMap;
    
    // CARGAMOS LOS PUENTES REALES DE LA BD
    // El backend debe devolver el array 'bridges' dentro de OdontogramData
    // Usamos (data as any) para evitar el error de tipo si la interfaz no está actualizada
    bridges.value = (data as any).bridges || []; 
  }

  // Acción: Cargar Odontograma
  async function fetchOdontogram(patientId: string) {
    isLoading.value = true;
    try {
      const response = await getApi(patientId);
      processOdontogramData(response.data);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cargar el odontograma.');
    } finally {
      isLoading.value = false;
    }
  }

  // Acción: Actualizar (Superficies/Dientes)
  async function updateOdontogram(patientId: string, updates: ToothUpdate[]) {
    try {
      const response = await updateApi(patientId, updates);
      processOdontogramData(response.data);
      toast.success('Odontograma actualizado.');
    } catch (error) {
      toast.error('No se pudo actualizar el odontograma.');
    }
  }

  // Acción: Guardar Estado Complejo (Top Box)
  async function saveToothState(patientId: string, data: Partial<ToothState>) {
    try {
      const response = await saveToothStateApi(patientId, data);
      const newState = response.data;

      if (!toothStates.value[newState.toothNumber]) {
        toothStates.value[newState.toothNumber] = [];
      }
      // Reemplazar si existe o agregar
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

  // Acción: Borrar Estado Complejo
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

  // --- ACCIÓN REAL: AÑADIR PUENTE ---
  async function addBridge(patientId: string, start: number, end: number, color: string = 'red') {
    // Aseguramos el orden para simplificar la lógica visual
    const min = Math.min(start, end);
    const max = Math.max(start, end);

    try {
      // Llamada real al backend
      const response = await saveBridgeApi(patientId, {
        startTooth: min,
        endTooth: max,
        color
      });
      
      // Agregamos el puente devuelto por la BD a la lista local
      bridges.value.push(response.data);
      
      toast.success('Puente registrado correctamente.');
    } catch (error) {
      console.error(error);
      toast.error('Error al crear el puente en el sistema.');
    }
  }

  // --- ACCIÓN REAL: BORRAR PUENTE ---
  async function removeBridge(patientId: string, bridgeId: string) {
    try {
      // Llamada real al backend
      await deleteBridgeApi(patientId, bridgeId);
      
      // Actualizamos estado local eliminando el puente de la lista
      bridges.value = bridges.value.filter(b => b.id !== bridgeId);
      
      toast.success('Puente eliminado.');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar puente.');
    }
  }

  // Resetear todo (útil al cambiar de paciente)
  function reset() {
    wholeTeeth.value = {};
    surfaces.value = {};
    toothStates.value = {};
    bridges.value = []; // <-- Limpiamos puentes
  }

  return { 
    wholeTeeth, 
    surfaces, 
    isLoading, 
    toothStates, 
    bridges, // <-- Exportamos el estado nuevo
    fetchOdontogram, 
    updateOdontogram,
    saveToothState, 
    clearToothState,
    addBridge, // <-- Exportamos la acción nueva
    removeBridge, // <-- Exportamos la acción nueva
    reset
  };
});