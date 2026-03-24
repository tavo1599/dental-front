<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  tenantData: any;
}>();

// Leemos el tema seleccionado
const theme = computed(() => props.tenantData?.websiteConfig?.theme || 'modern');

// Computed para obtener la URL de la imagen directamente (ya no como background-image)
const aboutImageUrl = computed(() => {
  const url = props.tenantData?.websiteConfig?.aboutUsImageUrl;
  if (url && url.startsWith('http')) return url;
  if (url) return `${import.meta.env.VITE_API_BASE_URL}${url}`;
  // Imagen por defecto
  return 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop';
});
</script>

<template>
  <section id="nosotros" class="py-24 relative overflow-hidden transition-all duration-500"
           :class="{
              'bg-gray-50 border-t border-gray-100': theme === 'modern',
              'bg-white border-t-2 border-gray-100': theme === 'classic',
              'bg-white': theme === 'minimal'
           }">
     <!-- Decoración de fondo (Solo Tema Moderno) -->
     <div v-if="theme === 'modern'" class="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none"></div>

     <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
         <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             
             <!-- Columna Texto -->
             <div class="order-2 lg:order-1 animate-fade-in-right">
                 <span class="text-primary font-bold uppercase tracking-wider text-xs mb-3 block transition-all" 
                       :class="{'font-serif': theme === 'classic'}">Nuestra Historia</span>
                 
                 <h2 class="font-extrabold text-gray-900 mb-6 leading-tight transition-all duration-300"
                     :class="{
                        'text-3xl md:text-4xl': theme === 'modern',
                        'text-3xl md:text-5xl font-serif tracking-wide': theme === 'classic',
                        'text-3xl md:text-4xl font-light': theme === 'minimal'
                     }">
                    Sobre {{ tenantData?.name || 'Nosotros' }}
                 </h2>
                 
                 <div class="text-lg leading-relaxed space-y-4 whitespace-pre-line text-justify transition-all duration-300"
                      :class="{
                         'text-gray-600': theme === 'modern',
                         'text-gray-700 font-serif': theme === 'classic',
                         'text-gray-500': theme === 'minimal'
                      }">
                    {{ tenantData?.websiteConfig?.aboutUs || 'Somos una clínica dental comprometida con la excelencia y el cuidado de tu salud bucal. Contamos con un equipo de profesionales altamente calificados y tecnología de vanguardia para brindarte la mejor atención.' }}
                 </div>
                 
                 <div class="mt-8 flex gap-4">
                    <div class="flex items-center gap-2 text-gray-700 font-medium">
                        <div class="w-8 h-8 flex items-center justify-center transition-all duration-300"
                             :class="theme === 'minimal' ? 'bg-gray-100 text-gray-600 rounded-lg' : 'bg-blue-100 text-blue-600 rounded-full'">
                           <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span :class="{'font-serif italic': theme === 'classic'}">Experiencia</span>
                    </div>
                    <div class="flex items-center gap-2 text-gray-700 font-medium">
                        <div class="w-8 h-8 flex items-center justify-center transition-all duration-300"
                             :class="theme === 'minimal' ? 'bg-gray-100 text-gray-600 rounded-lg' : 'bg-blue-100 text-blue-600 rounded-full'">
                           <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        <span :class="{'font-serif italic': theme === 'classic'}">Tecnología</span>
                    </div>
                 </div>

                 <div class="mt-10">
                    <a href="#contacto" class="text-primary font-bold hover:underline flex items-center gap-2 group w-max"
                       :class="{'font-serif uppercase text-sm tracking-wider': theme === 'classic'}">
                       Ven a conocernos 
                       <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </a>
                 </div>
             </div>

             <!-- Columna Imagen -->
             <div class="order-1 lg:order-2 flex justify-center">
                 <!-- 
                   LA SOLUCIÓN: 
                   Eliminamos 'aspect-square' y ponemos 'inline-block'.
                   Esto hace que el contenedor abrace la imagen sea del tamaño que sea.
                 -->
                 <div class="relative overflow-hidden group transition-all duration-500 inline-block"
                      :class="{
                         'rounded-3xl shadow-2xl border-4 border-white': theme === 'modern',
                         'rounded-none border-8 border-gray-100 shadow-md': theme === 'classic',
                         'rounded-2xl shadow-sm': theme === 'minimal'
                      }">
                     
                     <!-- Al usar una etiqueta <img> con h-auto, la foto dicta sus propias proporciones, desapareciendo los espacios huecos. -->
                     <img 
                        :src="aboutImageUrl" 
                        alt="Sobre Nosotros" 
                        class="w-full h-auto max-h-[500px] object-contain md:object-cover transform transition-transform duration-700 group-hover:scale-105 block"
                     />
                 </div>
             </div>
         </div>
     </div>
  </section>
</template>

<style scoped>
.text-primary { color: var(--clinic-primary); }
.bg-primary\/5 { background-color: color-mix(in srgb, var(--clinic-primary), transparent 95%); }
</style>