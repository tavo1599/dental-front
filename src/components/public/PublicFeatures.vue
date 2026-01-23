<script setup lang="ts">
// Datos por defecto de la sección
const features = [
    { title: 'Tecnología Avanzada', description: 'Equipos digitales de última generación para diagnósticos precisos.', icon: 'tech' },
    { title: 'Profesionales Expertos', description: 'Equipo médico certificado y en constante actualización.', icon: 'cert' },
    { title: 'Atención Personalizada', description: 'Tratamientos adaptados a tus necesidades y presupuesto.', icon: 'user' },
    { title: 'Ambiente Seguro', description: 'Estrictos protocolos de bioseguridad y esterilización.', icon: 'safe' }
];
</script>

<template>
  <section id="features" class="relative py-24 bg-slate-50 z-10 -mt-1 pb-48">
     <div class="container mx-auto px-4">
         
         <!-- Título de Sección -->
         <div class="text-center mb-16 max-w-3xl mx-auto animate-on-scroll opacity-0">
             <span class="text-primary font-bold uppercase tracking-wider text-xs mb-2 block">Nuestra Diferencia</span>
             <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">¿Por qué elegirnos?</h2>
             <p class="text-gray-600 text-lg">Nos dedicamos a brindarte la mejor experiencia dental con estándares de calidad superiores.</p>
             <div class="h-1 w-20 bg-primary mx-auto rounded-full mt-6"></div>
         </div>

         <!-- Grid de Beneficios -->
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             <div 
                v-for="(feature, index) in features" 
                :key="index"
                class="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 ease-out p-8 rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 group"
                :style="{ transitionDelay: `${index * 100}ms` }"
             >
                <div class="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary mb-6 text-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <span v-if="feature.icon === 'tech'">⚡</span>
                    <span v-else-if="feature.icon === 'cert'">🎓</span>
                    <span v-else-if="feature.icon === 'user'">💙</span>
                    <span v-else>✨</span>
                </div>
                <h3 class="font-bold text-lg text-gray-900 mb-3">{{ feature.title }}</h3>
                <p class="text-sm text-gray-500 leading-relaxed">{{ feature.description }}</p>
             </div>
         </div>
     </div>

     <!-- Onda de transición hacia Tratamientos (BLANCA) -->
     <!-- Conecta el fondo gris actual con el fondo blanco de la siguiente sección -->
     <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
        <svg class="relative block w-[calc(100%+1.3px)] h-[80px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="fill-white"></path>
        </svg>
     </div>
  </section>
</template>

<style scoped>
.text-primary { color: var(--clinic-primary); }
.bg-primary { background-color: var(--clinic-primary); }

.fill-white { fill: #ffffff; }

/* Animación de entrada al hacer scroll */
.animate-on-scroll {
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-on-scroll.visible {
  transform: translateY(0);
  opacity: 1;
}
</style>