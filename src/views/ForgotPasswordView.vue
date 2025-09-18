<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const email = ref('');
const submitted = ref(false);

async function handleSubmit() {
  await authStore.handleForgotPassword(email.value);
  submitted.value = true;
}
</script>
<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="px-8 py-6 text-left bg-white shadow-lg rounded-lg w-full max-w-md">
      <h3 class="text-2xl font-bold text-center">Recuperar Contraseña</h3>
      <div v-if="submitted" class="mt-4 text-center">
        <p class="text-text-light">Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.</p>
        <RouterLink to="/login" class="text-primary font-semibold hover:underline">Volver a Login</RouterLink>
      </div>
      <form v-else @submit.prevent="handleSubmit">
        <p class="mt-4 text-center text-text-light">Ingresa tu correo electrónico y te enviaremos un enlace para recuperar tu cuenta.</p>
        <div class="mt-4">
          <input v-model="email" type="email" placeholder="Email" class="w-full px-4 py-2 mt-2 border rounded-md" required />
        </div>
        <button type="submit" class="w-full btn-primary mt-4">Enviar Enlace</button>
      </form>
    </div>
  </div>
</template>