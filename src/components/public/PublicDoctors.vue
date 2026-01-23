<script setup lang="ts">
// defineProps es una macro global, no se importa.

const props = defineProps<{
  doctors: any[];
}>();

const getDoctorPhoto = (photoUrl?: string) => {
    if (!photoUrl) return 'https://via.placeholder.com/300x300?text=Doctor'; 
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${import.meta.env.VITE_API_BASE_URL}${photoUrl}`;
};
</script>

<template>
  <section id="doctores" class="py-24 bg-white relative overflow-hidden">
     <!-- Fondo decorativo sutil -->
     <div class="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
     <div class="absolute bottom-0 left-0 w-72 h-72 bg-indigo-50 rounded-full blur-3xl opacity-50 -ml-20 -mb-20 pointer-events-none"></div>

     <div class="container mx-auto px-4 relative z-10">
         
         <div class="text-center mb-16 max-w-2xl mx-auto">
             <span class="text-primary font-bold uppercase tracking-wider text-xs mb-2 block">Nuestro Equipo</span>
             <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Expertos en tu Sonrisa</h2>
             <div class="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full"></div>
         </div>

         <!-- Grid de Doctores -->
         <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
             <div 
                v-for="doc in doctors" 
                :key="doc.id" 
                class="group bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 hover:shadow-xl transition-all duration-300 border border-gray-50 flex flex-col items-center text-center relative overflow-hidden"
             >
                <!-- Barra de color superior en hover -->
                <div class="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                <!-- Foto con efecto -->
                <div class="relative w-48 h-48 mb-6">
                    <div class="absolute inset-0 rounded-full border border-gray-100 scale-90 group-hover:scale-100 transition-transform duration-500"></div>
                    <div class="absolute inset-2 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 bg-gray-50">
                        <img :src="getDoctorPhoto(doc.photoUrl)" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Doctor" />
                    </div>
                    <!-- Badge de especialidad flotante -->
                    <div class="absolute bottom-2 right-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                        {{ doc.specialty || 'Odontólogo' }}
                    </div>
                </div>

                <h4 class="text-xl font-bold text-gray-900 mb-1">{{ doc.fullName }}</h4>
                <p class="text-gray-500 text-sm mb-3">{{ doc.specialty || 'Cirujano Dentista' }}</p>
                
                <div v-if="doc.cmp" class="inline-block bg-gray-50 px-3 py-1 rounded-md text-xs text-gray-400 font-mono mb-4 border border-gray-100">
                    COP: {{ doc.cmp }}
                </div>

                <p v-if="doc.bio" class="text-gray-500 text-sm leading-relaxed line-clamp-3 px-2">
                    {{ doc.bio }}
                </p>
             </div>
         </div>

         <!-- Mensaje vacío -->
         <div v-if="doctors.length === 0" class="text-center text-gray-400 py-10 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
             El equipo médico se está actualizando.
         </div>

     </div>
  </section>
</template>

<style scoped>
.text-primary { color: var(--clinic-primary); }
.bg-primary { background-color: var(--clinic-primary); }
.from-primary { --tw-gradient-from: var(--clinic-primary); }
</style>