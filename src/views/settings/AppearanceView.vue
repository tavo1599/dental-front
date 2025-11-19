<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { uploadLogo } from '@/services/tenantService';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const fileInput = ref<HTMLInputElement | null>(null);
const toast = useToast();

const clinicData = ref({
  name: '',
  address: '',
  phone: '',
  email: '',
});

watchEffect(() => {
  if (user.value?.tenant) {
    clinicData.value.name = user.value.tenant.name;
    clinicData.value.address = user.value.tenant.address || '';
    clinicData.value.phone = user.value.tenant.phone || '';
    clinicData.value.email = user.value.tenant.email || '';
  }
});

// --- CAMBIO PRINCIPAL AQUÍ ---
const logoSrc = computed(() => {
  const url = user.value?.tenant?.logoUrl;
  
  // 1. Si no hay URL, retornamos vacío
  if (!url) return '';

  // 2. Si la URL comienza con 'http' o 'https', significa que es una URL absoluta
  // (como las de Cloudflare R2, Firebase, S3, etc.). La usamos tal cual.
  if (url.startsWith('http')) {
    return url;
  }

  // 3. Si no empieza con http, asumimos que es una ruta relativa antigua (/uploads/...)
  // y le pegamos la URL base del API.
  return `${import.meta.env.VITE_API_BASE_URL}${url}`;
});
// -----------------------------

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    try {
      const response = await uploadLogo(file);
      // Actualizamos el store localmente para ver el cambio inmediato
      if (user.value && user.value.tenant) {
        user.value.tenant.logoUrl = response.data.logoUrl;
        toast.success('Logo actualizado con éxito.');
      }
    } catch (error) {
      console.error(error);
      toast.error('No se pudo subir el logo.');
    }
  }
}

function triggerFileInput() {
  fileInput.value?.click();
}

function handleSaveChanges() {
  authStore.updateTenantProfile(clinicData.value);
}
</script>

<template>
  <div class="bg-white overflow-hidden shadow-sm rounded-lg">
    <form @submit.prevent="handleSaveChanges">
      <div class="p-6 border-b">
        <h2 class="text-xl font-bold text-text-dark mb-4">Logo de la Clínica</h2>
        <div class="flex items-center gap-6">
          <!-- Círculo del Logo -->
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
            <img 
              v-if="logoSrc" 
              :src="logoSrc" 
              alt="Logo de la clínica" 
              class="w-full h-full object-cover"
            >
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6l.25-.25a2 2 0 012.828 0l.25.25m-3 3l.25.25a2 2 0 010 2.828l-.25.25m0 0l-3 3m0 0l-3.586-3.586a2 2 0 010-2.828l3.586-3.586m0 0L12 6" />
            </svg>
          </div>
          
          <!-- Botones de subida -->
          <div>
            <p class="text-sm text-gray-500 mb-2">Sube una imagen cuadrada (.png, .jpg). Se optimizará automáticamente.</p>
            <button @click="triggerFileInput" type="button" class="btn-secondary text-sm">
              Cambiar Logo
            </button>
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleFileChange" 
              class="hidden" 
              accept="image/png, image/jpeg, image/webp"
            >
          </div>
        </div>
      </div>

      <div class="p-6">
        <h2 class="text-xl font-bold text-text-dark mb-4">Información de la Clínica</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="clinicName" class="block text-sm font-medium text-gray-700">Nombre de la Clínica</label>
            <input v-model="clinicData.name" type="text" id="clinicName" class="input-style w-full mt-1">
          </div>
          <div>
            <label for="clinicPhone" class="block text-sm font-medium text-gray-700">Teléfono</label>
            <input v-model="clinicData.phone" type="tel" id="clinicPhone" class="input-style w-full mt-1">
          </div>
          <div class="md:col-span-2">
            <label for="clinicEmail" class="block text-sm font-medium text-gray-700">Email de Contacto</label>
            <input v-model="clinicData.email" type="email" id="clinicEmail" class="input-style w-full mt-1">
          </div>
          <div class="md:col-span-2">
            <label for="clinicAddress" class="block text-sm font-medium text-gray-700">Dirección Física</label>
            <input v-model="clinicData.address" type="text" id="clinicAddress" class="input-style w-full mt-1">
          </div>
        </div>
      </div>

      <div class="px-6 py-4 bg-gray-50 text-right rounded-b-lg border-t">
        <button type="submit" class="btn-primary">Guardar Información</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.btn-primary { 
  @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 font-semibold transition-colors shadow-sm; 
}
.btn-secondary { 
  @apply px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm; 
}
.input-style { 
  @apply border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all; 
}
</style>