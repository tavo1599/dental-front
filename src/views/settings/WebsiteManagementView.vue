<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import apiClient from '@/services/api';

const authStore = useAuthStore();
const toast = useToast();
const isLoading = ref(false);
const activeTab = ref('general'); // 'general', 'content', 'images', 'social'

// Datos del formulario
const form = ref({
  domainSlug: '',
  websiteConfig: {
    // Estilos
    primaryColor: '#2563EB',
    secondaryColor: '#1E40AF',
    
    // Textos
    welcomeMessage: '',
    subTitle: '',
    aboutUs: '',
    
    // Contacto
    whatsappNumber: '',
    schedule: '', // Horario
    
    // Redes
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
    
    // Imágenes (URLs por ahora)
    heroImageUrl: '',
    aboutUsImageUrl: '',
    
    // Configuración
    showStaff: true
  }
});

const baseDomain = 'sonriandes.com';

const finalUrl = computed(() => {
  if (!form.value.domainSlug) return '';
  return `https://${form.value.domainSlug}.${baseDomain}`;
});

// Cargar datos actuales
const loadCurrentSettings = async () => {
  // Verificamos user y tenant
  if (authStore.user && authStore.user.tenant) {
     const tenant = authStore.user.tenant;
     form.value.domainSlug = tenant.domainSlug || '';
     
     // Obtenemos la config existente o un objeto vacío
     // Usamos 'as any' en config para facilitar el acceso si el tipo es estricto
     const config = tenant.websiteConfig || {} as any;

     // Mapeo manual seguro (Evita errores de undefined vs string)
     form.value.websiteConfig = { 
        primaryColor: config.primaryColor || '#2563EB',
        secondaryColor: config.secondaryColor || '#1E40AF',
        
        welcomeMessage: config.welcomeMessage || `Bienvenidos a ${tenant.name}`,
        subTitle: config.subTitle || '',
        aboutUs: config.aboutUs || '',
        
        whatsappNumber: config.whatsappNumber || '',
        schedule: config.schedule || '',
        
        facebookUrl: config.facebookUrl || '',
        instagramUrl: config.instagramUrl || '',
        tiktokUrl: config.tiktokUrl || '',
        youtubeUrl: config.youtubeUrl || '',
        
        heroImageUrl: config.heroImageUrl || '',
        aboutUsImageUrl: config.aboutUsImageUrl || '',
        
        // Para booleanos usamos comprobación estricta de undefined
        showStaff: config.showStaff !== undefined ? config.showStaff : true
     };
  }
};

// Guardar cambios
const saveSettings = async () => {
  if (!form.value.domainSlug) {
      toast.error("Debes elegir un identificador (subdominio).");
      return;
  }
  
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(form.value.domainSlug)) {
      toast.error("El subdominio solo acepta letras minúsculas, números y guiones.");
      return;
  }

  isLoading.value = true;
  try {
    const response = await apiClient.patch('/tenants/profile', {
        domainSlug: form.value.domainSlug,
        websiteConfig: form.value.websiteConfig
    });
    
    if (authStore.user) {
        authStore.user.tenant = response.data;
    }
    
    toast.success("¡Sitio web actualizado correctamente!");
  } catch (error: any) {
    if (error.response?.status === 409) {
        toast.error("El subdominio ya está en uso.");
    } else {
        toast.error("Error al guardar.");
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadCurrentSettings();
});
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50/50">
    
    <!-- HEADER DE ACCIÓN -->
    <div class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Constructor de Sitio Web</h2>
        <p class="text-xs text-gray-500 flex items-center gap-1">
           Estado: 
           <span v-if="form.domainSlug" class="text-green-600 font-bold flex items-center">
             ● En línea en <a :href="finalUrl" target="_blank" class="hover:underline ml-1">{{ finalUrl }}</a>
           </span>
           <span v-else class="text-gray-400">● No publicado</span>
        </p>
      </div>
      <button 
         @click="saveSettings" 
         class="px-6 py-2 bg-primary text-white rounded-lg font-bold shadow hover:bg-opacity-90 flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
         :disabled="isLoading"
       >
         <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
         <span v-else class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
         {{ isLoading ? 'Publicando...' : 'Publicar Cambios' }}
       </button>
    </div>

    <div class="flex-1 overflow-hidden p-6">
      <div class="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- COLUMNA IZQUIERDA: EDITOR (5 columnas) -->
        <div class="lg:col-span-5 flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            <!-- TABS DE NAVEGACIÓN -->
            <div class="flex border-b border-gray-100 overflow-x-auto">
                <button @click="activeTab = 'general'" :class="['tab-btn', activeTab === 'general' ? 'active' : '']">General</button>
                <button @click="activeTab = 'content'" :class="['tab-btn', activeTab === 'content' ? 'active' : '']">Contenido</button>
                <button @click="activeTab = 'images'" :class="['tab-btn', activeTab === 'images' ? 'active' : '']">Imágenes</button>
                <button @click="activeTab = 'social'" :class="['tab-btn', activeTab === 'social' ? 'active' : '']">Contacto</button>
            </div>

            <!-- CONTENIDO DE TABS -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
                
                <!-- 1. GENERAL -->
                <div v-if="activeTab === 'general'" class="space-y-5 animate-fade-in">
                    <div>
                        <label class="label">Subdominio (Tu dirección web)</label>
                        <div class="flex items-center">
                            <span class="text-gray-400 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2.5 text-sm">https://</span>
                            <input v-model="form.domainSlug" type="text" placeholder="mi-clinica" class="input rounded-l-none rounded-r-none border-l-0 border-r-0 text-center font-bold text-gray-700">
                            <span class="text-gray-400 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg px-3 py-2.5 text-sm">.sonriandes.com</span>
                        </div>
                        <p class="text-[10px] text-gray-400 mt-1 pl-1">Solo letras minúsculas, números y guiones (-).</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                           <label class="label">Color Principal</label>
                           <div class="flex gap-2 items-center">
                               <input v-model="form.websiteConfig.primaryColor" type="color" class="h-10 w-12 p-0 border-0 rounded cursor-pointer shadow-sm">
                               <input v-model="form.websiteConfig.primaryColor" type="text" class="input uppercase text-center">
                           </div>
                        </div>
                        <div>
                           <label class="label">Color Secundario</label>
                           <div class="flex gap-2 items-center">
                               <input v-model="form.websiteConfig.secondaryColor" type="color" class="h-10 w-12 p-0 border-0 rounded cursor-pointer shadow-sm">
                               <input v-model="form.websiteConfig.secondaryColor" type="text" class="input uppercase text-center">
                           </div>
                        </div>
                    </div>

                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div class="flex items-center gap-3">
                            <input v-model="form.websiteConfig.showStaff" id="showStaff" type="checkbox" class="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary">
                            <div>
                                <label for="showStaff" class="text-sm font-bold text-gray-700">Mostrar Equipo Médico</label>
                                <p class="text-xs text-gray-500">Muestra fotos y especialidades de los doctores.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 2. CONTENIDO -->
                <div v-if="activeTab === 'content'" class="space-y-5 animate-fade-in">
                    <div>
                        <label class="label">Título de Bienvenida</label>
                        <input v-model="form.websiteConfig.welcomeMessage" type="text" class="input" placeholder="Ej: Tu sonrisa es nuestra prioridad">
                    </div>
                    <div>
                        <label class="label">Subtítulo (Opcional)</label>
                        <input v-model="form.websiteConfig.subTitle" type="text" class="input" placeholder="Ej: Especialistas en Ortodoncia y Estética">
                    </div>
                    <div>
                        <label class="label">Sobre Nosotros</label>
                        <textarea v-model="form.websiteConfig.aboutUs" rows="6" class="input" placeholder="Cuenta la historia de tu clínica, misión y experiencia..."></textarea>
                    </div>
                </div>

                <!-- 3. IMÁGENES -->
                <div v-if="activeTab === 'images'" class="space-y-5 animate-fade-in">
                    <div class="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200 mb-2">
                        💡 Por ahora, pega enlaces de imágenes externas (ej. Unsplash, tu Facebook). Próximamente podrás subir archivos directos.
                    </div>
                    <div>
                        <label class="label">URL Imagen de Portada (Hero)</label>
                        <input v-model="form.websiteConfig.heroImageUrl" type="text" class="input" placeholder="https://...">
                        <div v-if="form.websiteConfig.heroImageUrl" class="mt-2 h-32 w-full rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                            <img :src="form.websiteConfig.heroImageUrl" class="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div>
                        <label class="label">URL Imagen "Sobre Nosotros"</label>
                        <input v-model="form.websiteConfig.aboutUsImageUrl" type="text" class="input" placeholder="https://...">
                    </div>
                </div>

                <!-- 4. CONTACTO Y REDES -->
                <div v-if="activeTab === 'social'" class="space-y-5 animate-fade-in">
                    <div>
                        <label class="label">WhatsApp (Para botón de citas)</label>
                        <div class="relative">
                            <input v-model="form.websiteConfig.whatsappNumber" type="text" class="input pl-12" placeholder="51999999999">
                        </div>
                    </div>
                    
                    <div>
                        <label class="label">Horario de Atención</label>
                        <input v-model="form.websiteConfig.schedule" type="text" class="input" placeholder="Ej: Lun - Vie: 9am - 8pm, Sáb: 9am - 1pm">
                    </div>

                    <hr class="border-gray-100 my-2">
                    <p class="text-xs font-bold text-gray-400 uppercase">Redes Sociales (URLs)</p>

                    <div class="grid grid-cols-1 gap-3">
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600 font-bold text-xs">FB</div>
                            <input v-model="form.websiteConfig.facebookUrl" type="text" class="input pl-10" placeholder="facebook.com/tuclinica">
                        </div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-500 font-bold text-xs">IG</div>
                            <input v-model="form.websiteConfig.instagramUrl" type="text" class="input pl-10" placeholder="instagram.com/tuclinica">
                        </div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black font-bold text-xs">TK</div>
                            <input v-model="form.websiteConfig.tiktokUrl" type="text" class="input pl-10" placeholder="tiktok.com/@tuclinica">
                        </div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-600 font-bold text-xs">YT</div>
                            <input v-model="form.websiteConfig.youtubeUrl" type="text" class="input pl-10" placeholder="youtube.com/c/tuclinica">
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- COLUMNA DERECHA: PREVISUALIZACIÓN -->
        <div class="lg:col-span-7 hidden lg:block">
            <div class="sticky top-6">
                <div class="bg-gray-800 rounded-t-2xl p-2 flex items-center gap-2">
                    <div class="flex gap-1.5 ml-2">
                        <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    </div>
                    <div class="flex-1 bg-gray-700 rounded-md text-center py-1 text-xs text-gray-300 font-mono mx-4 truncate opacity-80">
                        {{ finalUrl || 'tu-clinica.sonriandes.com' }}
                    </div>
                </div>
                
                <div class="bg-white h-[650px] overflow-y-auto border-x-4 border-b-4 border-gray-800 rounded-b-2xl shadow-2xl relative scroll-smooth">
                    
                    <!-- MOCKUP DEL SITIO WEB -->
                    
                    <!-- Navbar -->
                    <div class="h-14 border-b flex items-center justify-between px-6 sticky top-0 bg-white/90 backdrop-blur z-10">
                        <span class="font-bold text-lg" :style="{ color: form.websiteConfig.primaryColor }">{{ authStore.user?.tenant?.name || 'LOGO' }}</span>
                        <div class="flex gap-3">
                            <div class="w-12 h-2 bg-gray-200 rounded"></div>
                            <div class="w-12 h-2 bg-gray-200 rounded"></div>
                            <div class="w-20 h-6 rounded text-[10px] text-white flex items-center justify-center font-bold" :style="{ backgroundColor: form.websiteConfig.primaryColor }">Agendar</div>
                        </div>
                    </div>

                    <!-- Hero -->
                    <div class="relative h-64 bg-gray-100 flex items-center justify-center text-center px-8 bg-cover bg-center" 
                         :style="{ backgroundImage: form.websiteConfig.heroImageUrl ? `url(${form.websiteConfig.heroImageUrl})` : '', backgroundColor: '#f3f4f6' }">
                        
                        <div v-if="!form.websiteConfig.heroImageUrl" class="absolute inset-0 flex items-center justify-center opacity-10 font-bold text-4xl text-gray-300 pointer-events-none">IMAGEN PORTADA</div>
                        <div class="absolute inset-0 bg-black/40"></div> <!-- Overlay -->
                        
                        <div class="relative z-10 text-white">
                            <h1 class="text-2xl font-bold mb-2 leading-tight">{{ form.websiteConfig.welcomeMessage || 'Tu Título Principal' }}</h1>
                            <p class="text-sm opacity-90 mb-4">{{ form.websiteConfig.subTitle || 'Tu subtítulo aquí' }}</p>
                            <button class="px-5 py-2 rounded-full font-bold text-xs shadow-lg transition-transform hover:scale-105" :style="{ backgroundColor: form.websiteConfig.primaryColor }">
                                Reservar Cita
                            </button>
                        </div>
                    </div>

                    <!-- Servicios (Mock) -->
                    <div class="py-8 px-6 bg-white text-center">
                        <h3 class="text-xs font-bold text-gray-400 uppercase mb-4">Nuestros Servicios</h3>
                        <div class="flex justify-center gap-4">
                            <div class="w-20 h-24 bg-gray-50 rounded border border-gray-100 flex flex-col items-center justify-center gap-2 p-2">
                                <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-[10px]">🦷</div>
                                <div class="w-10 h-1.5 bg-gray-200 rounded"></div>
                            </div>
                            <div class="w-20 h-24 bg-gray-50 rounded border border-gray-100 flex flex-col items-center justify-center gap-2 p-2">
                                <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-[10px]">✨</div>
                                <div class="w-10 h-1.5 bg-gray-200 rounded"></div>
                            </div>
                            <div class="w-20 h-24 bg-gray-50 rounded border border-gray-100 flex flex-col items-center justify-center gap-2 p-2">
                                <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-[10px]">🔧</div>
                                <div class="w-10 h-1.5 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Equipo (Mock) -->
                    <div v-if="form.websiteConfig.showStaff" class="py-8 px-6 bg-gray-50 text-center border-t border-gray-100">
                         <h3 class="text-xs font-bold text-gray-400 uppercase mb-4">Nuestro Equipo</h3>
                         <div class="flex justify-center gap-6">
                             <div class="flex flex-col items-center">
                                 <div class="w-12 h-12 rounded-full bg-gray-300 mb-2"></div>
                                 <div class="w-16 h-2 bg-gray-300 rounded mb-1"></div>
                                 <div class="w-10 h-1.5 bg-gray-200 rounded"></div>
                             </div>
                             <div class="flex flex-col items-center">
                                 <div class="w-12 h-12 rounded-full bg-gray-300 mb-2"></div>
                                 <div class="w-16 h-2 bg-gray-300 rounded mb-1"></div>
                                 <div class="w-10 h-1.5 bg-gray-200 rounded"></div>
                             </div>
                         </div>
                    </div>

                    <!-- Footer (Mock) -->
                    <div class="bg-gray-900 text-white p-6 text-center text-xs">
                        <p class="font-bold mb-2">{{ authStore.user?.tenant?.name }}</p>
                        <p class="text-gray-500 mb-4">{{ form.websiteConfig.schedule || 'Horario...' }}</p>
                        <div class="flex justify-center gap-3 opacity-60">
                             <div v-if="form.websiteConfig.facebookUrl" class="w-6 h-6 bg-gray-700 rounded-full"></div>
                             <div v-if="form.websiteConfig.instagramUrl" class="w-6 h-6 bg-gray-700 rounded-full"></div>
                             <div v-if="form.websiteConfig.tiktokUrl" class="w-6 h-6 bg-gray-700 rounded-full"></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.label { @apply block text-xs font-bold text-gray-500 uppercase mb-1.5; }
.input { @apply w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-primary transition-all; }
.tab-btn { @apply px-5 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 transition-colors whitespace-nowrap; }
.tab-btn.active { @apply text-primary border-primary font-bold bg-blue-50/50; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
</style>