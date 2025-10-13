<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { computed, onMounted, ref } from 'vue';
import { getGoogleCalendarStatus, unlinkGoogleCalendar } from '@/services/googleCalendarService';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const toast = useToast();

// La vista ahora depende 100% del estado del store.
const isConnected = computed(() => !!authStore.user?.tenant?.googleRefreshToken);

const connectedEmail = ref('');
const isLoading = ref(true);

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const tenantId = computed(() => authStore.user?.tenant?.id);

const googleAuthUrl = computed(() => {
  if (!tenantId.value) return '#';
  return `${baseUrl}/google-calendar/auth?tenantId=${tenantId.value}`;
});

async function checkStatus() {
  isLoading.value = true;
  try {
    // Primero, refrescamos el perfil para obtener los datos más recientes
    await authStore.refreshUserProfile();
    
    // Si después de refrescar está conectado, obtenemos el email
    if (isConnected.value) {
      const response = await getGoogleCalendarStatus();
      connectedEmail.value = response.data.email || '';
    }
  } catch (error) {
    toast.error('No se pudo verificar el estado de la conexión.');
  } finally {
    isLoading.value = false;
  }
}

onMounted(checkStatus);

async function handleUnlink() {
  if (confirm('¿Estás seguro de que deseas desvincular tu cuenta de Google Calendar?')) {
    try {
      await unlinkGoogleCalendar();
      toast.success('Cuenta desvinculada con éxito.');
      // Refrescamos el perfil para que isConnected se vuelva 'false'
      await authStore.refreshUserProfile();
      connectedEmail.value = '';
    } catch (error) {
      toast.error('No se pudo desvincular la cuenta.');
    }
  }
}
</script>
<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-bold text-text-dark mb-4">Integración con Google Calendar</h2>

    <div v-if="isLoading" class="text-center text-text-light">Verificando estado...</div>

    <div v-else-if="isConnected" class="space-y-4">
      <div class="p-4 bg-green-100 text-green-800 rounded-md">
        <p class="font-semibold">¡Conectado!</p>
        <p v-if="connectedEmail" class="text-sm">Sincronizado con: <strong>{{ connectedEmail }}</strong></p>
      </div>
      <button @click="handleUnlink" class="btn-secondary !bg-red-100 !text-danger">
        Desvincular Cuenta
      </button>
    </div>

    <div v-else class="space-y-4">
      <p class="text-text-light">Conecta tu cuenta para sincronizar tu agenda con Google Calendar.</p>
      <a :href="googleAuthUrl" target="_blank" rel="noopener noreferrer" class="inline-block btn-primary">
        1. Conectar con Google
      </a>
      <p class="text-xs text-text-light">Después de autorizar, cierra la pestaña y haz clic en "Verificar Conexión".</p>
      <button @click="checkStatus" class="btn-secondary">
        2. Verificar Conexión
      </button>
    </div>
  </div>
</template>

<style scoped>
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; }
.btn-secondary { @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; }
</style>