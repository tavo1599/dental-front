import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { 
  getOdontogram as getApi, 
  updateOdontogram as updateApi,
  saveToothState as saveToothStateApi,
  clearToothState as clearToothStateApi,
  saveBridge as saveBridgeApi,
  deleteBridge as deleteBridgeApi
} from '@/services/odontogramService';
import type { Tooth, ToothSurfaceState, OdontogramData, ToothState, ToothUpdate, DentalBridge } from '@/types';
import { OdontogramRecordType } from '@/types'; // Asegúrate de tener este Enum en tus types

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
  const bridges = ref<DentalBridge[]>([]); 
  const isLoading = ref(false);

  // --- NUEVO ESTADO: TIPO DE REGISTRO ---
  // Por defecto trabajamos sobre la Evolución (Estado Actual)
  const currentRecordType = ref<OdontogramRecordType>(OdontogramRecordType.EVOLUTION);

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

    wholeTeeth.value = teethMap;
    surfaces.value = surfacesMap;
    toothStates.value = statesMap;
    
    // Convertimos a any temporalmente para evitar error de tipado si la interfaz no se actualizó aún
    bridges.value = (data as any).bridges || []; 
  }

  // --- NUEVA ACCIÓN: CAMBIAR MODO (INICIAL <-> EVOLUCIÓN) ---
  async function setViewMode(patientId: string, type: OdontogramRecordType) {
    currentRecordType.value = type;
    await fetchOdontogram(patientId);
  }

  // Acción: Cargar Odontograma (Ahora recibe el tipo)
  async function fetchOdontogram(patientId: string) {
    isLoading.value = true;
    try {
      // Pasamos el tipo actual al servicio.
      // Nota: Tendrás que actualizar tu servicio para aceptar este segundo parámetro opcional.
      const response = await getApi(patientId, currentRecordType.value);
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
    // Bloqueo de seguridad (Opcional): Impedir editar el inicial si se desea
    // if (currentRecordType.value === OdontogramRecordType.INITIAL) { ... }

    try {
      // Pasamos el recordType al servicio para que sepa dónde guardar
      const response = await updateApi(patientId, updates, currentRecordType.value);
      processOdontogramData(response.data);
      toast.success('Odontograma actualizado.');
    } catch (error) {
      toast.error('No se pudo actualizar el odontograma.');
    }
  }

  // Acción: Guardar Estado Complejo (Top Box)
  async function saveToothState(patientId: string, data: Partial<ToothState>) {
    try {
      // Inyectamos el recordType en los datos a guardar
      const payload = { ...data, recordType: currentRecordType.value };
      const response = await saveToothStateApi(patientId, payload);
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
    const min = Math.min(start, end);
    const max = Math.max(start, end);

    try {
      const response = await saveBridgeApi(patientId, {
        startTooth: min,
        endTooth: max,
        color,
        recordType: currentRecordType.value // <-- Importante: Guardar en la capa correcta
      });
      
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
      await deleteBridgeApi(patientId, bridgeId);
      bridges.value = bridges.value.filter(b => b.id !== bridgeId);
      toast.success('Puente eliminado.');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar puente.');
    }
  }

  // Resetear todo
  function reset() {
    wholeTeeth.value = {};
    surfaces.value = {};
    toothStates.value = {};
    bridges.value = [];
    currentRecordType.value = OdontogramRecordType.EVOLUTION; // Reset a evolución por defecto
  }

  return { 
    wholeTeeth, 
    surfaces, 
    isLoading, 
    toothStates, 
    bridges, 
    currentRecordType, // Exportamos el tipo actual para que la vista pueda usarlo
    fetchOdontogram, 
    updateOdontogram,
    saveToothState, 
    clearToothState,
    addBridge,
    removeBridge,
    setViewMode, // Exportamos la función para cambiar de vista
    reset
  };
});