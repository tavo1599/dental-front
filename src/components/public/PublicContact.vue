<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  tenantData: any;
}>();

const getLogoUrl = () => {
    const url = props.tenantData?.logoUrl;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_BASE_URL}${url}`;
};

// Generar enlace a Google Maps (si es un link normal o la dirección)
const mapsLink = computed(() => {
    const configuredUrl = props.tenantData?.websiteConfig?.mapsUrl;
    // Si el usuario configuró un link normal (y no un código HTML)
    if (configuredUrl && !configuredUrl.includes('<iframe')) {
        return configuredUrl;
    }
    
    // Si no hay link, usamos la dirección como búsqueda por defecto
    const address = props.tenantData?.address || '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
});

// Extraer Iframe si el usuario pegó el código "Insertar mapa" de Google
const mapsIframe = computed(() => {
    const configuredStr = props.tenantData?.websiteConfig?.mapsUrl;
    if (configuredStr && configuredStr.includes('<iframe')) {
        return configuredStr;
    }
    return null;
});
</script>

<template>
  <footer id="contacto" class="bg-gray-900 text-white pt-24 pb-10 border-t-4 border-primary">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              
              <!-- Columna 1: Marca y Redes -->
              <div class="lg:col-span-1">
                  <div class="flex items-center gap-3 mb-6">
                     <div v-if="getLogoUrl()" class="p-2 bg-white rounded-lg inline-block">
                        <img :src="getLogoUrl()!" class="h-8 w-auto" alt="Logo" />
                     </div>
                     <span class="text-xl font-bold tracking-tight">{{ tenantData?.name }}</span>
                  </div>
                  <p class="text-gray-400 text-sm leading-relaxed mb-8">
                    Comprometidos con tu sonrisa y bienestar dental, utilizando tecnología de punta y un trato humano.
                  </p>
                  
                  <!-- Redes Sociales usando SVGs Oficiales en Línea -->
                  <div class="flex gap-3">
                      <a v-if="tenantData?.websiteConfig?.facebookUrl" :href="tenantData.websiteConfig.facebookUrl" target="_blank" class="social-btn facebook" title="Facebook">
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"/></svg>
                      </a>
                      
                      <a v-if="tenantData?.websiteConfig?.instagramUrl" :href="tenantData.websiteConfig.instagramUrl" target="_blank" class="social-btn instagram" title="Instagram">
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      </a>
                      
                      <a v-if="tenantData?.websiteConfig?.tiktokUrl" :href="tenantData.websiteConfig.tiktokUrl" target="_blank" class="social-btn tiktok" title="TikTok">
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                      </a>

                      <a v-if="tenantData?.websiteConfig?.youtubeUrl" :href="tenantData.websiteConfig.youtubeUrl" target="_blank" class="social-btn youtube" title="YouTube">
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </a>
                  </div>
              </div>

              <!-- Columna 2: Ubicación -->
              <div class="lg:col-span-1">
                  <h4 class="text-white font-bold mb-6 uppercase text-xs tracking-wider">Ubicación</h4>
                  <ul class="space-y-4 text-sm text-gray-400">
                      <li class="flex items-start gap-3">
                          <svg class="w-5 h-5 flex-shrink-0 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          <span>{{ tenantData?.address || 'Dirección no registrada' }}</span>
                      </li>
                      <li class="flex items-center gap-3">
                          <svg class="w-5 h-5 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                          <span>{{ tenantData?.phone || 'Sin teléfono' }}</span>
                      </li>
                      <li class="flex items-center gap-3">
                          <svg class="w-5 h-5 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                          <span>{{ tenantData?.email || 'Sin correo' }}</span>
                      </li>
                  </ul>
              </div>

              <!-- Columna 3: Horario -->
              <div class="lg:col-span-1">
                  <h4 class="text-white font-bold mb-6 uppercase text-xs tracking-wider">Horario</h4>
                  <div class="p-5 bg-gray-800/50 rounded-xl border border-gray-700/50 text-sm">
                      <p class="text-gray-300 font-mono leading-relaxed whitespace-pre-line">
                          {{ tenantData?.websiteConfig?.schedule || 'Lunes a Sábado:\n9:00 am - 8:00 pm' }}
                      </p>
                  </div>
              </div>

              <!-- Columna 4: Mapa Dinámico -->
              <div class="lg:col-span-1">
                  <h4 class="text-white font-bold mb-6 uppercase text-xs tracking-wider">Encuéntranos</h4>
                  
                  <!-- Si el usuario pegó el código Iframe (Insertar Mapa de Google) -->
                  <div v-if="mapsIframe" class="w-full h-40 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 iframe-container" v-html="mapsIframe">
                  </div>

                  <!-- Si solo hay link o usamos el buscador por dirección -->
                  <a v-else :href="mapsLink" target="_blank" class="block group relative rounded-xl overflow-hidden h-40 bg-gray-800 border border-gray-700">
                      <!-- Placeholder estático si no hay iframe -->
                      <div class="absolute inset-0 flex items-center justify-center bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.714728,-73.998672&zoom=12&size=400x400&maptype=roadmap&sensor=false')] bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity">
                         <!-- Fallback visual -->
                         <div class="bg-gray-800 p-2 rounded-full">
                            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                         </div>
                      </div>
                      <div class="absolute bottom-0 left-0 w-full bg-black/60 p-2 text-center text-xs text-white backdrop-blur-sm">
                          Ver en Google Maps
                      </div>
                  </a>
              </div>
          </div>

          <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
              <p>&copy; {{ new Date().getFullYear() }} {{ tenantData?.name }}. Todos los derechos reservados.</p>
              <p class="mt-2 md:mt-0 flex items-center gap-1">
                  Powered by <a href="https://sonriandes.com" target="_blank" class="text-gray-400 hover:text-white transition-colors font-bold">SonriAndes</a>
              </p>
          </div>
      </div>
  </footer>
</template>

<style scoped>
.border-primary { border-color: var(--clinic-primary); }
.text-primary { color: var(--clinic-primary); }

.social-btn {
  @apply w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center transition-all duration-300 text-gray-300;
}
.social-btn:hover { @apply text-white transform -translate-y-1; }
.social-btn.facebook:hover { @apply bg-[#1877F2]; }
.social-btn.instagram:hover { @apply bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]; }
.social-btn.tiktok:hover { @apply bg-black border border-white/20; }
.social-btn.youtube:hover { @apply bg-[#FF0000]; }

/* Asegurar que el iframe de Google Maps ocupe el 100% de su contenedor */
:deep(.iframe-container iframe) {
    width: 100% !important;
    height: 100% !important;
    border: none !important;
}
</style>