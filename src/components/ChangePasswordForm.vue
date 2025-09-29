<script setup lang="ts">
import { ref } from 'vue';
import { useUsersStore } from '@/stores/users';
import { storeToRefs } from 'pinia';

const usersStore = useUsersStore();
const { isLoading } = storeToRefs(usersStore);

const emit = defineEmits(['submit']);
const formData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const passwordError = ref('');

function handleSubmit() {
  passwordError.value = '';
  if (formData.value.newPassword !== formData.value.confirmPassword) {
    passwordError.value = 'Las nuevas contraseñas no coinciden.';
    return;
  }
  
  emit('submit', {
    currentPassword: formData.value.currentPassword,
    newPassword: formData.value.newPassword,
  });
  
  // Limpia el formulario después de enviar
  formData.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center">
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
        <svg class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      </div>
      <p class="mt-4 text-sm text-text-light">
        Para tu seguridad, por favor ingresa tu contraseña actual antes de establecer una nueva.
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="currentPassword" class="block text-sm font-medium text-text-dark">Contraseña Actual</label>
        <input v-model="formData.currentPassword" type="password" id="currentPassword" class="input-style w-full mt-1" required />
      </div>
      <div>
        <label for="newPassword" class="block text-sm font-medium text-text-dark">Nueva Contraseña</label>
        <input v-model="formData.newPassword" type="password" id="newPassword" class="input-style w-full mt-1" required />
        <p class="text-xs text-text-light mt-1">Mínimo 6 caracteres.</p>
      </div>
      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-text-dark">Confirmar Nueva Contraseña</label>
        <input v-model="formData.confirmPassword" type="password" id="confirmPassword" class="input-style w-full mt-1" required />
        <p v-if="passwordError" class="text-sm text-danger mt-1">{{ passwordError }}</p>
      </div>
      <div class="pt-4">
        <button type="submit" class="btn-primary w-full" :disabled="isLoading">
          {{ isLoading ? 'Actualizando...' : 'Actualizar Contraseña' }}
        </button>
      </div>
    </form>
  </div>
</template>