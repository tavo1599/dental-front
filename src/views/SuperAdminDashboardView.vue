<script setup lang="ts">
import { onMounted } from 'vue';
import { useSuperAdminStore } from '@/stores/superAdmin';
import { storeToRefs } from 'pinia';

const superAdminStore = useSuperAdminStore();
const { tenants, isLoading } = storeToRefs(superAdminStore);

onMounted(() => {
  superAdminStore.fetchTenants();
});
</script>
<template>
  <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold mb-4">Clínicas Registradas</h2>
    <div v-if="isLoading">Cargando...</div>
    <table v-else class="w-full text-left">
      <thead>
        <tr class="border-b border-gray-600">
          <th class="p-2">Nombre de la Clínica</th>
          <th class="p-2">ID</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tenant in tenants" :key="tenant.id" class="border-b border-gray-700">
          <td class="p-2">{{ tenant.name }}</td>
          <td class="p-2 font-mono text-sm">{{ tenant.id }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>