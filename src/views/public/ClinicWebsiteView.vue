<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import PublicNavbar from '@/components/public/PublicNavbar.vue'; // <-- Importamos el componente nuevo

const tenantData = ref<any>(null);
const isLoading = ref(true);
const error = ref(false);
const isProduction = import.meta.env.PROD;

// ... (Resto de tu lógica de carga de datos, colores y subdominio se mantienen igual) ...

// Obtener subdominio
const getSubdomain = () => {
  const host = window.location.host;
  const parts = host.split('.');
  if (parts.length >= 2) return parts[0].toLowerCase();
  return null;
};

// Cargar datos
const loadTenantData = async () => {
  const slug = getSubdomain();
  if (!slug || slug === 'app' || slug === 'www') {
    if (!isProduction) {
        console.warn("DEV MODE: Subdominio no detectado.");
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
    
    // Aplicar colores
    if (tenantData.value.websiteConfig) {
      const { primaryColor, secondaryColor } = tenantData.value.websiteConfig;
      const root = document.documentElement;
      const primary = primaryColor || '#2563EB';
      const secondary = secondaryColor || '#1E40AF';
      
      root.style.setProperty('--clinic-primary', primary);
      root.style.setProperty('--clinic-secondary', secondary);
      
      // Truco para sombras RGB
      // (Suponiendo conversión simple hex a rgb si fuera necesario, o dejando que tailwind use opacity si está configurado)
    }

    document.title = tenantData.value.name;
  } catch (e) {
    error.value = true;
  } finally {
    isLoading.value = false;
  }
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
    
    <div v-if="isLoading" class="h-screen flex items-center justify-center bg-gray-50">
      <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
    </div>

    <div v-else-if="error" class="h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <h1 class="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p class="text-xl text-gray-600">No encontramos la clínica.</p>
    </div>

    <div v-else>
      
      <!-- NAVBAR MODULAR -->
      <PublicNavbar :tenant-data="tenantData" />

      <!-- SECCIÓN INICIO (HERO) -->
      <header id="inicio" class="relative bg-gray-900 h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
         <!-- Fondo -->
         <div class="absolute inset-0 z-0">
             <div 
                class="absolute inset-0 bg-cover bg-center"
                :style="{ backgroundImage: getHeroImage() || 'url(https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop)' }"
             ></div>
             <div class="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/50 to-transparent"></div>
         </div>

         <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
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
                  <a href="#especialidades" class="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all text-center">
                     Nuestros Servicios
                  </a>
               </div>
            </div>
         </div>
      </header>

      <!-- Aquí irán los demás componentes: PublicServices, PublicDoctors, etc. -->
      <!-- Por ahora placeholders para que el scroll funcione -->
      <section id="especialidades" class="py-32 bg-gray-50 text-center text-gray-500">
         [Componente Especialidades Aquí]
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

/* Scroll suave para toda la página */
html { scroll-behavior: smooth; }
</style>