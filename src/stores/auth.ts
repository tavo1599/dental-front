import { defineStore } from 'pinia';
import router from '@/router';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';
import { useToast } from 'vue-toastification';
import * as authService from '@/services/authService';
import { uploadLogo as uploadLogoApi } from '@/services/tenantService';
import type { Tenant } from '@/types';

// Interfaz para la información decodificada del token
interface UserPayload {
  sub: string;
  email: string;
  role: string;
  fullName: string;
  isSuperAdmin: boolean;
  tenant: Tenant | null;
}

export const useAuthStore = defineStore('auth', () => {
  const toast = useToast();
  const token = ref(sessionStorage.getItem('token') || null);
  const user = ref<UserPayload | null>(null);
  const isImpersonating = ref(sessionStorage.getItem('superAdminToken') ? true : false);

  const isAuthenticated = computed(() => !!token.value);

  function checkToken() {
    if (token.value) {
      try {
        user.value = jwtDecode<UserPayload>(token.value);
      } catch (e) {
        // Si el token es inválido o ha expirado, limpiamos todo
        logout();
      }
    }
  }

  // Revisa el token al cargar la aplicación
  checkToken();

  async function login(email: string, password: string) {
    try {
      const response = await authService.login(email, password);
      const newToken = response.data.access_token;

      token.value = newToken;
      sessionStorage.setItem('token', newToken);
      user.value = jwtDecode<UserPayload>(newToken);
      
      toast.success('¡Inicio de sesión exitoso!');

      if (user.value.isSuperAdmin) {
        router.push('/super-admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Credenciales inválidas o error de conexión.';
      toast.error(errorMessage);
    }
  }

  function startImpersonation(impersonationToken: string) {
    // 1. Guarda el token de Super Admin en sessionStorage
    sessionStorage.setItem('superAdminToken', token.value!);
    // 2. Establece el nuevo token de la clínica
    token.value = impersonationToken;
    sessionStorage.setItem('token', impersonationToken);
    isImpersonating.value = true;
    // 3. Recarga la página para ir al dashboard de la clínica
    window.location.href = '/dashboard';
  }

  function stopImpersonation() {
    const superAdminToken = sessionStorage.getItem('superAdminToken');
    if (superAdminToken) {
      token.value = superAdminToken;
      sessionStorage.setItem('token', superAdminToken);
      sessionStorage.removeItem('superAdminToken');
      isImpersonating.value = false;
      // Recarga la página para volver al dashboard de Super Admin
      window.location.href = '/super-admin/dashboard';
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('superAdminToken');
    isImpersonating.value = false;
    router.push('/login');
    toast.info('Has cerrado la sesión.');
  }

  async function handleForgotPassword(email: string) {
    try {
      const response = await authService.forgotPassword(email);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Ocurrió un error al enviar el correo.');
    }
  }

  async function handleResetPassword(token: string, password: string) {
    try {
      const response = await authService.resetPassword(token, password);
      toast.success(response.data.message);
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'El token es inválido o ha expirado.');
    }
  }

  function updateToken(newToken: string) {
  token.value = newToken;
  localStorage.setItem('token', newToken);
  user.value = jwtDecode<UserPayload>(newToken);
}

  async function refreshUserProfile() {
    try {
      const response = await authService.getProfile();
      const freshUser = response.data;

      if (user.value) {
        user.value.tenant = freshUser.tenant;
      }
      toast.info('Estado de la conexión verificado.');
    } catch (error) {
      toast.error('No se pudo actualizar el perfil.');
    }
  }

  async function uploadClinicLogo(file: File) {
    try {
      const response = await uploadLogoApi(file);
      if (user.value && user.value.tenant) {
        user.value.tenant.logoUrl = response.data.logoUrl;
        toast.success('Logo actualizado con éxito.');
      }
    } catch (error) {
      toast.error('No se pudo subir el logo.');
    }
  }

  return { 
    token, 
    user, 
    isAuthenticated, 
    isImpersonating,
    login, 
    logout, 
    startImpersonation, 
    stopImpersonation,
    handleForgotPassword, 
    handleResetPassword,
    updateToken,
    refreshUserProfile,
    uploadClinicLogo
  };
});