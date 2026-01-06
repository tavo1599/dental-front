<script setup lang="ts">
import { ref } from 'vue';
import { useUsersStore } from '@/stores/users';
import { storeToRefs } from 'pinia';

const usersStore = useUsersStore();
const { isLoading } = storeToRefs(usersStore);

const emit = defineEmits(['submit']);
const formData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const passwordError = ref('');

function handleSubmit() {
  passwordError.value = '';
  if (formData.value.newPassword !== formData.value.confirmPassword) {
    passwordError.value = 'Las nuevas contraseñas no coinciden.';
    return;
  }
  
  emit('submit', {
    currentPassword: formData.value.currentPassword,
    newPassword: formData.value.newPassword,
  });
  
  // Limpia el formulario después de enviar
  formData.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-lg mx-auto">
    <!-- Header visual -->
    <div class="bg-gray-50/50 border-b border-gray-100 p-6 text-center">
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 mb-4 shadow-sm">
        <svg class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-800">Cambiar Contraseña</h3>
      <p class="mt-1 text-xs text-gray-500 max-w-xs mx-auto">
        Por seguridad, ingresa tu contraseña actual antes de establecer una nueva.
      </p>
    </div>

    <div class="p-6">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        
        <div>
          <label for="currentPassword" class="label">Contraseña Actual</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <input v-model="formData.currentPassword" type="password" id="currentPassword" class="input pl-10" placeholder="••••••••" required />
          </div>
        </div>

        <div>
          <label for="newPassword" class="label">Nueva Contraseña</label>
          <div class="relative">
             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 16.536a2.5 2.5 0 11-3.536-3.536l1.793-1.793A6 6 0 1119 7z" /></svg>
             </div>
             <input v-model="formData.newPassword" type="password" id="newPassword" class="input pl-10" placeholder="••••••••" required />
          </div>
          <p class="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
             <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             Mínimo 6 caracteres.
          </p>
        </div>

        <div>
          <label for="confirmPassword" class="label">Confirmar Nueva Contraseña</label>
          <div class="relative">
             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <input v-model="formData.confirmPassword" type="password" id="confirmPassword" class="input pl-10" placeholder="••••••••" required />
          </div>
          <p v-if="passwordError" class="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            {{ passwordError }}
          </p>
        </div>

        <div class="pt-2">
          <button 
            type="submit" 
            class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="mr-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </span>
            {{ isLoading ? 'Actualizando...' : 'Actualizar Contraseña' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.label { @apply block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide; }
.input { @apply w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-primary transition-all placeholder-gray-300; }
</style>