<script setup lang="ts">
const props = defineProps<{
  treatments: any[];
}>();

// Helper para iconos SVG
const getIconPath = (item: any) => {
    let key = item.iconType || '';
    
    if (!key && item.title) {
        const t = item.title.toLowerCase();
        if (t.includes('orto') || t.includes('bracket')) key = 'braces';
        else if (t.includes('implant')) key = 'implant';
        else if (t.includes('estétic') || t.includes('blanquea') || t.includes('diseño')) key = 'esthetic';
        else if (t.includes('niño') || t.includes('pedia')) key = 'kids';
        else if (t.includes('endo') || t.includes('conducto')) key = 'endo';
        else if (t.includes('cirug') || t.includes('extrac')) key = 'surgery';
        else key = 'general';
    }

    switch (key) {
        case 'braces': return 'M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z';
        case 'implant': return 'M12 2a1 1 0 011 1v14a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1h5zm0 18a1 1 0 011 1v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-1a1 1 0 011-1h5z';
        case 'esthetic': return 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
        case 'kids': return 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'; 
        case 'endo': return 'M13 10V3L4 14h7v7l9-11h-7z'; 
        case 'surgery': return 'M12 4v16m8-8H4';
        default: return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
    }
};
</script>

<template>
  <section id="tratamientos" class="py-24 bg-gray-50 relative">
     <div class="container mx-auto px-4">
         
         <!-- Título de Sección -->
         <div class="text-center mb-16 max-w-2xl mx-auto">
             <span class="text-primary font-bold uppercase tracking-wider text-xs mb-2 block">Especialidades</span>
             <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Soluciones Integrales para tu Sonrisa</h2>
             <div class="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full"></div>
         </div>

         <!-- Grid de Tratamientos Moderno -->
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <div 
                v-for="(item, index) in treatments" 
                :key="index"
                class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group relative overflow-hidden"
             >
                <!-- Acento de color en hover -->
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

                <!-- Contenido -->
                <div class="flex items-start gap-5">
                    <!-- Icono Izquierda -->
                    <div class="flex-shrink-0 w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIconPath(item)" />
                        </svg>
                    </div>
                    
                    <!-- Texto -->
                    <div>
                        <h4 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{{ item.title }}</h4>
                        <p class="text-gray-600 text-sm leading-relaxed">{{ item.description }}</p>
                    </div>
                </div>

                <!-- Flecha sutil bottom-right -->
                <div class="absolute bottom-4 right-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-300">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
             </div>
         </div>

     </div>
  </section>
</template>

<style scoped>
.text-primary { color: var(--clinic-primary); }
.bg-primary { background-color: var(--clinic-primary); }
.bg-primary\/10 { background-color: color-mix(in srgb, var(--clinic-primary), transparent 90%); }
.to-secondary { --tw-gradient-to: var(--clinic-secondary); }
</style>