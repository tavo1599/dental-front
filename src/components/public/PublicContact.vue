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

// Generar enlace a Google Maps
const mapsLink = computed(() => {
    // Si tenemos coordenadas, usamos eso (futura implementación)
    // Por ahora usamos la dirección como query
    const address = props.tenantData?.address || '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
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
                  
                  <!-- Redes Sociales usando imágenes descargadas -->
                  <div class="flex gap-3">
                      <a v-if="tenantData?.websiteConfig?.facebookUrl" :href="tenantData.websiteConfig.facebookUrl" target="_blank" class="social-btn facebook">
                          <img src="/icons/facebook.png" alt="Facebook" class="w-5 h-5 object-contain" />
                      </a>
                      
                      <a v-if="tenantData?.websiteConfig?.instagramUrl" :href="tenantData.websiteConfig.instagramUrl" target="_blank" class="social-btn instagram">
                          <img src="/icons/instagram.png" alt="Instagram" class="w-5 h-5 object-contain" />
                      </a>
                      
                      <a v-if="tenantData?.websiteConfig?.tiktokUrl" :href="tenantData.websiteConfig.tiktokUrl" target="_blank" class="social-btn tiktok">
                          <img src="/icons/tiktok.png" alt="TikTok" class="w-5 h-5 object-contain" />
                      </a>

                      <a v-if="tenantData?.websiteConfig?.youtubeUrl" :href="tenantData.websiteConfig.youtubeUrl" target="_blank" class="social-btn youtube">
                          <img src="/icons/youtube.png" alt="YouTube" class="w-5 h-5 object-contain" />
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

              <!-- Columna 4: Mapa -->
              <div class="lg:col-span-1">
                  <h4 class="text-white font-bold mb-6 uppercase text-xs tracking-wider">Encuéntranos</h4>
                  <a :href="mapsLink" target="_blank" class="block group relative rounded-xl overflow-hidden h-40 bg-gray-800 border border-gray-700">
                      <!-- Mapa estático o placeholder -->
                      <div class="absolute inset-0 flex items-center justify-center bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.714728,-73.998672&zoom=12&size=400x400&maptype=roadmap&sensor=false')] bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity">
                         <!-- Fallback visual si no carga mapa -->
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
</style>