<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { RouterLink, RouterView } from 'vue-router';

const authStore = useAuthStore();
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-text-dark mb-4">Configuración</h1>
    
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8 overflow-x-auto">
        <RouterLink 
          to="/settings/users"
          class="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap"
          active-class="!border-primary !text-primary"
        >
          Usuarios
        </RouterLink>

        <!-- NUEVO ENLACE: MI PÁGINA WEB -->
        <RouterLink 
          v-if="authStore.user?.role === 'admin'"
          to="/settings/website"
          class="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap flex items-center gap-2"
          active-class="!border-primary !text-primary"
        >
          Mi Página Web
          <span class="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">NUEVO</span>
        </RouterLink>
        <!-- --------------------------- -->

        <RouterLink 
          to="/settings/security"
          class="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap"
          active-class="!border-primary !text-primary"
        >
          Seguridad
        </RouterLink>
        <RouterLink 
          to="/settings/appearance"
          class="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap"
          active-class="!border-primary !text-primary"
        >
          Apariencia
        </RouterLink>
        <RouterLink 
          to="/settings/integrations"
          class="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap"
          active-class="!border-primary !text-primary"
        >
          Integraciones
        </RouterLink>
        <RouterLink 
          to="/settings/consents"
          class="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap"
          active-class="!border-primary !text-primary"
        >
          Consentimientos
        </RouterLink>
        <RouterLink 
          to="/settings/audit"
          class="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap"
          active-class="!border-primary !text-primary"
        >
          Auditoría
        </RouterLink>
      </nav>
    </div>
    
    <RouterView />
  </div>
</template>