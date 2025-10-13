<script setup lang="ts">
import { ref } from 'vue';
defineProps<{ loading: boolean }>();
const emit = defineEmits(['submit', 'cancel']);

const formData = ref({
  clinicName: '',
  clinicAddress: '', // <-- Campo añadido
  clinicPhone: '',   // <-- Campo añadido
  clinicEmail: '',   // <-- Campo añadido
  fullName: '',
  email: '',
  password: '',
  phone: '', 
});
</script>

<template>
  <form @submit.prevent="emit('submit', formData)" class="space-y-4">
    <div class="border-b border-gray-600 pb-4">
      <h3 class="text-lg font-semibold text-gray-200">Datos de la Clínica</h3>
      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-400">Nombre de la Clínica</label>
          <input v-model="formData.clinicName" type="text" class="mt-1 block w-full input-style-dark" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-400">Teléfono de la Clínica</label>
          <input v-model="formData.clinicPhone" type="tel" class="mt-1 block w-full input-style-dark" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-400">Email de la Clínica</label>
          <input v-model="formData.clinicEmail" type="email" class="mt-1 block w-full input-style-dark" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-400">Dirección de la Clínica</label>
          <input v-model="formData.clinicAddress" type="text" class="mt-1 block w-full input-style-dark" />
        </div>
      </div>
    </div>

    <div class="pt-4">
      <h3 class="text-lg font-semibold text-gray-200">Datos del Usuario Administrador</h3>
      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-400">Nombre Completo del Admin</label>
          <input v-model="formData.fullName" type="text" class="mt-1 block w-full input-style-dark" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-400">Teléfono del Admin</label>
          <input v-model="formData.phone" type="tel" class="mt-1 block w-full input-style-dark" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-400">Email del Admin</label>
          <input v-model="formData.email" type="email" class="mt-1 block w-full input-style-dark" required />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-400">Contraseña para el Admin</label>
          <input v-model="formData.password" type="password" class="mt-1 block w-full input-style-dark" required minlength="6" />
        </div>
      </div>
    </div>

    <div class="flex justify-end space-x-4 pt-4">
      <button @click="emit('cancel')" type="button" class="btn-secondary">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Creando...' : 'Crear Clínica' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.input-style-dark { @apply bg-gray-700 border-gray-600 text-white rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; }
.btn-secondary { @apply px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 font-semibold; }
</style>