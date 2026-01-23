<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import PublicNavbar from '@/components/public/PublicNavbar.vue';

const route = useRoute();
const tenantData = ref<any>(null);
const isLoading = ref(true);
const error = ref(false);
const errorDetail = ref(''); 
const detectedSlug = ref('');
const isProduction = import.meta.env.PROD;

const defaultPrimary = '#2563EB';
const defaultSecondary = '#1E40AF';

// --- DATOS POR DEFECTO PARA TRATAMIENTOS ---
// Se mostrarán si la clínica no ha configurado los suyos
const defaultTreatments = [
  {
    title: 'Ortodoncia',
    description: 'Corregimos la posición de tus dientes con brackets metálicos, estéticos o alineadores invisibles.',
    iconType: 'braces'
  },
  {
    title: 'Implantes Dentales',
    description: 'Recupera tu sonrisa y funcionalidad completa con implantes de titanio de alta calidad.',
    iconType: 'implant'
  },
  {
    title: 'Estética Dental',
    description: 'Diseño de sonrisa, carillas de porcelana y blanqueamiento para una sonrisa radiante.',
    iconType: 'esthetic'
  },
  {
    title: 'Odontopediatría',
    description: 'Atención especializada, paciente y divertida para el cuidado dental de tus hijos.',
    iconType: 'kids'
  },
  {
    title: 'Endodoncia',
    description: 'Salvamos tus dientes dañados eliminando el dolor y la infección de raíz.',
    iconType: 'endo'
  },
  {
    title: 'Cirugía Oral',
    description: 'Extracciones de terceros molares y cirugías complejas con máxima seguridad.',
    iconType: 'surgery'
  }
];

const treatments = computed(() => {
    // Si la clínica tiene servicios configurados, úsalos
    if (tenantData.value?.websiteConfig?.services && tenantData.value.websiteConfig.services.length > 0) {
        return tenantData.value.websiteConfig.services;
    }
    // Si no, usa los por defecto
    return defaultTreatments;
});

// Helper para iconos SVG según el tipo o palabra clave
const getIconPath = (item: any) => {
    // Si viene un 'iconType' explícito
    let key = item.iconType || '';
    
    // Si no, intentamos adivinar por el título
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
        case 'implant': return 'M12 2a1 1 0 011 1v14a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1h5zm0 18a1 1 0 011 1v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-1a1 1 0 011-1h5z'; // Simplificado
        case 'esthetic': return 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
        case 'kids': return 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'; // Reusamos carita feliz por ahora
        case 'endo': return 'M13 10V3L4 14h7v7l9-11h-7z'; // Rayo
        case 'surgery': return 'M12 4v16m8-8H4'; // Cruz médica simple
        default: return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'; // Check genérico
    }
};

const getSubdomain = () => {
  if (!isProduction && route.query.slug) {
     return route.query.slug as string;
  }
  const host = window.location.host;
  const parts = host.split('.');
  
  if (parts.length >= 2) {
      if (parts[0] === 'www' || parts[0] === 'app') return null;
      return parts[0].toLowerCase();
  }
  return null;
};

const loadTenantData = async () => {
  const slug = getSubdomain();
  detectedSlug.value = slug || 'Ninguno';

  if (!slug) {
    if (!isProduction) {
        errorDetail.value = "No se detectó ningún subdominio en la URL.";
        error.value = true;
        isLoading.value = false;
        return;
    }
    window.location.href = 'https://sonriandes.com';
    return;
  }

  try {
    const response = await apiClient.get(`/public/tenants/${slug}`);
    tenantData.value = response.data;
    
    updateColors();
    updateMetaTags();

  } catch (e: any) {
    console.error("Error cargando clínica:", e);
    error.value = true;
    if (e.response && e.response.status === 404) {
        errorDetail.value = `El slug "${slug}" no existe en la Base de Datos.`;
    } else {
        errorDetail.value = "Error de conexión con el servidor.";
    }
  } finally {
    isLoading.value = false;
  }
};

const updateColors = () => {
    if (!tenantData.value?.websiteConfig) return;
    const { primaryColor, secondaryColor } = tenantData.value.websiteConfig;
    const root = document.documentElement;
    
    if (primaryColor) root.style.setProperty('--clinic-primary', primaryColor);
    if (secondaryColor) root.style.setProperty('--clinic-secondary', secondaryColor);
};

const updateMetaTags = () => {
    document.title = tenantData.value?.name || 'Clínica Dental';
};

const getLogoUrl = () => {
    const url = tenantData.value?.logoUrl;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_BASE_URL}${url}`;
};

const getHeroImage = () => {
    const url = tenantData.value?.websiteConfig?.heroImageUrl;
    if (url && url.startsWith('http')) return `url('${url}')`;
    if (url) return `url('${import.meta.env.VITE_API_BASE_URL}${url}')`;
    return null; 
};

onMounted(() => {
  loadTenantData();
});
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-slate-800 clinic-theme scroll-smooth">
    
    <!-- LOADING -->
    <div v-if="isLoading" class="h-screen flex items-center justify-center bg-gray-50">
      <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
    </div>

    <!-- ERROR -->
    <div v-else-if="error" class="h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <h1 class="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p class="text-xl text-gray-600 mb-2">No encontramos la clínica.</p>
      
      <div v-if="!isProduction" class="mt-4 bg-orange-50 border border-orange-200 p-4 rounded text-left max-w-md">
         <p class="text-xs font-bold text-orange-800 uppercase mb-1">Diagnóstico DEV:</p>
         <ul class="text-xs text-orange-700 space-y-1 list-disc pl-4">
            <li><strong>Slug detectado:</strong> {{ detectedSlug }}</li>
            <li><strong>Causa:</strong> {{ errorDetail }}</li>
            <li><strong>Solución:</strong> Verifica que en tu tabla 'tenants' (local) exista un registro con <code>domainSlug = '{{ detectedSlug }}'</code>.</li>
         </ul>
         <p class="mt-2 text-xs text-gray-500 border-t border-orange-200 pt-2">
            Tip: Puedes probar forzando la URL así: <br>
            <code>http://localhost:5173/?slug=oralclean</code>
         </p>
      </div>

      <a href="https://sonriandes.com" class="mt-8 px-6 py-2 bg-primary text-white rounded-full font-bold hover:opacity-90">Ir a SonriAndes</a>
    </div>

    <!-- SITIO WEB -->
    <div v-else>
      
      <!-- NAVBAR -->
      <PublicNavbar :tenant-data="tenantData" />

      <!-- SECCIÓN INICIO (HERO) CON ONDAS -->
      <header id="inicio" class="relative bg-gray-900 pt-32 pb-48 lg:pt-48 lg:pb-64 overflow-hidden flex items-center justify-center">
         <!-- Fondo -->
         <div class="absolute inset-0 z-0">
             <div 
                class="absolute inset-0 bg-cover bg-center"
                :style="{ backgroundImage: getHeroImage() || 'url(https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop)' }"
             ></div>
             <div class="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/70 to-transparent"></div>
         </div>

         <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="max-w-3xl">
               <h1 class="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                  {{ tenantData.websiteConfig?.welcomeMessage || `Bienvenido a ${tenantData.name}` }}
               </h1>
               <p v-if="tenantData.websiteConfig?.subTitle" class="text-xl md:text-2xl text-gray-200 mb-8 font-light border-l-4 border-primary pl-4">
                  {{ tenantData.websiteConfig.subTitle }}
               </p>
               <div class="flex flex-col sm:flex-row gap-4">
                  <a href="#contacto" class="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-xl hover:bg-opacity-90 transition-transform transform hover:-translate-y-1 text-center">
                     Agendar Cita
                  </a>
                  <a href="#tratamientos" class="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all text-center">
                     Nuestros Tratamientos
                  </a>
               </div>
            </div>
         </div>

         <!-- DIVISOR ONDA (Wave) -->
         <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg class="relative block w-[calc(100%+1.3px)] h-[80px] md:h-[150px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="fill-gray-50"></path>
            </svg>
         </div>
      </header>

      <!-- SECCIÓN TRATAMIENTOS (Dinámica) -->
      <section id="tratamientos" class="py-24 bg-gray-50">
         <div class="container mx-auto px-4">
             
             <!-- Título de Sección -->
             <div class="text-center mb-16 max-w-2xl mx-auto">
                 <h2 class="text-primary font-bold uppercase tracking-wider text-sm mb-3">Especialidades</h2>
                 <h3 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Soluciones Integrales para tu Sonrisa</h3>
                 <div class="h-1 w-20 bg-primary mx-auto rounded-full"></div>
             </div>

             <!-- Grid de Tratamientos -->
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div 
                    v-for="(item, index) in treatments" 
                    :key="index"
                    class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col items-center text-center"
                 >
                    <!-- Icono Dinámico -->
                    <div class="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIconPath(item)" />
                        </svg>
                    </div>
                    
                    <h4 class="text-xl font-bold text-gray-900 mb-3">{{ item.title }}</h4>
                    <p class="text-gray-600 leading-relaxed text-sm">{{ item.description }}</p>
                 </div>
             </div>

         </div>
      </section>

      <section id="doctores" class="py-32 bg-white text-center text-gray-500">
         [Componente Doctores Aquí]
      </section>

      <section id="nosotros" class="py-32 bg-gray-50 text-center text-gray-500">
         [Componente Nosotros Aquí]
      </section>

      <section id="contacto" class="py-32 bg-gray-900 text-white text-center">
         [Componente Contacto Aquí]
      </section>

    </div>
  </div>
</template>

<style scoped>
/* Clases de utilidad que usan las variables */
.text-primary { color: var(--clinic-primary); }
.bg-primary { background-color: var(--clinic-primary); }
.border-primary { border-color: var(--clinic-primary); }

html { scroll-behavior: smooth; }

/* Clase auxiliar para el color de relleno del SVG */
.fill-gray-50 { fill: #f9fafb; }
</style>