<script setup lang="ts">
import ChangePasswordForm from '@/components/ChangePasswordForm.vue';
import { useUsersStore } from '@/stores/users';

const usersStore = useUsersStore();

async function handlePasswordChange(data: any) {
  const success = await usersStore.changePassword(data);
  if (success) {
    // Opcional: podrías limpiar el formulario si lo manejas aquí
  }
}
</script>
<template>
  <div class="bg-white rounded-lg shadow-md p-6 max-w-lg">
    <h2 class="text-xl font-bold text-text-dark mb-4">Cambiar Contraseña</h2>
    <ChangePasswordForm @submit="handlePasswordChange" />
  </div>
</template>