<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  doctors: any[];
  tenantData?: any;
}>();

const theme = computed(() => props.tenantData?.websiteConfig?.theme || 'modern');

const getDoctorPhoto = (photoUrl?: string) => {
    if (!photoUrl) return 'https://via.placeholder.com/300x300?text=Doctor'; 
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${import.meta.env.VITE_API_BASE_URL}${photoUrl}`;
};
</script>

<template>
  <section id="doctores" class="py-24 relative overflow-hidden transition-all duration-500"
           :class="{
              'bg-white': theme === 'modern' || theme === 'classic',
              'bg-gray-50': theme === 'minimal'
           }">
     <!-- Fondo decorativo sutil (Solo Moderno) -->
     <div v-if="theme === 'modern'" class="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
     <div v-if="theme === 'modern'" class="absolute bottom-0 left-0 w-72 h-72 bg-indigo-50 rounded-full blur-3xl opacity-50 -ml-20 -mb-20 pointer-events-none"></div>

     <div class="container mx-auto px-4 relative z-10">
         
         <div class="text-center mb-16 max-w-2xl mx-auto">
             <span class="text-primary font-bold uppercase tracking-wider text-xs mb-2 block transition-all" :class="{'font-serif': theme === 'classic'}">Nuestro Equipo</span>
             <h2 class="font-extrabold text-gray-900 mb-6 transition-all duration-300"
                 :class="{
                    'text-3xl md:text-4xl': theme === 'modern',
                    'text-3xl md:text-5xl font-serif tracking-wide': theme === 'classic',
                    'text-3xl md:text-4xl font-light': theme === 'minimal'
                 }">Expertos en tu Sonrisa</h2>
             <div class="h-1 mx-auto rounded-full transition-all duration-300"
                  :class="{
                     'w-24 bg-gradient-to-r from-primary to-transparent': theme === 'modern',
                     'w-16 bg-primary': theme === 'classic',
                     'w-12 bg-gray-300': theme === 'minimal'
                  }"></div>
         </div>

         <!-- Grid de Doctores -->
         <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
             <div 
                v-for="doc in doctors" 
                :key="doc.id" 
                class="group transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
                :class="{
                   'bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 hover:shadow-xl border border-gray-50': theme === 'modern',
                   'bg-white rounded-none p-6 border border-gray-200 hover:border-primary': theme === 'classic',
                   'bg-transparent p-4': theme === 'minimal'
                }"
             >
                <!-- Barra de color superior en hover (Moderno) -->
                <div v-if="theme === 'modern'" class="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                <!-- Foto con efecto -->
                <div class="relative mb-6 mx-auto"
                     :class="{
                        'w-48 h-48': theme === 'modern' || theme === 'classic',
                        'w-56 h-64 rounded-3xl overflow-hidden shadow-sm': theme === 'minimal'
                     }">
                    <div v-if="theme === 'modern'" class="absolute inset-0 rounded-full border border-gray-100 scale-90 group-hover:scale-100 transition-transform duration-500"></div>
                    <div class="absolute inset-2 overflow-hidden transition-all duration-300 bg-gray-50"
                         :class="{
                            'rounded-full shadow-md group-hover:shadow-lg': theme === 'modern',
                            'rounded-full border-4 border-gray-100': theme === 'classic',
                            'rounded-3xl inset-0': theme === 'minimal'
                         }">
                        <img :src="getDoctorPhoto(doc.photoUrl)" 
                             class="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                             :class="{'grayscale group-hover:grayscale-0': theme === 'classic'}"
                             alt="Doctor" />
                    </div>
                    
                    <!-- Badge de especialidad flotante (Solo Moderno y Clásico) -->
                    <div v-if="theme !== 'minimal'" class="absolute bottom-2 right-4 text-white text-[10px] font-bold px-3 py-1 shadow-md transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100"
                         :class="{
                            'bg-primary rounded-full': theme === 'modern',
                            'bg-gray-900 rounded-sm uppercase tracking-wider': theme === 'classic'
                         }">
                        {{ doc.specialty || 'Odontólogo' }}
                    </div>
                </div>

                <h4 class="text-xl font-bold text-gray-900 mb-1 transition-all" :class="{'font-serif': theme === 'classic'}">{{ doc.fullName }}</h4>
                <p class="text-sm mb-3 transition-all"
                   :class="{
                      'text-gray-500': theme === 'modern',
                      'text-primary font-serif italic': theme === 'classic',
                      'text-gray-400 font-medium': theme === 'minimal'
                   }">{{ doc.specialty || 'Cirujano Dentista' }}</p>
                
                <div v-if="doc.cmp && theme !== 'minimal'" class="inline-block px-3 py-1 text-xs font-mono mb-4 transition-all"
                     :class="{
                        'bg-gray-50 text-gray-400 rounded-md border border-gray-100': theme === 'modern',
                        'text-gray-400 border-b border-gray-200': theme === 'classic'
                     }">
                    COP: {{ doc.cmp }}
                </div>

                <p v-if="doc.bio" class="text-gray-500 text-sm leading-relaxed px-2 transition-all"
                   :class="{'line-clamp-3': theme === 'modern' || theme === 'minimal', 'line-clamp-4 font-serif text-gray-600': theme === 'classic'}">
                    {{ doc.bio }}
                </p>
             </div>
         </div>

         <!-- Mensaje vacío -->
         <div v-if="doctors.length === 0" class="text-center text-gray-400 py-10 italic bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-8">
             El equipo médico se está actualizando.
         </div>

     </div>
  </section>
</template>

<style scoped>
.text-primary { color: var(--clinic-primary); }
.bg-primary { background-color: var(--clinic-primary); }
.from-primary { --tw-gradient-from: var(--clinic-primary); }
.border-primary { border-color: var(--clinic-primary); }
</style>