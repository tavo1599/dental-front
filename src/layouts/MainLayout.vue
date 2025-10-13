<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useAppointmentsStore } from '@/stores/appointments';
import { onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import IconLogout from '@/components/icons/IconLogout.vue';
import ImpersonationBanner from '@/components/ImpersonationBanner.vue';
import AnnouncementBanner from '@/components/AnnouncementBanner.vue';

const authStore = useAuthStore();

const logoSrc = computed(() => {
  // Ahora lee la URL directamente del tenant en el store
  const logoPath = authStore.user?.tenant?.logoUrl;
  if (logoPath) {
    return `${import.meta.env.VITE_API_BASE_URL}${logoPath}`;
  }
  return null;
});
const appointmentsStore = useAppointmentsStore();
const { nextDayPending } = storeToRefs(appointmentsStore);

// Duplicamos la lista para un efecto de carrusel infinito
const carouselItems = computed(() => {
  if (nextDayPending.value && nextDayPending.value.length > 0) {
    return [...nextDayPending.value, ...nextDayPending.value];
  }
  return [];
});

// Hacemos que la velocidad de la animación sea dinámica
const animationDuration = computed(() => {
  const itemCount = nextDayPending.value.length;
  if (itemCount === 0) return '0s';
  const duration = itemCount * 10; // 10 segundos por item
  return `${duration}s`;
});

onMounted(() => {
  if (authStore.user?.role === 'assistant') {
    appointmentsStore.fetchNextDayPending();
  }
});
</script>

<template>
  <div class="flex flex-col h-screen bg-transparent font-sans overflow-hidden">
    <ImpersonationBanner />
    <AnnouncementBanner />

    <div class="flex flex-1 overflow-hidden">
      <aside class="w-64 flex-shrink-0 bg-slate-800 flex flex-col">
        <div class="py-2 flex flex-col justify-center border-b border-slate-700 text-center">

          <div v-if="logoSrc" class="">
    <img :src="logoSrc" alt="Logo de la Clínica" class="max-h-32 w-auto mx-auto" />
  </div>
    
    <p v-if="authStore.user?.tenant" class="text-xl text-white font-bold text-center px-2">
      {{ authStore.user.tenant.name }}
    </p>

    <div class="mt-2 flex items-center justify-center gap-2">
      <img src="/logo.svg" class="h-5 w-5" alt="Logo de SonriAndes" />
      <span class="text-xs text-slate-400 font-semibold">SonriAndes</span>
    </div>

  </div>
        
        <nav class="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <RouterLink to="/dashboard" class="flex items-center px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg" active-class="bg-slate-700 text-white font-semibold">Dashboard</RouterLink>
          <RouterLink to="/patients" class="flex items-center px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg" active-class="bg-slate-700 text-white font-semibold">Pacientes</RouterLink>
          <RouterLink to="/appointments" class="flex items-center px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg" active-class="bg-slate-700 text-white font-semibold">Agenda</RouterLink>
          <RouterLink to="/treatments" class="flex items-center px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg" active-class="bg-slate-700 text-white font-semibold">Tratamientos</RouterLink>
          <RouterLink to="/expenses"  class="flex items-center px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg" active-class="bg-slate-700 text-white font-semibold">Gastos</RouterLink>
          <RouterLink to="/cash-management"  class="flex items-center px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg" active-class="bg-slate-700 text-white font-semibold">Caja Diaria</RouterLink>
          <RouterLink v-if="authStore.user?.role === 'admin'" to="/reports"  class="flex items-center px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg" active-class="bg-slate-700 text-white font-semibold">Reportes</RouterLink>
          <RouterLink v-if="authStore.user?.role === 'admin'" to="/settings" class="flex items-center px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg" active-class="bg-slate-700 text-white font-semibold">Configuración</RouterLink>
        </nav>

        <div class="px-4 py-4 border-t border-slate-700 flex items-center justify-between">
          <div class="text-white text-sm">
            <p class="font-semibold">{{ authStore.user?.fullName }}</p>
            <p class="text-xs text-slate-400 capitalize">{{ authStore.user?.role }}</p>
          </div>
          <button @click="authStore.logout()" class="p-2 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white" title="Cerrar Sesión">
            <IconLogout alt="Cierre de sesion" class="h-6 w-6" />
          </button>
        </div>
      </aside>

      <main class="flex-1 flex flex-col overflow-hidden">
        <header v-if="authStore.user?.role === 'assistant'" class="flex justify-start items-center p-0 bg-white border-b border-gray-200 h-16 overflow-hidden flex-shrink-0">
          <div v-if="nextDayPending && nextDayPending.length > 0" class="w-full flex items-center">
            <div class="bg-yellow-100 text-yellow-800 font-bold px-4 self-stretch flex items-center flex-shrink-0">
              <span>PENDIENTES</span>
            </div>
            <div class="flex-1 overflow-hidden whitespace-nowrap">
              <div 
                class="inline-block animate-scroll"
                :style="{ animationDuration: animationDuration }"
              >
                <span v-for="(appt, index) in carouselItems" :key="index" class="mx-6 text-text-light">
                  <span class="font-semibold text-primary">{{ appt.patient.fullName }}</span> - Mañana a las {{ new Date(appt.startTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="px-4 text-text-light flex items-center h-full">
            <span>No hay citas pendientes de confirmar para mañana.</span>
          </div>
        </header>
        
        
        <div class="flex-1 p-6 overflow-y-auto bg-[rgb(var(--color-background))]">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@keyframes scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.animate-scroll {
  animation-name: scroll;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  display: inline-block;
}
</style>