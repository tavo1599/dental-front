<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';

interface Announcement {
  id: string;
  message: string;
}

const announcement = ref<Announcement | null>(null);
const isVisible = ref(false);

onMounted(async () => {
  try {
    const response = await apiClient.get('/announcements/active');
    if (response.data) {
      announcement.value = response.data;
      isVisible.value = true; // Si hay un anuncio, siempre lo mostramos al cargar
    }
  } catch (error) {
    console.error("No se pudo cargar el anuncio activo.");
  }
});

function dismiss() {
  // Ahora, 'dismiss' simplemente oculta el banner, no guarda nada
  isVisible.value = false;
}
</script>

<template>
  <div v-if="isVisible && announcement" class="bg-primary text-white p-3 text-center text-sm relative">
    <div class="flex justify-center items-center gap-4">
      <span><strong>Anuncio:</strong> {{ announcement.message }}</span>
    </div>
    <button @click="dismiss" class="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-xl hover:opacity-75">&times;</button>
  </div>
</template>