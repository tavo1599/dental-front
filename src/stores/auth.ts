import { defineStore } from 'pinia';
import router from '@/router';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';
import { useToast } from 'vue-toastification';
import * as authService from '@/services/authService';
import { uploadLogo as uploadLogoApi, updateTenantProfile as updateTenantProfileApi } from '@/services/tenantService';
import type { Tenant } from '@/types';

// 1. Añadimos 'id' a la interfaz para que TypeScript no se queje
interface UserPayload {
  id: string;
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
  const isImpersonating = ref(!!sessionStorage.getItem('superAdminToken'));

  const isAuthenticated = computed(() => !!token.value);

  function checkToken() {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      token.value = storedToken;
      try {
        const decoded = jwtDecode<UserPayload>(storedToken);
        // 2. Mapeamos 'sub' a 'id' para que el resto de la app lo entienda
        user.value = { ...decoded, id: decoded.sub };
      } catch (e) {
        logout();
      }
    }
  }

  checkToken(); // Se ejecuta al iniciar para cargar la sesión

  async function login(email: string, password: string) {
    try {
      const response = await authService.login(email, password);
      const newToken = response.data.access_token;
      token.value = newToken;
      sessionStorage.setItem('token', newToken);

      const decoded = jwtDecode<UserPayload>(newToken);
      // 3. Hacemos lo mismo aquí al iniciar sesión
      user.value = { ...decoded, id: decoded.sub };

      toast.success('¡Inicio de sesión exitoso!');

      if (user.value.isSuperAdmin) {
        await router.push('/super-admin/dashboard');
      } else {
        await router.push('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Credenciales inválidas.';
      toast.error(errorMessage);
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('superAdminToken');
    isImpersonating.value = false;
    router.push('/login');
  }

  async function refreshUserProfile() {
    if (!token.value) return;
    try {
      const response = await authService.getProfile();
      const freshUser = response.data;

      if (user.value) {
        user.value.tenant = freshUser.tenant;
      }

    } catch (error) {
      toast.error('No se pudo sincronizar el perfil.');
      logout();
    }
  }

  function startImpersonation(impersonationToken: string) {
    sessionStorage.setItem('superAdminToken', token.value!);
    token.value = impersonationToken;
    sessionStorage.setItem('token', impersonationToken);
    isImpersonating.value = true;
    window.location.href = '/dashboard';
  }

  function stopImpersonation() {
    const superAdminToken = sessionStorage.getItem('superAdminToken');
    if (superAdminToken) {
      token.value = superAdminToken;
      sessionStorage.setItem('token', superAdminToken);
      sessionStorage.removeItem('superAdminToken');
      isImpersonating.value = false;
      window.location.href = '/super-admin/dashboard';
    }
  }

  async function handleForgotPassword(email: string) {
    try {
      const response = await authService.forgotPassword(email);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Ocurrió un error al enviar el correo.');
    }
  }

  async function handleResetPassword(tokenParam: string, password: string) {
    try {
      const response = await authService.resetPassword(tokenParam, password);
      toast.success(response.data.message);
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'El token es inválido o ha expirado.');
    }
  }

  function updateToken(newToken: string) {
    token.value = newToken;
    sessionStorage.setItem('token', newToken);
    const decoded = jwtDecode<UserPayload>(newToken);
    user.value = { ...decoded, id: decoded.sub };
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

  async function updateTenantProfile(data: any) {
    try {
      const response = await updateTenantProfileApi(data);
      if (user.value && user.value.tenant) {
        user.value.tenant = { ...user.value.tenant, ...response.data };
        toast.success('Información de la clínica actualizada.');
      }
    } catch (error) {
      toast.error('No se pudo actualizar la información.');
    }
  }

  return { 
    token, 
    user, 
    isAuthenticated, 
    isImpersonating,
    login, 
    logout,
    checkToken,
    startImpersonation, 
    stopImpersonation,
    handleForgotPassword, 
    handleResetPassword,
    updateToken,
    refreshUserProfile,
    uploadClinicLogo,
    updateTenantProfile
  };
});