<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  tenantData: any;
  whatsappLink: string | null;
}>();

// Helper para imagen de fondo
const heroImageStyle = computed(() => {
  const url = props.tenantData?.websiteConfig?.heroImageUrl;
  if (url && url.startsWith('http')) return `url('${url}')`;
  if (url) return `url('${import.meta.env.VITE_API_BASE_URL}${url}')`;
  // Fallback por defecto
  return `url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop')`;
});
</script>

<template>
  <header id="inicio" class="relative bg-gray-900 pt-32 pb-48 lg:pt-48 lg:pb-64 overflow-hidden flex items-center justify-center">
     
     <!-- Fondo con Overlay -->
     <div class="absolute inset-0 z-0">
         <div 
            class="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-110"
            :style="{ backgroundImage: heroImageStyle }"
         ></div>
         <div class="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/70 to-transparent"></div>
     </div>

     <!-- Contenido -->
     <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl animate-fade-in-up">
           <h1 class="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
              {{ tenantData?.websiteConfig?.welcomeMessage || `Bienvenido a ${tenantData?.name}` }}
           </h1>
           <div v-if="tenantData?.websiteConfig?.subTitle" class="flex items-center mb-8">
              <div class="h-12 w-1 bg-primary mr-4 rounded-full"></div>
              <p class="text-xl md:text-2xl text-gray-100 font-light">
                  {{ tenantData.websiteConfig.subTitle }}
              </p>
           </div>
           
           <div class="flex flex-col sm:flex-row gap-4">
              <a v-if="whatsappLink" :href="whatsappLink" target="_blank" class="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-xl hover:bg-opacity-90 transition-transform transform hover:-translate-y-1 text-center flex items-center justify-center gap-2">
                 <span>Agendar Cita</span>
                 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </a>
              <a href="#tratamientos" class="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all text-center">
                 Ver Tratamientos
              </a>
           </div>
        </div>
     </div>

     <!-- DIVISOR ONDA (Wave) - INVERTIDO -->
     <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
        <svg class="relative block w-[calc(100%+1.3px)] h-[80px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <!-- El fill debe coincidir con el fondo de la siguiente sección (#f9fafb) -->
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="fill-gray-50"></path>
        </svg>
     </div>
  </header>
</template>

<style scoped>
.text-primary { color: var(--clinic-primary); }
.bg-primary { background-color: var(--clinic-primary); }
.border-primary { border-color: var(--clinic-primary); }
.fill-gray-50 { fill: #f9fafb; } /* Color de fondo de la siguiente sección */

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
</style>    