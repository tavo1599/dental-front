import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { 
  getTenants, 
  createTenant as createTenantApi, 
  updateTenantStatus as updateStatusApi,
  getTenantGrowth,
  postAnnouncement as postAnnouncementApi,
  clearAnnouncement as clearAnnouncementApi,
  getSystemKpis,
  getActiveAnnouncement,
} from '@/services/superAdminService';  
import type { Tenant, TenantStatus, Announcement } from '@/types';

export const useSuperAdminStore = defineStore('superAdmin', () => {
  const toast = useToast();
  const tenants = ref<Tenant[]>([]);
  const isLoading = ref(false);
  const tenantGrowthData = ref<{ labels: string[], data: number[] }>({ labels: [], data: [] });
  const kpis = ref<any>({}); // Estado para los KPIs globales
  const activeAnnouncement = ref<Announcement | null>(null); // Estado para el anuncio activo

  async function fetchAllSuperAdminData() {
    isLoading.value = true;
    try {
      // Hacemos todas las llamadas a la API en paralelo
      const [tenantsRes, growthRes, kpisRes, announcementRes] = await Promise.all([
        getTenants(),
        getTenantGrowth(),
        getSystemKpis(),
        getActiveAnnouncement()
      ]);
      
      tenants.value = tenantsRes.data;
      tenantGrowthData.value = growthRes.data;
      kpis.value = kpisRes.data;
      activeAnnouncement.value = announcementRes.data;

    } catch (error) {
      toast.error('No se pudo cargar los datos del panel.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createTenant(data: any) {
    isLoading.value = true;
    try {
      await createTenantApi(data);
      toast.success('Clínica creada con éxito.');
      await fetchAllSuperAdminData(); // Llama a la función que recarga todo
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear la clínica.';
      toast.error(errorMessage);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function updateTenantStatus(tenantId: string, status: TenantStatus) {
    try {
      await updateStatusApi(tenantId, status);
      const index = tenants.value.findIndex(t => t.id === tenantId);
      if (index !== -1) {
        tenants.value[index].status = status;
      }
      toast.success('Estado de la clínica actualizado.');
    } catch (error) {
      toast.error('No se pudo actualizar el estado.');
    }
  }

  async function postAnnouncement(message: string) {
    try {
      await postAnnouncementApi(message);
      toast.success('Anuncio publicado con éxito.');
      await fetchAllSuperAdminData();
    } catch (error) {
      toast.error('No se pudo publicar el anuncio.');
    }
  }

  async function clearAnnouncement() {
    try {
      await clearAnnouncementApi();
      toast.info('El anuncio activo ha sido eliminado.');
      await fetchAllSuperAdminData();
    } catch (error) {
      toast.error('No se pudo eliminar el anuncio.');
    }
  }

  return { 
    tenants, 
    isLoading, 
    fetchAllSuperAdminData, 
    createTenant, 
    updateTenantStatus, 
    tenantGrowthData, 
    postAnnouncement, 
    clearAnnouncement,
    kpis,
    activeAnnouncement 
  };
});