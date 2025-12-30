<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import apiClient from '@/services/api';

const authStore = useAuthStore();
const toast = useToast();
const isLoading = ref(false);

// Datos del formulario
const form = ref({
  domainSlug: '',
  websiteConfig: {
    primaryColor: '#2563EB',
    secondaryColor: '#1E40AF',
    welcomeMessage: '',
    aboutUs: '',
    whatsappNumber: '',
    facebookUrl: '',
    instagramUrl: '',
    showStaff: true
  }
});

// URL base para mostrar el enlace final
const baseDomain = 'sonriandes.com'; // Ojo: en dev podría ser localhost

// Computed para ver la URL final
const finalUrl = computed(() => {
  if (!form.value.domainSlug) return '';
  return `https://${form.value.domainSlug}.${baseDomain}`;
});

// Cargar datos actuales
const loadCurrentSettings = async () => {
  // Verificamos que el usuario y el tenant existan antes de acceder
  if (authStore.user && authStore.user.tenant) {
     const tenant = authStore.user.tenant;
     form.value.domainSlug = tenant.domainSlug || '';
     
     // Mezclar configuración existente con defaults
     if (tenant.websiteConfig) {
        // Aseguramos que se mantengan los valores por defecto si faltan algunos
        form.value.websiteConfig = { 
            ...form.value.websiteConfig, 
            ...tenant.websiteConfig 
        };
     } else {
        form.value.websiteConfig.welcomeMessage = `Bienvenidos a ${tenant.name}`;
     }
  }
};

// Guardar cambios
const saveSettings = async () => {
  if (!form.value.domainSlug) {
      toast.error("Debes elegir un identificador (subdominio) para tu web.");
      return;
  }
  
  // Validación simple de slug (solo letras, numeros y guiones)
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(form.value.domainSlug)) {
      toast.error("El subdominio solo puede tener letras minúsculas, números y guiones.");
      return;
  }

  isLoading.value = true;
  try {
    // Usamos el endpoint existente de actualizar perfil de tenant
    const response = await apiClient.patch('/tenants/profile', {
        domainSlug: form.value.domainSlug,
        websiteConfig: form.value.websiteConfig
    });
    
    // Actualizar el store con los nuevos datos (SOLO SI EL USUARIO EXISTE)
    if (authStore.user) {
        authStore.user.tenant = response.data;
    }
    
    toast.success("¡Sitio web actualizado correctamente!");
  } catch (error: any) {
    console.error(error);
    if (error.response?.status === 409) {
        toast.error("Ese nombre de subdominio ya está ocupado por otra clínica.");
    } else {
        toast.error("Error al guardar la configuración.");
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
  <div class="space-y-6">
    
    <div class="flex justify-between items-center border-b pb-4">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Mi Página Web</h2>
        <p class="text-sm text-gray-500">Configura la presencia digital de tu clínica.</p>
      </div>
      <div v-if="form.domainSlug" class="text-right">
         <a :href="finalUrl" target="_blank" class="text-sm font-bold text-primary hover:underline flex items-center gap-1">
            Ver mi sitio web
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
         </a>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- FORMULARIO IZQUIERDA -->
      <div class="space-y-6">
          
          <!-- 1. Dirección Web -->
          <div class="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
             <h3 class="font-bold text-gray-700 mb-4">1. Dirección Web</h3>
             <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Subdominio</label>
                <div class="flex items-center">
                    <span class="text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-sm">https://</span>
                    <input 
                      v-model="form.domainSlug" 
                      type="text" 
                      placeholder="mi-clinica" 
                      class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none border border-gray-300 focus:ring-primary focus:border-primary sm:text-sm"
                    >
                    <span class="text-gray-500 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md px-3 py-2 text-sm">.sonriandes.com</span>
                </div>
                <p class="text-xs text-gray-400 mt-1">Solo letras minúsculas, números y guiones.</p>
             </div>
          </div>

          <!-- 2. Apariencia -->
          <div class="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
             <h3 class="font-bold text-gray-700 mb-4">2. Apariencia</h3>
             <div class="grid grid-cols-2 gap-4">
                <div>
                   <label class="block text-sm font-medium text-gray-600 mb-1">Color Principal</label>
                   <div class="flex gap-2">
                       <input v-model="form.websiteConfig.primaryColor" type="color" class="h-9 w-14 p-0 border-0 rounded cursor-pointer">
                       <input v-model="form.websiteConfig.primaryColor" type="text" class="flex-1 input-style uppercase">
                   </div>
                </div>
                <div>
                   <label class="block text-sm font-medium text-gray-600 mb-1">Color Secundario</label>
                   <div class="flex gap-2">
                       <input v-model="form.websiteConfig.secondaryColor" type="color" class="h-9 w-14 p-0 border-0 rounded cursor-pointer">
                       <input v-model="form.websiteConfig.secondaryColor" type="text" class="flex-1 input-style uppercase">
                   </div>
                </div>
             </div>
          </div>

          <!-- 3. Contenido -->
          <div class="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
             <h3 class="font-bold text-gray-700 mb-4">3. Contenido</h3>
             
             <div class="space-y-4">
                 <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Mensaje de Bienvenida</label>
                    <input v-model="form.websiteConfig.welcomeMessage" type="text" class="input-style w-full" placeholder="Ej: Cuidamos tu sonrisa...">
                 </div>

                 <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Sobre Nosotros</label>
                    <textarea v-model="form.websiteConfig.aboutUs" rows="4" class="input-style w-full" placeholder="Describe tu clínica, experiencia y valores..."></textarea>
                 </div>

                 <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">Número WhatsApp (sin espacios)</label>
                    <input v-model="form.websiteConfig.whatsappNumber" type="text" class="input-style w-full" placeholder="51999999999">
                 </div>
                 
                 <div class="flex items-center gap-2 pt-2">
                    <input v-model="form.websiteConfig.showStaff" id="showStaff" type="checkbox" class="h-4 w-4 text-primary rounded border-gray-300">
                    <label for="showStaff" class="text-sm text-gray-700">Mostrar equipo médico en la web</label>
                 </div>
             </div>
          </div>

      </div>

      <!-- PREVISUALIZACIÓN DERECHA -->
      <div class="hidden lg:block">
         <div class="sticky top-6">
             <h3 class="font-bold text-gray-400 uppercase tracking-wider text-xs mb-3">Previsualización Simplificada</h3>
             
             <!-- Mockup de Pantalla -->
             <div class="border-4 border-gray-800 rounded-2xl overflow-hidden bg-white shadow-2xl" style="height: 600px;">
                 <!-- Fake Browser Bar -->
                 <div class="bg-gray-100 border-b p-2 flex gap-2 items-center">
                    <div class="flex gap-1">
                        <div class="w-2 h-2 rounded-full bg-red-400"></div>
                        <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <div class="w-2 h-2 rounded-full bg-green-400"></div>
                    </div>
                    <div class="flex-1 bg-white rounded text-[10px] text-center text-gray-500 py-0.5 mx-4 truncate">
                        {{ finalUrl || 'tu-sitio.sonriandes.com' }}
                    </div>
                 </div>

                 <!-- Contenido Mockup -->
                 <div class="h-full overflow-y-auto pb-10">
                     <!-- Navbar Mock -->
                     <div class="h-12 border-b flex items-center justify-between px-4">
                         <span class="font-bold text-sm" :style="{ color: form.websiteConfig.primaryColor }">{{ authStore.user?.tenant?.name || 'TU LOGO' }}</span>
                         <div class="flex gap-2">
                             <div class="w-8 h-2 bg-gray-200 rounded"></div>
                             <div class="w-8 h-2 bg-gray-200 rounded"></div>
                         </div>
                     </div>

                     <!-- Hero Mock -->
                     <div class="py-12 px-6 text-center bg-gray-50">
                         <h1 class="text-xl font-bold text-gray-900 mb-2">{{ form.websiteConfig.welcomeMessage || 'Tu Título Aquí' }}</h1>
                         <p class="text-xs text-gray-500 mb-4">Texto descriptivo de la clínica...</p>
                         <button class="px-4 py-1.5 text-xs text-white rounded-full font-bold" :style="{ backgroundColor: form.websiteConfig.primaryColor }">Agendar Cita</button>
                     </div>

                     <!-- About Mock -->
                     <div class="py-8 px-6">
                         <h2 class="text-sm font-bold mb-2">Sobre Nosotros</h2>
                         <p class="text-xs text-gray-600 whitespace-pre-line">{{ form.websiteConfig.aboutUs || 'Descripción de la clínica...' }}</p>
                     </div>
                     
                     <!-- Staff Mock (Si activo) -->
                     <div v-if="form.websiteConfig.showStaff" class="py-4 px-6 bg-gray-50">
                         <h2 class="text-xs font-bold mb-2 text-center">Nuestro Equipo</h2>
                         <div class="flex justify-center gap-2">
                             <div class="w-10 h-10 rounded-full bg-gray-300"></div>
                             <div class="w-10 h-10 rounded-full bg-gray-300"></div>
                             <div class="w-10 h-10 rounded-full bg-gray-300"></div>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </div>
    
    </div>

    <!-- Botón Guardar Flotante o al final -->
    <div class="flex justify-end pt-6 border-t mt-4">
       <button 
         @click="saveSettings" 
         class="px-6 py-3 bg-primary text-white rounded-lg font-bold shadow hover:bg-opacity-90 flex items-center gap-2 disabled:opacity-50"
         :disabled="isLoading"
       >
         <span v-if="isLoading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
         {{ isLoading ? 'Guardando...' : 'Publicar Cambios' }}
       </button>
    </div>

  </div>
</template>

<style scoped>
.input-style {
  @apply border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary text-sm;
}
</style>