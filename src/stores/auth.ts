import { defineStore } from 'pinia';
import router from '@/router';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';
import { useToast } from 'vue-toastification';
import * as authService from '@/services/authService';
import { 
  uploadLogo as uploadLogoApi, 
  updateTenantProfile as updateTenantProfileApi 
} from '@/services/tenantService';
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

  // Token principal
  const token = ref<string | null>(sessionStorage.getItem('token') || null);

  // Usuario decodificado
  const user = ref<UserPayload | null>(
    token.value ? jwtDecode<UserPayload>(token.value) : null
  );

  // Si existe token de impersonación (modo SuperAdmin suplantando)
  const isImpersonating = ref(!!sessionStorage.getItem('superAdminToken'));

  // Autenticación: se considera activo si hay token en memoria o sessionStorage
  const isAuthenticated = computed(() => {
    return !!token.value || !!sessionStorage.getItem('token');
  });

  /**
   * Verifica si hay un token válido y actualiza el usuario.
   */
async function checkToken() {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      token.value = storedToken;
      try {
        // Decodifica el token para tener una info de usuario básica inicial
        user.value = jwtDecode<UserPayload>(storedToken);
        // Pide el perfil completo y actualizado al backend
        await refreshUserProfile();
      } catch (e) {
        logout();
      }
    }
  }

  /**
   * Iniciar sesión
   */
async function login(email: string, password: string) {
    try {
      const response = await authService.login(email, password);
      const newToken = response.data.access_token;
      token.value = newToken;
      sessionStorage.setItem('token', newToken);
      user.value = jwtDecode<UserPayload>(newToken);
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


  /**
   * Iniciar impersonación (SuperAdmin actuando como clínica)
   */
  function startImpersonation(impersonationToken: string) {
    // Guardar el token del SuperAdmin
    sessionStorage.setItem('superAdminToken', token.value!);
    // Reemplazar token por el de la clínica
    token.value = impersonationToken;
    sessionStorage.setItem('token', impersonationToken);
    isImpersonating.value = true;
    // Recargar para aplicar cambios de entorno
    window.location.href = '/dashboard';
  }

  /**
   * Detener impersonación (volver al SuperAdmin)
   */
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

  /**
   * Cerrar sesión
   */
  function logout() {
    token.value = null;
    user.value = null;
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('superAdminToken');
    isImpersonating.value = false;
    router.push('/login');
    toast.info('Has cerrado la sesión.');
  }

  /**
   * Recuperar contraseña
   */
  async function handleForgotPassword(email: string) {
    try {
      const response = await authService.forgotPassword(email);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Ocurrió un error al enviar el correo.');
    }
  }

  /**
   * Restablecer contraseña
   */
  async function handleResetPassword(tokenParam: string, password: string) {
    try {
      const response = await authService.resetPassword(tokenParam, password);
      toast.success(response.data.message);
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'El token es inválido o ha expirado.');
    }
  }

  /**
   * Actualizar token manualmente (si se renueva)
   */
  function updateToken(newToken: string) {
    token.value = newToken;
    sessionStorage.setItem('token', newToken); // Usa sessionStorage
    user.value = jwtDecode<UserPayload>(newToken);
  }

  /**
   * Actualizar perfil del usuario actual (desde API)
   */
 async function refreshUserProfile() {
    try {
      const response = await authService.getProfile();
      const freshUser = response.data;

      // Actualiza la información del 'tenant' en el store con los datos frescos
      if (user.value) {
        user.value.tenant = freshUser.tenant;
      }
      toast.info('Estado de la conexión verificado.');
    } catch (error) {
      toast.error('No se pudo actualizar el perfil.');
    }
  }

  /**
   * Subir logo de la clínica
   */
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

  /**
   * Actualizar información del tenant (clínica)
   */
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
