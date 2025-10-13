import { defineStore } from 'pinia';
import router from '@/router';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';
import { useToast } from 'vue-toastification';
import * as authService from '@/services/authService';
import { uploadLogo as uploadLogoApi, updateTenantProfile as updateTenantProfileApi } from '@/services/tenantService';
import type { Tenant } from '@/types';

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
  const isImpersonating = ref(!!sessionStorage.getItem('superAdminToken'));

  // Esta promesa se resuelve cuando la sesión inicial está verificada
  let sessionChecked: Promise<void> | null = null;

  const isAuthenticated = computed(() => !!token.value);

  async function checkToken() {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken && !user.value) { // Solo ejecuta si el usuario no está ya cargado
      token.value = storedToken;
      try {
        // Pide el perfil completo y actualizado al backend
        await refreshUserProfile();
      } catch (e) {
        logout();
      }
    }
  }
  
  async function refreshUserProfile() {
    if (!token.value) return;
    try {
      const response = await authService.getProfile();
      const freshUser = response.data;
      
      // La clave: decodificamos el token actual y lo fusionamos con los datos frescos
      const decodedUser = jwtDecode<UserPayload>(token.value);
      user.value = {
        ...decodedUser,
        tenant: freshUser.tenant,
      };

    } catch (error) {
      toast.error('No se pudo sincronizar el perfil con el servidor.');
      logout();
    }
  }

  async function login(email: string, password: string) {
    try {
      const response = await authService.login(email, password);
      const newToken = response.data.access_token;
      token.value = newToken;
      sessionStorage.setItem('token', newToken);
      await refreshUserProfile(); // Usamos refresh para obtener todos los datos
      
      toast.success('¡Inicio de sesión exitoso!');

      if (user.value?.isSuperAdmin) {
        await router.push('/super-admin/dashboard');
      } else {
        await router.push('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Credenciales inválidas.';
      toast.error(errorMessage);
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
    user.value = jwtDecode<UserPayload>(newToken);
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
  
  // Inicia la sesión al crear el store
  sessionChecked = checkToken();

  return { 
    token, 
    user, 
    isAuthenticated, 
    isImpersonating,
    sessionChecked, // Exporta la promesa
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