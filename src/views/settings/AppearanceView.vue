<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { uploadLogo } from '@/services/tenantService';
import { useToast } from 'vue-toastification'; // <-- 1. Importa useToast

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const fileInput = ref<HTMLInputElement | null>(null);
const toast = useToast();

const logoSrc = computed(() => {
  if (user.value?.tenant?.logoUrl) {
    // Usa la variable de entorno para construir la URL
    return `${import.meta.env.VITE_API_BASE_URL}${user.value.tenant.logoUrl}`;
  }
  return '';
});

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    try {
      const response = await uploadLogo(file);
      if (user.value && user.value.tenant) {
        user.value.tenant.logoUrl = response.data.logoUrl;
        toast.success('Logo actualizado con éxito.');
      }
    } catch (error) {
      toast.error('No se pudo subir el logo.');
    }
  }
}

function triggerFileInput() {
  fileInput.value?.click();
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-md p-6 max-w-2xl">
      <h2 class="text-xl font-bold text-text-dark mb-4">Logo de la Clínica</h2>
      
      <div class="flex items-center gap-6">
        <div class="w-24 h-24 bg-light-gray rounded-full flex items-center justify-center overflow-hidden border">
          <img 
            v-if="logoSrc" 
            :src="logoSrc" 
            alt="Logo de la clínica" 
            class="w-full h-full object-cover"
          >
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6l.25-.25a2 2 0 012.828 0l.25.25m-3 3l.25.25a2 2 0 010 2.828l-.25.25m0 0l-3 3m0 0l-3.586-3.586a2 2 0 010-2.828l3.586-3.586m0 0L12 6" />
          </svg>
        </div>
        
        <div>
          <p class="text-text-light mb-2">Sube una imagen cuadrada (.png, .jpg). Se convertirá a WebP.</p>
          <button @click="triggerFileInput" class="btn-primary">
            Subir Nuevo Logo
          </button>
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileChange" 
            class="hidden" 
            accept="image/png, image/jpeg"
          >
        </div>
      </div>
    </div>
  </div>
</template>