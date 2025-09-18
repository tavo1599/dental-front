<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const token = ref('');
const password = ref('');
const passwordConfirm = ref('');

onMounted(() => {
  token.value = route.query.token as string || '';
});

function handleSubmit() {
  if (password.value !== passwordConfirm.value) {
    alert('Las contraseñas no coinciden.');
    return;
  }
  authStore.handleResetPassword(token.value, password.value);
}
</script>
<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="px-8 py-6 text-left bg-white shadow-lg rounded-lg w-full max-w-md">
      <h3 class="text-2xl font-bold text-center">Restablecer Contraseña</h3>
      <form @submit.prevent="handleSubmit">
        <div class="mt-4">
          <label class="block">Nueva Contraseña</label>
          <input v-model="password" type="password" class="w-full px-4 py-2 mt-2 border rounded-md" required />
        </div>
        <div class="mt-4">
          <label class="block">Confirmar Nueva Contraseña</label>
          <input v-model="passwordConfirm" type="password" class="w-full px-4 py-2 mt-2 border rounded-md" required />
        </div>
        <button type="submit" class="w-full btn-primary mt-4">Guardar Nueva Contraseña</button>
      </form>
    </div>
  </div>
</template>