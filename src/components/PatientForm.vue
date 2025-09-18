<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { usePatientsStore } from '@/stores/patients';
import type { Patient } from '@/types';
import { Gender } from '@/types';
import { useLocations } from '@/composables/useLocations';
import { lookupDni } from '@/services/patientService';
import { useToast } from 'vue-toastification';

const props = defineProps<{
  initialData?: Patient | null;
}>();

const emit = defineEmits(['patient-saved', 'cancel']);
const patientsStore = usePatientsStore();

const patient = ref<Partial<Patient>>({});
const isLookingUpDni = ref(false); // Estado de carga para la búsqueda de DNI
const toast = useToast();

async function handleDniLookup() {
  if (!patient.value.dni || patient.value.dni.length !== 8) {
    toast.warning('Por favor, ingrese un DNI válido de 8 dígitos.');
    return;
  }
  isLookingUpDni.value = true;
  try {
    const response = await lookupDni(patient.value.dni);
    patient.value.fullName = response.data.fullName;
    toast.success('Paciente encontrado.');
  } catch (error) {
    toast.error('No se encontró el DNI o hubo un error.');
  } finally {
    isLookingUpDni.value = false;
  }
}


const {
  loadLocations,
  departments,
  provinces,
  districts,
  selectedDepartment,
  selectedProvince
} = useLocations();

onMounted(() => {
  loadLocations();
});

watch(() => props.initialData, (newData) => {
  if (newData) {
    patient.value = { ...newData };
    selectedDepartment.value = newData.department || '';
    selectedProvince.value = newData.province || '';
  } else {
    patient.value = {
      fullName: '',
      dni: '',
      birthDate: '',
      phone: '',
      email: '',
      address: '',
      department: '',
      province: '',
      district: '',
      gender: undefined,
      allergies: '',
    };
    selectedDepartment.value = '';
    selectedProvince.value = '';
  }
}, { immediate: true, deep: true });

watch(selectedDepartment, (newDepartmentName) => {
  if (patient.value.department !== newDepartmentName) {
    patient.value.province = '';
    patient.value.district = '';
    selectedProvince.value = '';
  }
  patient.value.department = newDepartmentName;
});

watch(selectedProvince, (newProvinceName) => {
  if (patient.value.province !== newProvinceName) {
    patient.value.district = '';
  }
  patient.value.province = newProvinceName;
});

async function handleSubmit() {
  const patientDataToSend: { [key: string]: any } = {};
  for (const key in patient.value) {
    const value = patient.value[key as keyof typeof patient.value];
    if (value) {
      patientDataToSend[key] = value;
    }
  }

  let success = false;
  if (patientDataToSend.id) {
    success = await patientsStore.updatePatient(patientDataToSend.id, patientDataToSend);
  } else {
    success = await patientsStore.createPatient(patientDataToSend as Omit<Patient, 'id'>);
  }

  if (success) {
    emit('patient-saved');
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
    <!-- Columna Izquierda: Datos Personales y Contacto -->
    <div class="space-y-6">
      <div>
        <label for="fullName" class="block text-sm font-medium text-text-light">Nombre Completo</label>
        <input v-model="patient.fullName" type="text" id="fullName" class="mt-1 block w-full input-style" required />
      </div>
      <div>
  <label for="dni" class="block text-sm font-medium text-text-light">DNI</label>
  <div class="mt-1 flex items-center gap-2">
    <input v-model="patient.dni" type="text" id="dni" maxlength="8" class="block w-full input-style" required />
    <button @click="handleDniLookup" type="button" class="p-2.5 bg-secondary text-white rounded-lg hover:bg-opacity-80" :disabled="isLookingUpDni">
      <svg v-if="!isLookingUpDni" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      <svg v-else class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </button>
  </div>
</div>
      <div>
        <label for="birthDate" class="block text-sm font-medium text-text-light">Fecha de Nacimiento</label>
        <input v-model="patient.birthDate" type="date" id="birthDate" class="mt-1 block w-full input-style" required />
      </div>
      <div>
        <label for="gender" class="block text-sm font-medium text-text-light">Sexo</label>
        <select v-model="patient.gender" id="gender" class="mt-1 block w-full input-style">
          <option :value="undefined" disabled>Seleccione...</option>
          <option :value="Gender.MALE">Masculino</option>
          <option :value="Gender.FEMALE">Femenino</option>
          <option :value="Gender.OTHER">Otro</option>
        </select>
      </div>
       <div>
        <label for="phone" class="block text-sm font-medium text-text-light">Teléfono</label>
        <input v-model="patient.phone" type="tel" id="phone" class="mt-1 block w-full input-style" required />
      </div>
      <div>
        <label for="email" class="block text-sm font-medium text-text-light">Email (Opcional)</label>
        <input v-model="patient.email" type="email" id="email" class="mt-1 block w-full input-style" />
      </div>
    </div>

    <!-- Columna Derecha: Dirección y Datos Clínicos -->
    <div class="space-y-6">
       <div>
        <label for="department" class="block text-sm font-medium text-text-light">Departamento</label>
        <select v-model="selectedDepartment" id="department" class="mt-1 block w-full input-style">
          <option disabled value="">Seleccione...</option>
          <option v-for="dep in departments" :key="dep" :value="dep">{{ dep }}</option>
        </select>
      </div>
      <div>
        <label for="province" class="block text-sm font-medium text-text-light">Provincia</label>
        <select v-model="selectedProvince" id="province" class="mt-1 block w-full input-style" :disabled="!selectedDepartment">
          <option disabled value="">Seleccione...</option>
          <option v-for="prov in provinces" :key="prov" :value="prov">{{ prov }}</option>
        </select>
      </div>
      <div>
        <label for="district" class="block text-sm font-medium text-text-light">Distrito</label>
        <select v-model="patient.district" id="district" class="mt-1 block w-full input-style" :disabled="!selectedProvince">
          <option disabled value="">Seleccione...</option>
          <option v-for="dist in districts" :key="dist" :value="dist">{{ dist }}</option>
        </select>
      </div>
      <div>
        <label for="address" class="block text-sm font-medium text-text-light">Dirección (Opcional)</label>
        <input v-model="patient.address" type="text" id="address" class="mt-1 block w-full input-style" />
      </div>
      <div>
        <label for="allergies" class="block text-sm font-medium text-text-light">Alergias (Opcional)</label>
        <textarea v-model="patient.allergies" id="allergies" rows="4" class="mt-1 block w-full input-style"></textarea>
      </div>
    </div>

    <!-- Botones -->
    <div class="md:col-span-2 flex justify-end space-x-4 mt-6 border-t pt-6">
      <button @click="emit('cancel')" type="button" class="px-6 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold">
        Cancelar
      </button>
      <button type="submit" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold" :disabled="patientsStore.isLoading">
        {{ patientsStore.isLoading ? 'Guardando...' : 'Guardar Paciente' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
/* Estilo base para los inputs para no repetir clases */
.input-style {
  @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary;
}
</style>