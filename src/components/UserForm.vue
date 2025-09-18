<script setup lang="ts">
import { ref, watch } from 'vue';
import type { User } from '@/types';

const props = defineProps<{
  initialData?: Partial<User> | null;
  loading: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);
const formData = ref<any>({});

watch(() => props.initialData, (newData) => {
  // Cuando recibimos datos, los clonamos en el estado local del formulario
  formData.value = { ...newData };
}, { immediate: true, deep: true });

function handleSubmit() {
  emit('submit', formData.value);
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="fullName" class="block text-sm font-medium text-text-light">Nombre Completo</label>
      <input v-model="formData.fullName" type="text" id="fullName" class="mt-1 block w-full input-style" required />
    </div>
    <div>
      <label for="email" class="block text-sm font-medium text-text-light">Email</label>
      <input v-model="formData.email" type="email" id="email" class="mt-1 block w-full input-style" required />
    </div>
    <div v-if="!formData.id">
      <label for="password" class="block text-sm font-medium text-text-light">Contraseña</label>
      <input v-model="formData.password" type="password" id="password" class="mt-1 block w-full input-style" required minlength="6" />
    </div>
    <div>
      <label for="role" class="block text-sm font-medium text-text-light">Rol</label>
      <select v-model="formData.role" id="role" class="mt-1 block w-full input-style" required>
        <option disabled :value="undefined">Seleccione un rol...</option>
        <option value="dentist">Doctor</option>
        <option value="assistant">Asistente</option>
        <option value="admin">Administrador</option>
      </select>
    </div>
    <div class="flex justify-end space-x-4 pt-4 border-t mt-6">
      <button @click="emit('cancel')" type="button" class="btn-secondary">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Guardar Usuario' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
/* ESTILOS AÑADIDOS */
.input-style { 
  @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; 
}
.btn-primary { 
  @apply px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold disabled:bg-opacity-50 disabled:cursor-not-allowed; 
}
.btn-secondary { 
  @apply px-6 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; 
}
</style>