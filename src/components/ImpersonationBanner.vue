<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
</script>
<template>
  <div v-if="authStore.isImpersonating" class="bg-yellow-400 text-yellow-900 font-bold p-3 text-center">
    Estás viendo como un usuario de otra clínica. 
    <button @click="authStore.stopImpersonation()" class="underline hover:text-yellow-700">Volver a tu cuenta de Super Admin</button>
  </div>
</template>