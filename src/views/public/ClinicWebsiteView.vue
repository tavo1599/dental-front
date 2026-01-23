<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';

// Imports de Componentes Modulares
import PublicNavbar from '@/components/public/PublicNavbar.vue';
import PublicHero from '@/components/public/PublicHero.vue';
import PublicTreatments from '@/components/public/PublicTreatments.vue';
import PublicDoctors from '@/components/public/PublicDoctors.vue';
import PublicAbout from '@/components/public/PublicAbout.vue';
import PublicContact from '@/components/public/PublicContact.vue';

const route = useRoute();
const tenantData = ref<any>(null);
const isLoading = ref(true);
const error = ref(false);
const errorDetail = ref(''); 
const detectedSlug = ref('');
const isProduction = import.meta.env.PROD;

const defaultPrimary = '#2563EB';
const defaultSecondary = '#1E40AF';

// --- DATOS POR DEFECTO: TRATAMIENTOS ---
const defaultTreatments = [
  { title: 'Ortodoncia', description: 'Corregimos la posición de tus dientes con brackets metálicos, estéticos o alineadores invisibles.', iconType: 'braces' },
  { title: 'Implantes Dentales', description: 'Recupera tu sonrisa y funcionalidad completa con implantes de titanio de alta calidad.', iconType: 'implant' },
  { title: 'Estética Dental', description: 'Diseño de sonrisa, carillas de porcelana y blanqueamiento para una sonrisa radiante.', iconType: 'esthetic' },
  { title: 'Odontopediatría', description: 'Atención especializada, paciente y divertida para el cuidado dental de tus hijos.', iconType: 'kids' },
  { title: 'Endodoncia', description: 'Salvamos tus dientes dañados eliminando el dolor y la infección de raíz.', iconType: 'endo' },
  { title: 'Cirugía Oral', description: 'Extracciones de terceros molares y cirugías complejas con máxima seguridad.', iconType: 'surgery' }
];

// --- DATOS POR DEFECTO: POR QUÉ ELEGIRNOS ---
const defaultFeatures = [
    { title: 'Tecnología Avanzada', description: 'Equipos digitales de última generación para diagnósticos precisos.', icon: 'tech' },
    { title: 'Profesionales Expertos', description: 'Equipo médico certificado y en constante actualización.', icon: 'cert' },
    { title: 'Atención Personalizada', description: 'Tratamientos adaptados a tus necesidades y presupuesto.', icon: 'user' },
    { title: 'Ambiente Seguro', description: 'Estrictos protocolos de bioseguridad y esterilización.', icon: 'safe' }
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

const getLogoUrl = () => {
    const url = tenantData.value?.logoUrl;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_BASE_URL}${url}`;
};

const getDoctorPhoto = (photoUrl?: string) => {
    if (!photoUrl) return 'https://via.placeholder.com/300x300?text=Doctor'; 
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${import.meta.env.VITE_API_BASE_URL}${photoUrl}`;
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
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  setTimeout(() => {
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
  }, 500);
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800 clinic-theme scroll-smooth overflow-x-hidden">
    
    <!-- LOADING -->
    <div v-if="isLoading" class="h-screen flex items-center justify-center bg-gray-50 fixed inset-0 z-[60]">
      <div class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
        <p class="text-gray-400 text-sm animate-pulse">Cargando...</p>
      </div>
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

      <!-- HERO MODULAR (Onda inferior Gris para conectar con Features) -->
      <PublicHero :tenant-data="tenantData" :whatsapp-link="whatsappLink" />

      <!-- 2. SECCIÓN: POR QUÉ ELEGIRNOS -->
      <!-- Fondo 'bg-slate-50' para que coincida con la onda del Hero, evitando la línea gris -->
      <!-- Padding bottom 'pb-48' aumentado para que la onda inferior no tape el contenido -->
      <section id="features" class="relative py-24 bg-slate-50 z-10 -mt-1 pb-48">
         <div class="container mx-auto px-4">
             
             <!-- Título de Sección Agregado -->
             <div class="text-center mb-16 max-w-3xl mx-auto animate-on-scroll opacity-0">
                 <span class="text-primary font-bold uppercase tracking-wider text-xs mb-2 block">Nuestra Diferencia</span>
                 <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">¿Por qué elegirnos?</h2>
                 <p class="text-gray-600 text-lg">Nos dedicamos a brindarte la mejor experiencia dental con estándares de calidad superiores.</p>
                 <div class="h-1 w-20 bg-primary mx-auto rounded-full mt-6"></div>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 <div 
                    v-for="(feature, index) in defaultFeatures" 
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

         <!-- Onda de transición hacia Tratamientos (BLANCA para conectar con la siguiente sección blanca) -->
         <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg class="relative block w-[calc(100%+1.3px)] h-[80px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="fill-white"></path>
            </svg>
         </div>
      </section>

      <!-- 3. TRATAMIENTOS (Fondo Blanco para contraste) -->
      <!-- Usamos !bg-white para forzar el fondo blanco sobre el componente si trae gris por defecto -->
      <div class="bg-white pb-20 relative z-20"> 
          <PublicTreatments :treatments="treatments" class="animate-on-scroll opacity-0 !bg-white" />
      </div>

      <!-- Separador Onda hacia Doctores (Blanco a Blanco o Blanco a Gris según Doctores) -->
      <div class="w-full overflow-hidden leading-[0] rotate-180 bg-white">
        <svg class="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <!-- Transición hacia el gris de la sección Doctores/Nosotros si fuera el caso, o decorativo -->
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" class="fill-slate-50"></path>
        </svg>
      </div>

      <!-- 4. DOCTORES (Fondo Gris Suave) -->
      <div class="bg-slate-50">
        <PublicDoctors 
           v-if="tenantData.websiteConfig?.showStaff"
           :doctors="publicDoctors" 
           class="animate-on-scroll opacity-0 !bg-slate-50"
        />
      </div>

      <!-- 5. NOSOTROS (Fondo Blanco) -->
      <!-- PublicAbout suele tener su propio fondo, aseguramos que se vea bien -->
      <PublicAbout :tenant-data="tenantData" class="animate-on-scroll opacity-0 !bg-white" />

      <!-- 6. CONTACTO (Footer Oscuro) -->
      <PublicContact :tenant-data="tenantData" />

    </div>
  </div>
</template>

<style scoped>
.text-primary { color: var(--clinic-primary); }
.bg-primary { background-color: var(--clinic-primary); }
.border-primary { border-color: var(--clinic-primary); }

html { scroll-behavior: smooth; }

.fill-white { fill: #ffffff; }
.fill-slate-50 { fill: #f8fafc; } 
.fill-gray-900 { fill: #111827; }

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