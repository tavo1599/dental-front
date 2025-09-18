<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { usePatientsStore } from '@/stores/patients';
import { getDoctors } from '@/services/userService';
import type { User } from '@/types';
import { storeToRefs } from 'pinia';
import SearchableDropdown from './SearchableDropdown.vue'; // 1. Importa el nuevo componente

const props = defineProps<{
  initialData?: any; // Recibe el objeto 'DateClickArg' de FullCalendar
  loading: boolean;
}>();
const emit = defineEmits(['submit', 'cancel']);

const patientsStore = usePatientsStore();
const { patients } = storeToRefs(patientsStore);
const doctors = ref<User[]>([]);
const isLoadingData = ref(true);

// 2. Unificamos todos los datos del formulario en un solo objeto reactivo
const formData = ref({
  patientId: '',
  doctorId: '',
  notes: '',
  startTime: '',
  endTime: '',
});

const datePart = props.initialData.dateStr.substring(0, 10);
const startTime = ref(props.initialData.dateStr.substring(11, 16));
const endTime = ref('');

const isManualTime = ref(false);
const selectedDuration = ref(60);

watch([selectedDuration, startTime], () => {
  if (!isManualTime.value) {
    const startDate = new Date(`${datePart}T${startTime.value}`);
    const endDate = new Date(startDate.getTime() + selectedDuration.value * 60000);
    endTime.value = endDate.toTimeString().substring(0, 5);
  }
}, { immediate: true });

onMounted(async () => {
  isLoadingData.value = true;
  try {
    const patientsPromise = patientsStore.patients.length === 0 ? patientsStore.fetchPatients() : Promise.resolve();
    const doctorsPromise = getDoctors();
    const [_, doctorsResponse] = await Promise.all([patientsPromise, doctorsPromise]);
    doctors.value = doctorsResponse.data;
  } catch (error) {
    console.error("Error cargando datos para el formulario", error);
  } finally {
    isLoadingData.value = false;
  }
});

function handleSubmit() {
  // 3. Construimos el payload final desde el formData y las horas
  const dataToSend = {
    ...formData.value,
    startTime: `${datePart}T${startTime.value}:00`,
    endTime: `${datePart}T${endTime.value}:00`,
  };
  emit('submit', dataToSend);
}
</script>

<template>
  <div v-if="isLoadingData" class="text-center py-8 text-text-light">
    Cargando datos del formulario...
  </div>
  <form v-else @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label for="patient" class="block text-sm font-medium text-text-light">Paciente</label>
      <!-- 4. Usamos el nuevo componente de búsqueda -->
      <SearchableDropdown
        v-model="formData.patientId"
        :items="patients"
        placeholder="Buscar paciente por nombre..."
        class="mt-1"
      />
    </div>
    <div>
      <label for="doctor" class="block text-sm font-medium text-text-light">Doctor</label>
      <!-- 4. Usamos el nuevo componente de búsqueda -->
      <SearchableDropdown
        v-model="formData.doctorId"
        :items="doctors"
        placeholder="Buscar doctor por nombre..."
        class="mt-1"
      />
    </div>
    
    <div>
      <label class="block text-sm font-medium text-text-light">Fecha de la Cita</label>
      <p class="mt-1 font-semibold text-text-dark">{{ new Date(datePart + 'T00:00:00-05:00').toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
    </div>

    <div class="flex items-center">
      <input v-model="isManualTime" type="checkbox" id="manualTime" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary">
      <label for="manualTime" class="ml-2 block text-sm text-text-dark">Especificar hora de fin manualmente</label>
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="startTime" class="block text-sm font-medium text-text-light">Hora de Inicio</label>
        <input v-model="startTime" type="time" id="startTime" class="mt-1 block w-full input-style" required />
      </div>

      <div v-if="!isManualTime">
        <label for="duration" class="block text-sm font-medium text-text-light">Duración</label>
        <select v-model="selectedDuration" id="duration" class="mt-1 block w-full input-style">
          <option value="30">30 Minutos</option>
          <option value="45">45 Minutos</option>
          <option value="60">1 Hora</option>
          <option value="90">1 Hora y Media</option>
          <option value="120">2 Horas</option>
        </select>
      </div>
      
      <div v-if="isManualTime">
        <label for="endTime" class="block text-sm font-medium text-text-light">Hora de Fin</label>
        <input v-model="endTime" type="time" id="endTime" class="mt-1 block w-full input-style" required />
      </div>
    </div>

    <div>
      <label for="notes" class="block text-sm font-medium text-text-light">Notas (Opcional)</label>
      <textarea v-model="formData.notes" id="notes" rows="3" class="mt-1 block w-full input-style"></textarea>
    </div>

    <div class="flex justify-end space-x-4 pt-4">
      <button @click="emit('cancel')" type="button" class="btn-secondary">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Agendar Cita' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.input-style { @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
.btn-primary { @apply px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; }
.btn-secondary { @apply px-6 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; }
</style>