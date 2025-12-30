<script setup lang="ts">
import { ref } from 'vue'
import LogoDental from '@/components/icons/LogoDental.vue' 
import { useAuthStore } from '@/stores/auth';
import { RouterLink } from 'vue-router';

const authStore = useAuthStore();
const email = ref('')
const password = ref('')

async function handleLogin() {
  await authStore.login(email.value, password.value);
}
</script>

<template>
  <div class="flex items-stretch min-h-screen relative">
    
    <!-- ENLACE DIRECTO A LANDING PAGE -->
    <a 
      href="https://sonriandes.com" 
      class="absolute top-4 right-4 md:top-6 md:right-8 text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-2 z-10"
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Ir a Página Principal
    </a>

    <!-- Lado Izquierdo (Banner) -->
    <div class="hidden lg:flex w-1/2 bg-primary items-center justify-center p-12 text-white text-center">
      <div class="text-center">
        <LogoDental alt="Logo de sistema" class="mx-auto h-24 w-auto text-white text-center" />
        
        <h1 class="text-3xl font-bold text-center text-text-dark">Bienvenido a SonriAndes</h1>
        <p class="mt-4 text-lg opacity-80">Gestiona tu clínica con una sonrisa.</p>
      </div>
    </div>

    <!-- Lado Derecho (Formulario) -->
    <div class="flex flex-col justify-center items-center w-full lg:w-1/2 bg-light-gray p-8">
      <div class="w-full max-w-md">
        <div class="bg-white p-8 rounded-xl shadow-lg">
          <h2 class="text-3xl font-bold text-text-dark mb-2">Iniciar Sesión</h2>
          <p class="text-text-light mb-6">Ingresa tus credenciales para acceder al sistema.</p>
          
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-text-light">Email</label>
              <input
                v-model="email"
                id="email"
                type="email"
                placeholder="tu@email.com"
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-text-light">Contraseña</label>
              <input
                v-model="password"
                id="password"
                type="password"
                placeholder="••••••••"
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div class="flex items-center justify-end">
              <RouterLink to="/forgot-password" class="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </RouterLink>
            </div>

            <div>
              <button
                type="submit"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Ingresar
              </button>
            </div>
          </form>
        </div>

        <footer class="text-center text-sm text-gray-500 mt-8">
          <RouterLink to="/terms-and-conditions" class="hover:underline">Términos y Condiciones</RouterLink>
          <span class="mx-2">|</span>
          <RouterLink to="/privacy-policy" class="hover:underline">Política de Privacidad</RouterLink>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-style { 
  @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; 
}
</style>