<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuditStore } from '@/stores/audit';
import { storeToRefs } from 'pinia';

// --- ESTADOS GLOBALES (PINIA) ---
const store = useAuditStore();
const { logs, isLoading } = storeToRefs(store);

// --- ESTADOS DEL PAGINADOR ---
const currentPage = ref(1);
const itemsPerPage = 10; // Cambia a 15 o 20 si deseas ver más registros por página

// --- LÓGICA DE PAGINACIÓN ---
// 1. Calcula el total de páginas
const totalPages = computed(() => {
  return Math.ceil(logs.value.length / itemsPerPage);
});

// 2. Extrae solo los registros correspondientes a la página actual
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return logs.value.slice(start, end);
});

// 3. Funciones para cambiar de página
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

// --- OBTENER DATOS ---
const fetchAuditLogs = async () => {
  currentPage.value = 1; // Regresar a la primera página al actualizar
  await store.fetchLogs();
};

// Formateador de fecha
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('es-PE', { 
    dateStyle: 'short',
    timeStyle: 'medium',
  });
};

onMounted(() => {
  fetchAuditLogs();
});
</script>

<template>
  <div>
    <!-- CONTENEDOR DE LA TABLA -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      <!-- HEADER DE LA TABLA -->
      <div class="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold text-gray-800">Registro de Auditoría</h2>
          <p class="text-sm text-gray-500">Historial de acciones críticas del sistema.</p>
        </div>
        <button @click="fetchAuditLogs" class="text-gray-500 hover:text-primary transition-colors" title="Actualizar">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      <!-- CONTENIDO (LOADING O TABLA) -->
      <div class="p-6">
        <div v-if="isLoading" class="flex justify-center py-10">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
        
        <div v-else-if="logs.length === 0" class="text-center py-10 text-gray-500">
          No hay registros de auditoría disponibles.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-600">
            <thead class="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" class="px-4 py-3 font-semibold">Fecha y Hora</th>
                <th scope="col" class="px-4 py-3 font-semibold">Usuario</th>
                <th scope="col" class="px-4 py-3 font-semibold">Acción</th>
                <th scope="col" class="px-4 py-3 font-semibold text-center">Módulo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <!-- EFECTO CEBRA APLICADO AQUÍ -->
              <tr v-for="log in paginatedLogs" :key="log.id" class="odd:bg-white even:bg-gray-50 hover:bg-blue-50/50 transition-colors">
                <td class="px-4 py-3 whitespace-nowrap text-gray-500">
                  {{ formatDate(log.timestamp) }}
                </td>
                <td class="px-4 py-3 font-medium text-gray-800">
                  {{ log.user?.fullName || 'Sistema' }}
                </td>
                <td class="px-4 py-3">
                  <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full font-mono">
                    {{ log.action }}
                  </span>
                </td>
                <!-- Dejamos un guión fijo porque tu modelo no tiene un campo 'module' -->
                <td class="px-4 py-3 text-gray-400 text-center">
                  -
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div> <!-- FIN CONTENEDOR TABLA -->

    <!-- FOOTER: CONTROLES DE PAGINACIÓN (BLOQUE INDEPENDIENTE) -->
    <div v-if="!isLoading && logs.length > 0" class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      
      <div class="text-sm text-gray-500">
        Mostrando <span class="font-bold text-gray-800">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> a 
        <span class="font-bold text-gray-800">{{ Math.min(currentPage * itemsPerPage, logs.length) }}</span> 
        de <span class="font-bold text-gray-800">{{ logs.length }}</span> resultados
      </div>
      
      <div class="flex items-center space-x-2">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        
        <span class="text-sm text-gray-600 px-2">
          Página <span class="font-bold">{{ currentPage }}</span> de {{ totalPages }}
        </span>
        
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>

    </div>

  </div>
</template>

<style scoped>
.text-primary { color: var(--clinic-primary, #2563EB); }
.border-primary { border-color: var(--clinic-primary, #2563EB); }
</style>