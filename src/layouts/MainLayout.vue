<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useAppointmentsStore } from '@/stores/appointments';
import { onMounted, computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import IconLogout from '@/components/icons/IconLogout.vue';
import ImpersonationBanner from '@/components/ImpersonationBanner.vue';
import AnnouncementBanner from '@/components/AnnouncementBanner.vue';

// --- IMPORTS AÑO NUEVO ---
// Reemplazamos ChristmasLights y ChristmasHatWrapper
import FireworksHeader from '@/components/FireworksHeader.vue';
import NewYearHatWrapper from '@/components/NewYearHatWrapper.vue';
import VirtualAssistant from '@/components/VirtualAssistant.vue';

const route = useRoute();
const authStore = useAuthStore();
const appointmentsStore = useAppointmentsStore();
const { nextDayPending } = storeToRefs(appointmentsStore);

// --- ESTADO PARA EL MENÚ MÓVIL ---
const isSidebarOpen = ref(false);

// Cerrar el menú automáticamente al cambiar de ruta (navegar)
watch(
  () => route.fullPath,
  () => {
    isSidebarOpen.value = false;
  }
);

// --- LOGO ---
const logoSrc = computed(() => {
  const logoPath = authStore.user?.tenant?.logoUrl;
  if (!logoPath) return null;
  if (logoPath.startsWith('http')) {
    return logoPath;
  }
  return `${import.meta.env.VITE_API_BASE_URL}${logoPath}`;
});

// --- CARRUSEL DE CITAS (Assistant) ---
const carouselItems = computed(() => {
  if (nextDayPending.value && nextDayPending.value.length > 0) {
    return [...nextDayPending.value, ...nextDayPending.value];
  }
  return [];
});

const animationDuration = computed(() => {
  const itemCount = nextDayPending.value.length;
  if (itemCount === 0) return '0s';
  const duration = itemCount * 10; 
  return `${duration}s`;
});

onMounted(() => {
  if (authStore.user?.role === 'assistant') {
    appointmentsStore.fetchNextDayPending();
  }
});
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-100 font-sans overflow-hidden relative">
    
    <!-- 1. FUEGOS ARTIFICIALES (Año Nuevo) -->
    

    <ImpersonationBanner />
    <AnnouncementBanner />

    <!-- HEADER MÓVIL (Solo visible en pantallas pequeñas 'md:hidden') -->
    <div class="md:hidden bg-slate-800 text-white p-4 flex items-center justify-between shadow-md flex-shrink-0 z-20 relative">
      
      <div class="flex items-center gap-2">
        
        
           <img src="/logo.svg" class="h-8 w-8 relative z-10" alt="Logo" />
        
        <span class="font-bold text-lg tracking-wide ml-2">SonriAndes</span>
      </div>
      <button 
        @click="isSidebarOpen = !isSidebarOpen" 
        class="p-2 rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <div class="flex flex-1 overflow-hidden relative">
      
      <!-- BACKDROP -->
      <div 
        v-if="isSidebarOpen" 
        class="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity"
        @click="isSidebarOpen = false"
      ></div>

      <!-- SIDEBAR (ASIDE) -->
      <aside 
        class="fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 flex flex-col transition-transform duration-300 ease-in-out transform md:relative md:translate-x-0 flex-shrink-0 shadow-xl md:shadow-none"
        :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="flex justify-end p-2 md:hidden">
           <button @click="isSidebarOpen = false" class="text-slate-400 hover:text-white p-2">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>

        <!-- HEADER DEL SIDEBAR -->
        <div class="py-6 flex flex-col justify-center border-b border-slate-700 text-center relative">
          
          <!-- LOGO DE CLÍNICA CON SOMBRERO -->
          <div v-if="logoSrc" class="px-4 mb-3 flex justify-center">
            
               <img :src="logoSrc" alt="Logo Clínica" class="max-h-24 object-contain relative z-10" />
            
          </div>
    
          <p v-if="authStore.user?.tenant" class="text-lg text-white font-bold text-center px-2 leading-tight relative z-10 mt-1">
            {{ authStore.user.tenant.name }}
          </p>

          <div class="mt-4 flex items-center justify-center gap-2 opacity-70">
            <img src="/logo.svg" class="h-4 w-4" alt="Logo de SonriAndes" />
            <span class="text-xs text-slate-300 font-semibold uppercase tracking-wider">SonriAndes</span>
          </div>
        </div>
        
        <!-- Menú de Navegación -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <RouterLink to="/dashboard" class="nav-item" active-class="active">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
             Dashboard
          </RouterLink>
          <RouterLink to="/patients" class="nav-item" active-class="active">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
             Pacientes
          </RouterLink>
          <RouterLink to="/appointments" class="nav-item" active-class="active">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             Agenda
          </RouterLink>
          <RouterLink to="/treatments" class="nav-item" active-class="active">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
             Tratamientos
          </RouterLink>
          <RouterLink to="/expenses" class="nav-item" active-class="active">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             Gastos
          </RouterLink>
          <RouterLink to="/cash-management" class="nav-item" active-class="active">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
             Caja Diaria
          </RouterLink>
          <RouterLink v-if="authStore.user?.role === 'admin'" to="/reports" class="nav-item" active-class="active">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             Reportes
          </RouterLink>
          <RouterLink v-if="authStore.user?.role === 'admin'" to="/settings" class="nav-item" active-class="active">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             Configuración
          </RouterLink>
        </nav>

        <div class="px-4 py-4 border-t border-slate-700 flex items-center justify-between">
          <div class="text-white text-sm overflow-hidden">
            <p class="font-semibold truncate">{{ authStore.user?.fullName }}</p>
            <p class="text-xs text-slate-400 capitalize">{{ authStore.user?.role }}</p>
          </div>
          <button @click="authStore.logout()" class="p-2 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white" title="Cerrar Sesión">
            <IconLogout alt="Cierre de sesion" class="h-6 w-6" />
          </button>
        </div>
      </aside>

      <main class="flex-1 flex flex-col overflow-hidden w-full">
        <!-- Header de Asistente (Pendientes) -->
        <header v-if="authStore.user?.role === 'assistant'" class="flex justify-start items-center p-0 bg-white border-b border-gray-200 h-12 md:h-16 overflow-hidden flex-shrink-0">
          <div v-if="nextDayPending && nextDayPending.length > 0" class="w-full flex items-center">
            <div class="bg-yellow-100 text-yellow-800 font-bold px-3 md:px-4 self-stretch flex items-center flex-shrink-0 text-xs md:text-base">
              <span>PENDIENTES</span>
            </div>
            <div class="flex-1 overflow-hidden whitespace-nowrap">
              <div 
                class="inline-block animate-scroll"
                :style="{ animationDuration: animationDuration }"
              >
                <span v-for="(appt, index) in carouselItems" :key="index" class="mx-6 text-text-light text-sm md:text-base">
                  <span class="font-semibold text-primary">{{ appt.patient.fullName }}</span> - Mañana a las {{ new Date(appt.startTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="px-4 text-text-light flex items-center h-full text-sm md:text-base">
            <span>No hay citas pendientes de confirmar para mañana.</span>
          </div>
        </header>
        
        <!-- Contenido Principal (Router View) -->
        <div class="flex-1 p-4 md:p-6 overflow-y-auto bg-[rgb(var(--color-background))] w-full">
          <RouterView />
        </div>
      </main>
    </div>
    <VirtualAssistant />
  </div>
</template>

<style scoped>
@keyframes scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.animate-scroll {
  animation-name: scroll;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  display: inline-block;
}

/* Estilos para los items de navegación */
.nav-item {
  @apply flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors duration-150;
}

.nav-item.active {
  @apply bg-slate-700 text-white font-semibold border-l-4 border-blue-500;
}
</style>