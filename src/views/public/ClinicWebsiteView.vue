<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import PublicNavbar from '@/components/public/PublicNavbar.vue';
import PublicHero from '@/components/public/PublicHero.vue'; // Nuevo
import PublicTreatments from '@/components/public/PublicTreatments.vue'; // Nuevo

const route = useRoute();
const tenantData = ref<any>(null);
const isLoading = ref(true);
const error = ref(false);
const errorDetail = ref(''); 
const detectedSlug = ref('');
const isProduction = import.meta.env.PROD;

const defaultPrimary = '#2563EB';
const defaultSecondary = '#1E40AF';

// --- DATOS POR DEFECTO ---
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
      
      <PublicNavbar :tenant-data="tenantData" />

      <!-- HERO MODULAR -->
      <PublicHero :tenant-data="tenantData" :whatsapp-link="whatsappLink" />

      <!-- TRATAMIENTOS MODULAR -->
      <PublicTreatments :treatments="treatments" />

      <!-- EQUIPO (Aún en este archivo, se puede modularizar luego) -->
      <section id="doctores" v-if="tenantData.websiteConfig?.showStaff && publicDoctors.length > 0" class="py-24 bg-white">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="text-center mb-16">
                  <span class="text-primary font-bold uppercase tracking-wider text-xs mb-2 block">Profesionales</span>
                  <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900">Nuestro Equipo Médico</h2>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div v-for="doc in publicDoctors" :key="doc.id" class="group">
                      <div class="relative overflow-hidden rounded-2xl shadow-lg aspect-[3/4] mb-6">
                          <img :src="getDoctorPhoto(doc.photoUrl)" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Doctor" />
                          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                          
                          <div class="absolute bottom-0 left-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                             <h4 class="text-xl font-bold">{{ doc.fullName }}</h4>
                             <p class="text-white/80 text-sm">{{ doc.specialty || 'Cirujano Dentista' }}</p>
                          </div>
                      </div>
                      <p v-if="doc.cmp" class="text-xs text-gray-400 uppercase tracking-widest text-center">COP: {{ doc.cmp }}</p>
                  </div>
              </div>
          </div>
      </section>

      <!-- NOSOTROS -->
      <section id="nosotros" class="py-24 bg-gray-50 border-t border-gray-100">
         <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                 <div class="order-2 lg:order-1">
                     <span class="text-primary font-bold uppercase tracking-wider text-xs mb-2 block">Nuestra Historia</span>
                     <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Sobre {{ tenantData.name }}</h2>
                     <div class="text-lg text-gray-600 leading-relaxed space-y-4 whitespace-pre-line text-justify">
                        {{ tenantData.websiteConfig?.aboutUs || 'Somos una clínica dental comprometida con la excelencia y el cuidado de tu salud bucal.' }}
                     </div>
                     <div class="mt-8">
                        <a href="#contacto" class="text-primary font-bold hover:underline flex items-center gap-2">
                           Ven a conocernos <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </a>
                     </div>
                 </div>
                 <div class="order-1 lg:order-2">
                     <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                         <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop" class="w-full h-auto object-cover transform transition-transform hover:scale-105 duration-700" alt="Consultorio" />
                     </div>
                 </div>
             </div>
         </div>
      </section>

      <!-- CONTACTO -->
      <section id="contacto" class="bg-gray-900 text-white pt-24 pb-12">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 border-b border-gray-800 pb-16">
                  
                  <!-- Info Brand -->
                  <div class="lg:col-span-1">
                      <div class="flex items-center gap-2 mb-6">
                         <img v-if="getLogoUrl()" :src="getLogoUrl()!" class="h-8 w-auto brightness-0 invert" alt="Logo" />
                         <span class="text-xl font-bold">{{ tenantData.name }}</span>
                      </div>
                      <p class="text-gray-400 text-sm leading-relaxed mb-6">Comprometidos con tu sonrisa y bienestar dental con tecnología de punta.</p>
                      
                      <!-- Redes Sociales -->
                      <div class="flex gap-3">
                          <a v-if="tenantData.websiteConfig?.facebookUrl" :href="tenantData.websiteConfig.facebookUrl" target="_blank" class="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                          </a>
                          <a v-if="tenantData.websiteConfig?.instagramUrl" :href="tenantData.websiteConfig.instagramUrl" target="_blank" class="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors text-white">
                              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </a>
                          <a v-if="tenantData.websiteConfig?.tiktokUrl" :href="tenantData.websiteConfig.tiktokUrl" target="_blank" class="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-black hover:border-white border border-transparent transition-colors text-white">
                             <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.62-1.12-1.76-2.5-3.52-5-5.28-7.5zm-5.04 1.02c.02 0 .04 0 .06.01.03.01.06.02.09.02 1.32.02 2.64.02 3.96.03v15.6c-.01 2.94-2.4 5.33-5.34 5.33-2.94.01-5.33-2.38-5.33-5.33-.01-2.94 2.39-5.33 5.33-5.33.68 0 1.36.14 1.99.42l.62-3.88c-4.99-.97-9.87 2.27-10.84 7.26-.97 4.99 2.27 9.87 7.26 10.84 4.99.97 9.87-2.27 10.84-7.26.17-.85.22-1.72.16-2.58v-9.56c1.78 1.27 3.94 1.95 6.14 1.94v-4.04c-3.23.08-6.1-1.89-7.38-4.83l-3.23 5.5z"/></svg>
                          </a>
                      </div>
                  </div>

                  <!-- Ubicación -->
                  <div class="lg:col-span-1">
                      <h4 class="text-white font-bold mb-4 uppercase text-xs tracking-wider">Ubicación</h4>
                      <p class="text-gray-400 mb-2 flex items-start gap-2 text-sm">
                          <svg class="w-5 h-5 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          {{ tenantData.address }}
                      </p>
                      <p class="text-gray-400 mb-2 flex items-center gap-2 text-sm">
                          <svg class="w-5 h-5 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                          {{ tenantData.phone }}
                      </p>
                  </div>

                  <!-- Horario -->
                  <div class="lg:col-span-1">
                      <h4 class="text-white font-bold mb-4 uppercase text-xs tracking-wider">Horario</h4>
                      <div class="p-4 bg-gray-800 rounded-lg border border-gray-700 text-sm">
                          <p class="text-gray-300 font-mono">{{ tenantData.websiteConfig?.schedule || 'Lunes a Sábado: 9am - 8pm' }}</p>
                      </div>
                  </div>

                  <!-- Mapa (Embed simple) -->
                  <div class="lg:col-span-1">
                      <div class="rounded-xl overflow-hidden bg-gray-800 h-40 flex items-center justify-center border border-gray-700">
                          <p class="text-gray-500 text-xs flex flex-col items-center">
                              <svg class="w-6 h-6 mb-1 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.806-.984A3 3 0 0115 5.236V4.472a3 3 0 01.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                              Mapa
                          </p>
                      </div>
                  </div>
              </div>

              <div class="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                  <p>&copy; {{ new Date().getFullYear() }} {{ tenantData.name }}. Todos los derechos reservados.</p>
                  <p class="mt-2 md:mt-0">
                      Powered by <a href="https://sonriandes.com" target="_blank" class="text-gray-400 hover:text-white transition-colors font-bold">SonriAndes</a>
                  </p>
              </div>
          </div>
      </footer>

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