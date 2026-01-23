<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';

// Imports de Componentes Modulares
import PublicNavbar from '@/components/public/PublicNavbar.vue';
import PublicHero from '@/components/public/PublicHero.vue';
import PublicTreatments from '@/components/public/PublicTreatments.vue';
import PublicDoctors from '@/components/public/PublicDoctors.vue';
import PublicAbout from '@/components/public/PublicAbout.vue'; // Nuevo
import PublicContact from '@/components/public/PublicContact.vue'; // Nuevo

const route = useRoute();
const tenantData = ref<any>(null);
const isLoading = ref(true);
const error = ref(false);
const errorDetail = ref(''); 
const detectedSlug = ref('');
const isProduction = import.meta.env.PROD;

const defaultPrimary = '#2563EB';
const defaultSecondary = '#1E40AF';

// ... (El resto de la lógica de carga, tratamientos, colores, etc. se mantiene igual que la versión anterior)
// ... He copiado la lógica necesaria abajo para que el archivo esté completo

const defaultTreatments = [
  { title: 'Ortodoncia', description: 'Corregimos la posición de tus dientes con brackets metálicos, estéticos o alineadores invisibles.', iconType: 'braces' },
  { title: 'Implantes Dentales', description: 'Recupera tu sonrisa y funcionalidad completa con implantes de titanio de alta calidad.', iconType: 'implant' },
  { title: 'Estética Dental', description: 'Diseño de sonrisa, carillas de porcelana y blanqueamiento para una sonrisa radiante.', iconType: 'esthetic' },
  { title: 'Odontopediatría', description: 'Atención especializada, paciente y divertida para el cuidado dental de tus hijos.', iconType: 'kids' },
  { title: 'Endodoncia', description: 'Salvamos tus dientes dañados eliminando el dolor y la infección de raíz.', iconType: 'endo' },
  { title: 'Cirugía Oral', description: 'Extracciones de terceros molares y cirugías complejas con máxima seguridad.', iconType: 'surgery' }
];

const treatments = computed(() => {
    if (tenantData.value?.websiteConfig?.services && tenantData.value.websiteConfig.services.length > 0) {
        return tenantData.value.websiteConfig.services;
    }
    return defaultTreatments;
});

const getSubdomain = () => {
  if (!isProduction && route.query.slug) return route.query.slug as string;
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

const publicDoctors = computed(() => {
    if (!tenantData.value?.users) return [];
    return tenantData.value.users.filter((u: any) => u.role === 'dentist' || u.role === 'admin');
});

const whatsappLink = computed(() => {
    const number = tenantData.value?.websiteConfig?.whatsappNumber;
    if (!number) return null;
    const text = encodeURIComponent(`Hola ${tenantData.value.name}, quisiera agendar una cita.`);
    return `https://wa.me/${number}?text=${text}`;
});

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
            <li><strong>Slug:</strong> {{ detectedSlug }}</li>
            <li><strong>Causa:</strong> {{ errorDetail }}</li>
         </ul>
      </div>
      <a href="https://sonriandes.com" class="mt-8 px-6 py-2 bg-primary text-white rounded-full font-bold hover:opacity-90">Ir a SonriAndes</a>
    </div>

    <!-- SITIO WEB COMPLETO -->
    <div v-else>
      
      <PublicNavbar :tenant-data="tenantData" />

      <PublicHero :tenant-data="tenantData" :whatsapp-link="whatsappLink" />

      <PublicTreatments :treatments="treatments" />

      <PublicDoctors 
         v-if="tenantData.websiteConfig?.showStaff"
         :doctors="publicDoctors" 
      />

      <!-- NOSOTROS -->
      <PublicAbout :tenant-data="tenantData" />

      <!-- CONTACTO -->
      <PublicContact :tenant-data="tenantData" />

    </div>
  </div>
</template>

<style scoped>
.text-primary { color: var(--clinic-primary); }
.bg-primary { background-color: var(--clinic-primary); }
.border-primary { border-color: var(--clinic-primary); }

html { scroll-behavior: smooth; }
.fill-gray-50 { fill: #f9fafb; }
</style>