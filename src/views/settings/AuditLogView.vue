<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuditStore } from '@/stores/audit';
import { storeToRefs } from 'pinia';

const store = useAuditStore();
const { logs, isLoading } = storeToRefs(store);

onMounted(() => {
  store.fetchLogs();
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-PE', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
};
</script>
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold text-text-dark mb-4">Registro de Actividad</h2>
    <div v-if="isLoading">Cargando registros...</div>
    <table v-else class="w-full text-left text-sm">
      <thead>
        <tr class="border-b-2">
          <th class="py-2">Fecha y Hora</th>
          <th class="py-2">Usuario</th>
          <th class="py-2">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id" class="border-b">
          <td class="py-2">{{ formatDate(log.timestamp) }}</td>
          <td class="py-2">{{ log.user.fullName }}</td>
          <td class="py-2 font-mono text-xs">{{ log.action }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>