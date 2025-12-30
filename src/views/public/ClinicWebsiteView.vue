<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/services/api';
//import { useHead } from '@vueuse/head'; // Opcional: para cambiar el título de la pestaña

// Estado de la clínica
const tenantData = ref<any>(null);
const isLoading = ref(true);
const error = ref(false);

// Obtenemos el subdominio de la URL actual
const getSubdomain = () => {
  const host = window.location.host;
  const parts = host.split('.');
  // Si estamos en localhost (ej: clinica.localhost:3000), el subdominio es la parte 0
  // Si estamos en prod (ej: clinica.sonriandes.com), el subdominio es la parte 0
  if (parts.length >= 2) return parts[0];
  return null;
};

// Cargar datos públicos
const loadTenantData = async () => {
  const slug = getSubdomain();
  if (!slug || slug === 'app' || slug === 'www') {
    error.value = true; // No es una clínica válida
    return;
  }

  try {
    // Llamamos al endpoint público que creamos en el backend
    // GET /public/tenants/:slug
    const response = await apiClient.get(`/public/tenants/${slug}`);
    tenantData.value = response.data;
    
    // Configurar título de la página
    document.title = tenantData.value.name || 'Clínica Dental';
    
    // Aplicar colores dinámicos (CSS Variables)
    if (tenantData.value.websiteConfig) {
      const { primaryColor, secondaryColor } = tenantData.value.websiteConfig;
      if (primaryColor) document.documentElement.style.setProperty('--clinic-primary', primaryColor);
      if (secondaryColor) document.documentElement.style.setProperty('--clinic-secondary', secondaryColor);
    }

  } catch (e) {
    console.error("Clínica no encontrada", e);
    error.value = true;
  } finally {
    isLoading.value = false;
  }
};

const logoSrc = computed(() => {
  if (!tenantData.value?.logoUrl) return null;
  const url = tenantData.value.logoUrl;
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_BASE_URL}${url}`;
});

onMounted(() => {
  loadTenantData();
});
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-slate-800">
    
    <!-- LOADING -->
    <div v-if="isLoading" class="h-screen flex items-center justify-center bg-gray-50">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- ERROR (404 CLÍNICA) -->
    <div v-else-if="error" class="h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <h1 class="text-4xl font-bold text-gray-300 mb-4">404</h1>
      <p class="text-xl text-gray-600">No encontramos la clínica que buscas.</p>
      <a href="https://sonriandes.com" class="mt-6 text-blue-600 hover:underline">Volver a SonriAndes</a>
    </div>

    <!-- CONTENIDO DE LA CLÍNICA -->
    <div v-else>
      
      <!-- Navbar Dinámico -->
      <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            <!-- Logo Clínica -->
            <div class="flex-shrink-0 flex items-center gap-3">
              <img v-if="logoSrc" :src="logoSrc" class="h-12 w-auto object-contain" alt="Logo" />
              <span v-else class="font-bold text-2xl text-[var(--clinic-primary)]">{{ tenantData.name }}</span>
            </div>
            
            <!-- Menú (Simple por ahora) -->
            <div class="hidden md:flex space-x-8">
              <a href="#inicio" class="text-gray-600 hover:text-[var(--clinic-primary)] font-medium">Inicio</a>
              <a href="#nosotros" class="text-gray-600 hover:text-[var(--clinic-primary)] font-medium">Nosotros</a>
              <a href="#contacto" class="px-5 py-2 bg-[var(--clinic-primary)] text-white rounded-full font-bold hover:opacity-90 transition-opacity">
                 Agendar Cita
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section (Portada) -->
      <header id="inicio" class="relative bg-gray-50 py-24 lg:py-32 overflow-hidden">
         <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
               {{ tenantData.websiteConfig?.welcomeMessage || `Bienvenido a ${tenantData.name}` }}
            </h1>
            <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
               Cuidamos tu sonrisa con la mejor tecnología y atención profesional.
            </p>
            <div class="mt-10 flex justify-center gap-4">
               <a v-if="tenantData.websiteConfig?.whatsappNumber" 
                  :href="`https://wa.me/${tenantData.websiteConfig.whatsappNumber}`" 
                  target="_blank"
                  class="px-8 py-4 bg-green-500 text-white rounded-full font-bold text-lg shadow-lg hover:bg-green-600 transition-transform hover:-translate-y-1 flex items-center gap-2"
               >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  Contáctanos
               </a>
            </div>
         </div>
      </header>

      <!-- Sobre Nosotros -->
      <section id="nosotros" class="py-20">
         <div class="max-w-4xl mx-auto px-4 text-center">
             <h2 class="text-3xl font-bold text-gray-900 mb-6">Sobre Nosotros</h2>
             <p class="text-lg text-gray-600 leading-relaxed">
                {{ tenantData.websiteConfig?.aboutUs || 'Somos un equipo comprometido con tu salud dental.' }}
             </p>
         </div>
      </section>

      <!-- Footer -->
      <footer id="contacto" class="bg-gray-900 text-white py-12">
         <div class="max-w-7xl mx-auto px-4 text-center">
            <h3 class="text-2xl font-bold mb-4">{{ tenantData.name }}</h3>
            <p class="text-gray-400 mb-2">{{ tenantData.address }}</p>
            <p class="text-gray-400">{{ tenantData.phone }} | {{ tenantData.email }}</p>
            <div class="mt-8 border-t border-gray-800 pt-8 text-xs text-gray-600">
               &copy; {{ new Date().getFullYear() }} {{ tenantData.name }}. Powered by SonriAndes.
            </div>
         </div>
      </footer>

    </div>
  </div>
</template>

<style scoped>
/* Variables CSS por defecto (se sobrescriben con JS) */
:root {
  --clinic-primary: #2563EB; /* Azul por defecto */
  --clinic-secondary: #1E40AF;
}
</style>