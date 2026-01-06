<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import apiClient from '@/services/api';

const tenantData = ref<any>(null);
const isLoading = ref(true);
const error = ref(false);

// Colores por defecto
const defaultPrimary = '#2563EB';
const defaultSecondary = '#1E40AF';

// Obtener subdominio
const getSubdomain = () => {
  const host = window.location.host;
  const parts = host.split('.');
  if (parts.length >= 2) return parts[0];
  return null;
};

// Cargar datos de la clínica pública
const loadTenantData = async () => {
  const slug = getSubdomain();
  
  // Validación de seguridad
  if (!slug || slug === 'app' || slug === 'www') {
    // MODIFICACIÓN: Si estamos en modo desarrollo, no redirigir a producción para facilitar pruebas
    if (import.meta.env.DEV) {
        console.warn("DEV MODE: No se detectó un subdominio válido (slug). Se detiene la carga.");
        error.value = true;
        isLoading.value = false;
        return;
    }

    // En producción, si entran mal, los mandamos a la landing principal
    window.location.href = 'https://sonriandes.com';
    return;
  }

  try {
    const response = await apiClient.get(`/public/tenants/${slug}`);
    tenantData.value = response.data;
    
    updateColors();
    updateMetaTags();

  } catch (e) {
    console.error("Clínica no encontrada", e);
    error.value = true;
  } finally {
    isLoading.value = false;
  }
};

const updateColors = () => {
    if (!tenantData.value?.websiteConfig) return;
    const { primaryColor, secondaryColor } = tenantData.value.websiteConfig;
    document.documentElement.style.setProperty('--clinic-primary', primaryColor || defaultPrimary);
    document.documentElement.style.setProperty('--clinic-secondary', secondaryColor || defaultSecondary);
};

const updateMetaTags = () => {
    document.title = tenantData.value?.name || 'Clínica Dental';
    // Aquí podrías actualizar favicon dinámicamente si quisieras
};

// Helpers de Assets (R2)
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
    return null; // Usará el fallback en CSS
};

const getDoctorPhoto = (photoUrl?: string) => {
    if (!photoUrl) return 'https://via.placeholder.com/300x300?text=Doctor'; // Placeholder
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${import.meta.env.VITE_API_BASE_URL}${photoUrl}`;
};

// Doctores Filtrados (Solo mostramos los que tienen rol dentista o admin y están activos)
const publicDoctors = computed(() => {
    if (!tenantData.value?.users) return [];
    return tenantData.value.users.filter((u: any) => u.role === 'dentist' || u.role === 'admin');
});

// Enlace de WhatsApp
const whatsappLink = computed(() => {
    const number = tenantData.value?.websiteConfig?.whatsappNumber;
    if (!number) return null;
    const text = encodeURIComponent(`Hola ${tenantData.value.name}, quisiera agendar una cita.`);
    return `https://wa.me/${number}?text=${text}`;
});

// Función para scroll al inicio (Soluciona error de window en template)
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  loadTenantData();
});
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-slate-800 clinic-theme">
    
    <!-- LOADING -->
    <div v-if="isLoading" class="h-screen flex items-center justify-center bg-gray-50">
      <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
    </div>

    <!-- ERROR -->
    <div v-else-if="error" class="h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <h1 class="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p class="text-xl text-gray-600 mb-6">No encontramos la clínica que buscas.</p>
      
      <!-- Mensaje de ayuda extra en modo desarrollo -->
      <p v-if="error && !tenantData" class="text-xs text-orange-500 mb-4 bg-orange-50 p-2 rounded border border-orange-200">
         Tip Dev: Asegúrate de acceder vía <strong>slug.localhost:port</strong> y que el slug exista en tu BD local.
      </p>

      <a href="https://sonriandes.com" class="px-6 py-2 bg-primary text-white rounded-full font-bold hover:opacity-90">Volver al Inicio</a>
    </div>

    <!-- SITIO WEB -->
    <div v-else>
      
      <!-- NAVBAR -->
      <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center gap-3 cursor-pointer" @click="scrollToTop">
              <img v-if="getLogoUrl()" :src="getLogoUrl()!" class="h-12 w-auto object-contain" alt="Logo" />
              <span v-else class="font-bold text-2xl text-primary tracking-tight">{{ tenantData.name }}</span>
            </div>
            
            <!-- Menú Desktop -->
            <div class="hidden md:flex items-center space-x-8">
              <a href="#inicio" class="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Inicio</a>
              <a href="#servicios" class="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Tratamientos</a>
              <a v-if="tenantData.websiteConfig?.showStaff" href="#equipo" class="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Doctores</a>
              <a href="#contacto" class="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Contacto</a>
              
              <a v-if="whatsappLink" :href="whatsappLink" target="_blank" class="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:opacity-90 transition-transform hover:scale-105 shadow-lg shadow-primary/30 flex items-center gap-2">
                 <span>Agendar Cita</span>
                 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- HERO SECTION -->
      <header id="inicio" class="relative bg-gray-900 py-32 lg:py-48 overflow-hidden flex items-center justify-center">
         <!-- Imagen de Fondo -->
         <div class="absolute inset-0 z-0">
             <div 
                class="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105"
                :style="{ 
                    backgroundImage: getHeroImage() || 'url(https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1974&auto=format&fit=crop)' 
                }"
             ></div>
             <div class="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/60"></div>
         </div>

         <div class="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg leading-tight">
               {{ tenantData.websiteConfig?.welcomeMessage || `Bienvenidos a ${tenantData.name}` }}
            </h1>
            <p v-if="tenantData.websiteConfig?.subTitle" class="mt-4 text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto">
               {{ tenantData.websiteConfig.subTitle }}
            </p>
            
            <div class="mt-10 flex flex-col sm:flex-row justify-center gap-4">
               <a v-if="whatsappLink" :href="whatsappLink" target="_blank" class="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-xl hover:bg-opacity-90 transition-all transform hover:-translate-y-1">
                  Reservar una Cita
               </a>
               <a href="#servicios" class="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all">
                  Ver Tratamientos
               </a>
            </div>
         </div>
      </header>

      <!-- SERVICIOS / ESPECIALIDADES -->
      <section id="servicios" class="py-20 bg-gray-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="text-center mb-16">
                  <h2 class="text-primary font-bold uppercase tracking-wider text-sm mb-2">Nuestros Servicios</h2>
                  <h3 class="text-3xl md:text-4xl font-extrabold text-gray-900">Cuidamos cada detalle de tu sonrisa</h3>
              </div>

              <!-- Grid de Servicios (Estático por ahora, configurable a futuro) -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <!-- Tarjeta 1 -->
                  <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
                      <div class="w-14 h-14 bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h4 class="text-xl font-bold text-gray-900 mb-3">Estética Dental</h4>
                      <p class="text-gray-600 leading-relaxed">Diseño de sonrisa, blanqueamientos y carillas para que luzcas radiante.</p>
                  </div>

                  <!-- Tarjeta 2 -->
                  <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
                      <div class="w-14 h-14 bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                           <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      </div>
                      <h4 class="text-xl font-bold text-gray-900 mb-3">Ortodoncia</h4>
                      <p class="text-gray-600 leading-relaxed">Brackets metálicos, estéticos e invisibles para alinear tu dentadura.</p>
                  </div>

                  <!-- Tarjeta 3 -->
                  <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
                      <div class="w-14 h-14 bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </div>
                      <h4 class="text-xl font-bold text-gray-900 mb-3">Implantes y Cirugía</h4>
                      <p class="text-gray-600 leading-relaxed">Recupera la funcionalidad y estética de tu boca con implantes de alta gama.</p>
                  </div>
              </div>
          </div>
      </section>

      <!-- EQUIPO MÉDICO -->
      <section v-if="tenantData.websiteConfig?.showStaff && publicDoctors.length > 0" id="equipo" class="py-20 bg-white border-t border-gray-100">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="text-center mb-16">
                  <h2 class="text-primary font-bold uppercase tracking-wider text-sm mb-2">Nuestro Equipo</h2>
                  <h3 class="text-3xl md:text-4xl font-extrabold text-gray-900">Profesionales a tu servicio</h3>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div v-for="doc in publicDoctors" :key="doc.id" class="flex flex-col items-center text-center group">
                      <div class="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-50 shadow-lg mb-6 relative">
                          <img :src="getDoctorPhoto(doc.photoUrl)" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Doctor" />
                      </div>
                      <h4 class="text-xl font-bold text-gray-900">{{ doc.fullName }}</h4>
                      <p class="text-primary font-medium mb-2">{{ doc.specialty || 'Cirujano Dentista' }}</p>
                      <p v-if="doc.cmp" class="text-xs text-gray-400 uppercase tracking-widest mb-3">COP: {{ doc.cmp }}</p>
                      <p v-if="doc.bio" class="text-sm text-gray-500 max-w-xs mx-auto line-clamp-3">{{ doc.bio }}</p>
                  </div>
              </div>
          </div>
      </section>

      <!-- SOBRE NOSOTROS -->
      <section id="nosotros" class="py-20 bg-gray-50 border-t border-gray-100">
         <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div class="order-2 lg:order-1">
                     <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Sobre {{ tenantData.name }}</h2>
                     <div class="text-lg text-gray-600 leading-relaxed space-y-4 whitespace-pre-line">
                        {{ tenantData.websiteConfig?.aboutUs || 'Somos una clínica dental comprometida con la excelencia...' }}
                     </div>
                 </div>
                 <div class="order-1 lg:order-2">
                     <div class="relative rounded-2xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
                         <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop" class="w-full h-auto object-cover" alt="Consultorio" />
                     </div>
                 </div>
             </div>
         </div>
      </section>

      <!-- CONTACTO Y FOOTER -->
      <footer id="contacto" class="bg-gray-900 text-white pt-20 pb-10">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                  
                  <!-- Info -->
                  <div>
                      <div class="flex items-center gap-2 mb-6">
                         <img v-if="getLogoUrl()" :src="getLogoUrl()!" class="h-8 w-auto brightness-0 invert" alt="Logo" />
                         <span class="text-xl font-bold">{{ tenantData.name }}</span>
                      </div>
                      <p class="text-gray-400 mb-6">Tu salud bucal en las mejores manos.</p>
                      
                      <!-- Redes Sociales -->
                      <div class="flex gap-4">
                          <a v-if="tenantData.websiteConfig?.facebookUrl" :href="tenantData.websiteConfig.facebookUrl" target="_blank" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                          </a>
                          <a v-if="tenantData.websiteConfig?.instagramUrl" :href="tenantData.websiteConfig.instagramUrl" target="_blank" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </a>
                          <a v-if="tenantData.websiteConfig?.tiktokUrl" :href="tenantData.websiteConfig.tiktokUrl" target="_blank" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-black hover:border-white border border-transparent transition-colors">
                             <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.62-1.12-1.76-2.5-3.52-5-5.28-7.5zm-5.04 1.02c.02 0 .04 0 .06.01.03.01.06.02.09.02 1.32.02 2.64.02 3.96.03v15.6c-.01 2.94-2.4 5.33-5.34 5.33-2.94.01-5.33-2.38-5.33-5.33-.01-2.94 2.39-5.33 5.33-5.33.68 0 1.36.14 1.99.42l.62-3.88c-4.99-.97-9.87 2.27-10.84 7.26-.97 4.99 2.27 9.87 7.26 10.84 4.99.97 9.87-2.27 10.84-7.26.17-.85.22-1.72.16-2.58v-9.56c1.78 1.27 3.94 1.95 6.14 1.94v-4.04c-3.23.08-6.1-1.89-7.38-4.83l-3.23 5.5z"/></svg>
                          </a>
                      </div>
                  </div>

                  <!-- Horario y Contacto -->
                  <div>
                      <h4 class="text-lg font-bold mb-4">Visítanos</h4>
                      <p class="text-gray-400 mb-2 flex items-start gap-2">
                          <svg class="w-5 h-5 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          {{ tenantData.address }}
                      </p>
                      <p class="text-gray-400 mb-2 flex items-center gap-2">
                          <svg class="w-5 h-5 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                          {{ tenantData.phone }}
                      </p>
                      <div class="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                          <p class="text-xs text-gray-400 uppercase font-bold mb-1">Horario de Atención</p>
                          <p class="text-white font-mono text-sm">{{ tenantData.websiteConfig?.schedule || 'Lunes a Sábado: 9am - 8pm' }}</p>
                      </div>
                  </div>

                  <!-- Mapa (Embed simple dinámico por lat/lng o estático por ahora) -->
                  <div class="rounded-xl overflow-hidden bg-gray-800 h-48 flex items-center justify-center">
                      <!-- Aquí iría un Google Maps real con las coordenadas -->
                      <p class="text-gray-500 text-sm flex flex-col items-center">
                          <svg class="w-8 h-8 mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.806-.984A3 3 0 0115 5.236V4.472a3 3 0 01.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                          Mapa de Ubicación
                      </p>
                  </div>
              </div>

              <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
                  <p>&copy; {{ new Date().getFullYear() }} {{ tenantData.name }}. Todos los derechos reservados.</p>
                  <p class="mt-2 md:mt-0 flex items-center gap-1">
                      Powered by <a href="https://sonriandes.com" target="_blank" class="text-gray-500 hover:text-white font-bold">SonriAndes</a>
                  </p>
              </div>
          </div>
      </footer>

      <!-- Floating WA -->
      <a v-if="whatsappLink" :href="whatsappLink" target="_blank" class="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform">
         <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
      </a>

    </div>
  </div>
</template>

<style scoped>
/* Variables CSS Dinámicas */
.clinic-theme {
  --clinic-primary: #2563EB;
  --clinic-secondary: #1E40AF;
}

/* Clases de utilidad que usan las variables */
.text-primary { color: var(--clinic-primary); }
.bg-primary { background-color: var(--clinic-primary); }
.border-primary { border-color: var(--clinic-primary); }
.shadow-primary\/30 { shadow-color: var(--clinic-primary); }
</style>