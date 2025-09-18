import { ref, computed } from 'vue';

// Definimos una interfaz para mayor claridad
interface UbigeoEntry {
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

export function useLocations() {
  const locations = ref<UbigeoEntry[]>([]);
  const selectedDepartment = ref('');
  const selectedProvince = ref('');

  async function loadLocations() {
    if (locations.value.length === 0) {
      try {
        const response = await fetch('/locations.json');
        locations.value = await response.json();
      } catch (error) {
        console.error('Error al cargar locations.json:', error);
      }
    }
  }

  // Para obtener una lista única de departamentos
  const departments = computed(() => {
    const departmentNames = locations.value.map(loc => loc.departamento);
    return [...new Set(departmentNames)].sort(); // new Set() elimina duplicados
  });

  // Filtra la lista completa para encontrar provincias de un departamento
  const provinces = computed(() => {
    if (!selectedDepartment.value) return [];
    const provinceNames = locations.value
      .filter(loc => loc.departamento === selectedDepartment.value)
      .map(loc => loc.provincia);
    return [...new Set(provinceNames)].sort();
  });

  // Filtra la lista completa para encontrar distritos de una provincia
  const districts = computed(() => {
    if (!selectedDepartment.value || !selectedProvince.value) return [];
    return locations.value
      .filter(loc => loc.departamento === selectedDepartment.value && loc.provincia === selectedProvince.value)
      .map(loc => loc.distrito)
      .sort();
  });

  return {
    loadLocations,
    departments,
    provinces,
    districts,
    selectedDepartment,
    selectedProvince
  };
}