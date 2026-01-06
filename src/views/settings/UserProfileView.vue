<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUsersStore } from '@/stores/users';
import { useToast } from 'vue-toastification';
import apiClient from '@/services/api';
import ChangePasswordForm from '@/components/ChangePasswordForm.vue';

const authStore = useAuthStore();
const usersStore = useUsersStore(); // Para manejar el loading del componente hijo
const toast = useToast();

const isLoading = ref(false);
const isUploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const showChangePassword = ref(false); // Control del despliegue

// Datos del formulario
const form = ref({
  fullName: '',
  email: '',
  phone: '',
  specialty: '',
  cmp: '',
  bio: ''
});

// Computed para la foto (usando R2 o fallback)
const photoSrc = computed(() => {
  // Casting a 'any' para asegurar acceso si los tipos fallan
  const user = authStore.user as any;
  const url = user?.photoUrl;
  
  if (!url) return null; 
  if (url.startsWith('http')) return `${url}?t=${Date.now()}`;
  return `${import.meta.env.VITE_API_BASE_URL}${url}?t=${Date.now()}`;
});

// --- CARGAR DATOS FRESCOS DEL BACKEND ---
const loadData = async () => {
  isLoading.value = true;
  try {
      // 1. Pedimos los datos actualizados al servidor
      const response = await apiClient.get('/users/me');
      const user = response.data;

      // 2. Rellenamos el formulario con datos reales de la BD
      form.value = {
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          specialty: user.specialty || '',
          cmp: user.cmp || '',
          bio: user.bio || ''
      };

      // 3. Actualizamos el Store para que la foto y el nombre se reflejen en la barra lateral
      if (authStore.user) {
          // @ts-ignore
          authStore.user = { ...authStore.user, ...user };
      }

  } catch (error) {
      console.error("Error cargando perfil:", error);
      // Fallback: Si falla la API, usamos lo que haya en memoria
      const user = authStore.user as any;
      if (user) {
        form.value.fullName = user.fullName || '';
        form.value.email = user.email || '';
        form.value.phone = user.phone || '';
      }
  } finally {
      isLoading.value = false;
  }
};

// Guardar Texto Perfil
const handleSave = async () => {
  if (!authStore.user) return;
  isLoading.value = true;
  try {
    const response = await apiClient.patch(`/users/${authStore.user.id}`, form.value);
    
    // Actualizar Store con la respuesta confirmada
    const updatedUser = { ...authStore.user, ...response.data };
    // @ts-ignore
    authStore.user = updatedUser;
    
    toast.success('Perfil actualizado correctamente.');
  } catch (error) {
    console.error(error);
    toast.error('Error al guardar cambios.');
  } finally {
    isLoading.value = false;
  }
};

// Guardar Contraseña
const handleChangePassword = async (payload: any) => {
    // Usamos el estado de carga del store porque el componente hijo lo escucha
    // @ts-ignore
    usersStore.isLoading = true; 
    try {
        await apiClient.patch('/users/change-password', payload);
        toast.success('Contraseña actualizada correctamente.');
        showChangePassword.value = false;
    } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Error al actualizar la contraseña.');
    } finally {
        // @ts-ignore
        usersStore.isLoading = false;
    }
}

// Subir Foto
const triggerUpload = () => fileInput.value?.click();

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
     const file = target.files[0];
     
     if (file.size > 2 * 1024 * 1024) {
         toast.warning("La imagen es muy pesada (Máx 2MB).");
         return;
     }

     isUploading.value = true;
     const formData = new FormData();
     formData.append('file', file);

     try {
         const response = await apiClient.post('/users/photo', formData, {
             headers: { 'Content-Type': 'multipart/form-data' }
         });
         
         if (authStore.user) {
             (authStore.user as any).photoUrl = response.data.photoUrl;
         }
         toast.success("Foto de perfil actualizada.");
         // Recargamos para asegurar consistencia
         loadData(); 
     } catch (e) {
         console.error(e);
         toast.error("Error al subir la imagen.");
     } finally {
         isUploading.value = false;
     }
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="max-w-8xl mx-auto px-4 py-8 pb-20">
    
    <!-- Encabezado con Fondo Decorativo -->
    <div class="relative mb-20 md:mb-24">
       <!-- Banner de fondo -->
       <div class="h-48 w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg relative overflow-hidden">
          <div class="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div> <!-- Patrón opcional -->
          <div class="absolute bottom-4 right-6 text-white/80 text-sm font-medium backdrop-blur-sm bg-white/10 px-3 py-1 rounded-full">
            {{ authStore.user?.tenant?.name || 'Clínica Dental' }}
          </div>
       </div>

       <!-- Tarjeta Flotante de Foto y Rol -->
       <div class="absolute -bottom-16 left-6 md:left-10 flex items-end gap-6">
          <div class="relative group cursor-pointer" @click="triggerUpload">
              <!-- Avatar con borde blanco grueso -->
              <div class="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center relative z-10 transition-transform hover:scale-105">
                  <img v-if="photoSrc" :src="photoSrc" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  
                  <!-- Overlay de carga -->
                  <div v-if="isUploading" class="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
              </div>
              
              <!-- Botón cámara -->
              <div class="absolute bottom-2 right-2 z-30 bg-white text-gray-700 p-2 rounded-full shadow-md border border-gray-100 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
              </div>
              <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="handleFileChange" />
          </div>

          <div class="mb-2 md:mb-4">
             <h1 class="text-2xl md:text-3xl font-bold text-gray-800">{{ form.fullName }}</h1>
             <span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider inline-block mt-1 shadow-sm">
                {{ authStore.user?.role }}
             </span>
          </div>
       </div>
    </div>

    <!-- Grid de Contenido -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        
        <!-- Panel Izquierdo: Resumen y Seguridad -->
        <div class="lg:col-span-1 space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                   Datos de Cuenta
                </h3>
                <div class="space-y-4">
                    <div>
                        <label class="text-xs font-bold text-gray-400 uppercase block mb-1">Email</label>
                        <div class="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                           <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                           {{ form.email }}
                        </div>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-400 uppercase block mb-1">ID Usuario</label>
                         <div class="text-xs font-mono text-gray-500 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 truncate">
                           {{ authStore.user?.id }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN SEGURIDAD: Botón desplegable para cambiar contraseña -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button 
                    @click="showChangePassword = !showChangePassword"
                    class="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <div class="flex items-center gap-2 font-bold text-gray-700">
                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        Seguridad
                    </div>
                    <svg class="w-5 h-5 text-gray-400 transform transition-transform" :class="showChangePassword ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                
                <div v-if="showChangePassword" class="p-6 border-t border-gray-100 bg-white animate-fade-in">
                    <p class="text-xs text-gray-500 mb-4">Actualiza tu contraseña periódicamente para mantener tu cuenta segura.</p>
                    <ChangePasswordForm @submit="handleChangePassword" />
                </div>
            </div>
            
        </div>

        <!-- Panel Derecho: Formulario de Edición -->
        <div class="lg:col-span-2">
           <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-between items-center">
                   <h3 class="font-bold text-gray-800">Editar Información</h3>
               </div>
               
               <div class="p-6 space-y-6">
                  <!-- Bloque Contacto -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label class="label">Nombre Completo</label>
                          <input v-model="form.fullName" type="text" class="input bg-gray-50 text-gray-500" disabled title="Contacta al admin para cambiar">
                      </div>
                      <div>
                          <label class="label">Teléfono / Celular</label>
                          <input v-model="form.phone" type="tel" class="input" placeholder="+51 ...">
                      </div>
                  </div>

                  <hr class="border-gray-100">

                  <!-- Bloque Profesional (Solo Dentistas/Admin) -->
                  <div v-if="authStore.user?.role === 'dentist' || authStore.user?.role === 'admin'">
                      <div class="mb-4 flex items-center gap-2">
                         <h4 class="text-sm font-bold text-gray-700">Perfil Profesional</h4>
                         <span class="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Público</span>
                      </div>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                              <label class="label">Especialidad</label>
                              <div class="relative">
                                <input v-model="form.specialty" type="text" class="input pl-10" placeholder="Ej: Ortodoncista">
                              </div>
                          </div>
                          <div>
                              <label class="label">COP / Licencia</label>
                              <div class="relative">
                                <input v-model="form.cmp" type="text" class="input pl-10" placeholder="Ej: 12345">
                              </div>
                          </div>
                      </div>
                      <div>
                          <label class="label">Biografía Breve</label>
                          <textarea v-model="form.bio" rows="4" class="input" placeholder="Escribe una breve descripción de tu experiencia y enfoque..."></textarea>
                          <p class="text-xs text-gray-400 mt-1 text-right">{{ form.bio.length }}/500 caracteres</p>
                      </div>
                  </div>

                  <div class="pt-4 flex justify-end border-t border-gray-100">
                      <button 
                          @click="handleSave" 
                          class="px-8 py-2.5 bg-primary text-white rounded-lg font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                          :disabled="isLoading"
                      >
                          <span v-if="isLoading" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                          {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
                      </button>
                  </div>
               </div>
           </div>
        </div>

    </div>
  </div>
</template>

<style scoped>
.label { @apply block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide; }
.input { @apply w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-primary transition-all; }
.input:disabled { @apply bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
</style>