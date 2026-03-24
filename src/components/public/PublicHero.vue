<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  tenantData: any;
  whatsappLink: string | null;
}>();

// Obtenemos el tema seleccionado (si no hay, por defecto es 'modern')
const theme = computed(() => props.tenantData?.websiteConfig?.theme || 'modern');

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
  <header 
    id="inicio" 
    class="relative overflow-hidden flex transition-all duration-700"
    :class="{
        'pt-32 pb-48 lg:pt-48 lg:pb-64 items-center justify-center bg-gray-900': theme === 'modern',
        'pt-32 pb-32 lg:pt-48 lg:pb-48 items-center justify-start bg-slate-900 text-left': theme === 'classic',
        'pt-32 pb-24 lg:pt-40 lg:pb-32 items-center justify-center bg-white': theme === 'minimal'
    }"
  >
     
     <!-- FONDO E IMAGEN (Oculto en minimalista para un look más limpio) -->
     <div v-if="theme !== 'minimal'" class="absolute inset-0 z-0">
         <div 
            class="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-110"
            :style="{ backgroundImage: heroImageStyle }"
         ></div>
         <!-- Degradado oscuro para que el texto resalte -->
         <div class="absolute inset-0" :class="theme === 'modern' ? 'bg-gradient-to-r from-gray-900/95 via-gray-900/70 to-transparent' : 'bg-black/60'"></div>
     </div>

     <!-- CONTENIDO PRINCIPAL -->
     <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div 
            class="animate-fade-in-up" 
            :class="{ 
                'max-w-3xl text-center mx-auto': theme === 'modern' || theme === 'minimal', 
                'max-w-2xl text-left': theme === 'classic' 
            }"
        >
           <!-- TÍTULO -->
           <h1 
              class="font-extrabold mb-6 leading-tight transition-all duration-500"
              :class="{
                 'text-4xl md:text-6xl lg:text-7xl text-white drop-shadow-lg': theme === 'modern',
                 'text-4xl md:text-5xl lg:text-6xl text-white font-serif tracking-wide drop-shadow-md': theme === 'classic',
                 'text-4xl md:text-5xl lg:text-6xl text-gray-900': theme === 'minimal'
              }"
           >
              {{ tenantData?.websiteConfig?.welcomeMessage || `Bienvenido a ${tenantData?.name}` }}
           </h1>
           
           <!-- SUBTÍTULO -->
           <div v-if="tenantData?.websiteConfig?.subTitle" class="flex mb-8" :class="{ 'items-center justify-center': theme === 'modern' || theme === 'minimal', 'items-center justify-start': theme === 'classic' }">
              <div v-if="theme !== 'minimal'" class="h-12 w-1 bg-primary mr-4 rounded-full"></div>
              <p 
                class="text-xl md:text-2xl font-light transition-all duration-500" 
                :class="{ 
                    'text-gray-100': theme === 'modern', 
                    'text-gray-200 italic font-serif': theme === 'classic',
                    'text-gray-500': theme === 'minimal'
                }"
              >
                  {{ tenantData.websiteConfig.subTitle }}
              </p>
           </div>
           
           <!-- BOTONES DE ACCIÓN -->
           <div class="flex flex-col sm:flex-row gap-4" :class="{ 'justify-center': theme === 'modern' || theme === 'minimal', 'justify-start': theme === 'classic' }">
              
              <a v-if="whatsappLink" :href="whatsappLink" target="_blank" class="py-4 px-8 font-bold text-lg transition-all duration-300 text-center flex items-center justify-center gap-2 transform hover:-translate-y-1 text-white"
                 :class="{
                   'bg-primary rounded-full shadow-xl hover:bg-opacity-90': theme === 'modern',
                   'bg-primary rounded-sm shadow-md hover:bg-opacity-90': theme === 'classic',
                   'bg-primary rounded-xl shadow-md hover:shadow-lg': theme === 'minimal'
                 }">
                 <span>Agendar Cita</span>
                 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </a>
              
              <a href="#tratamientos" class="py-4 px-8 font-bold text-lg transition-all duration-300 text-center"
                 :class="{
                   'bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full hover:bg-white/20': theme === 'modern',
                   'border-2 border-white text-white rounded-sm hover:bg-white hover:text-gray-900': theme === 'classic',
                   'bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200': theme === 'minimal'
                 }">
                 Ver Tratamientos
              </a>
           </div>
        </div>
     </div>

     <!-- DIVISOR ONDA (Wave) - Solo se muestra en el tema moderno -->
     <div v-if="theme === 'modern'" class="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
        <svg class="relative block w-[calc(100%+1.3px)] h-[80px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="fill-gray-50"></path>
        </svg>
     </div>
  </header>
</template>

<style scoped>
.text-primary { color: var(--clinic-primary); }
.bg-primary { background-color: var(--clinic-primary); }
.border-primary { border-color: var(--clinic-primary); }
.fill-gray-50 { fill: #f9fafb; }

/* Tipografía Serif para el tema clásico */
.font-serif { font-family: 'Georgia', 'Times New Roman', serif; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
</style>