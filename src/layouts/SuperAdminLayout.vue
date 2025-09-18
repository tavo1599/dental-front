<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
</script>
<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <header class="bg-gray-800 shadow-md p-4 flex justify-between items-center">
  <div>
    <h1 class="text-xl font-bold">Panel Super Admin</h1>
    <nav class="flex gap-4 text-sm text-gray-400">
      <RouterLink to="/super-admin/dashboard" active-class="text-white font-bold">Clínicas</RouterLink>
      <RouterLink to="/super-admin/diagnoses" active-class="text-white font-bold">Diagnósticos</RouterLink>
      <RouterLink to="/super-admin/consent-templates" active-class="text-white font-bold">Consentimientos</RouterLink>
    </nav>
  </div>
  <button @click="authStore.logout()" class="btn-secondary">Cerrar Sesión</button>
</header>
    <main class="p-8">
      <RouterView />
    </main>
  </div>
</template>