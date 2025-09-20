<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';

const authStore = useAuthStore();
const tenantId = authStore.user?.tenant?.id;

const googleAuthUrl = computed(() => {
  if (!tenantId) return '#';
  return `http://localhost:3000/google-calendar/auth?tenantId=${tenantId}`;
});

const isConnected = computed(() => !!authStore.user?.tenant?.googleRefreshToken);

function checkConnection() {
  authStore.refreshUserProfile();
}
</script>
<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-bold text-text-dark mb-4">Integración con Google Calendar</h2>
    
    <div v-if="isConnected" class="p-4 bg-green-100 text-green-800 rounded-md space-y-2">
      <p class="font-semibold">¡Conectado! Tu agenda está sincronizada con Google Calendar.</p>
      <button @click="checkConnection" class="text-sm font-semibold text-green-900 hover:underline">
        Refrescar estado
      </button>
    </div>

    <div v-else class="space-y-4">
      <p class="text-text-light">Conecta tu cuenta de Google para que las citas creadas se añadan automáticamente a tu Google Calendar.</p>
      <div class="flex items-center gap-4">
        <a 
          :href="googleAuthUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="inline-block btn-primary"
        >
          1. Conectar con Google
        </a>
        <button @click="checkConnection" class="btn-secondary">
          2. Verificar Conexión
        </button>
      </div>
      <p class="text-xs text-text-light">Después de autorizar en la nueva pestaña, ciérrala y haz clic en "Verificar Conexión".</p>
    </div>
  </div>
</template>