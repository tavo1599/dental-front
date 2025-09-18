import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { 
  getAllCie10, 
  createCie10 as createApi, 
  updateCie10 as updateApi, 
  deleteCie10 as deleteApi 
} from '@/services/cie10Service';
import type { Cie10Code } from '@/types';

export const useCie10Store = defineStore('cie10', () => {
  const toast = useToast();
  const codes = ref<Cie10Code[]>([]);
  const isLoading = ref(false);

  async function fetchAll() {
    isLoading.value = true;
    try {
      const response = await getAllCie10();
      codes.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar la lista de diagnósticos.');
    } finally {
      isLoading.value = false;
    }
  }

  async function create(data: Omit<Cie10Code, 'id'>) {
    isLoading.value = true;
    try {
      await createApi(data);
      toast.success('Código creado con éxito.');
      await fetchAll();
      return true;
    } catch (error) {
      toast.error('Error al crear el código.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: string, data: Omit<Cie10Code, 'id'>) {
    isLoading.value = true;
    try {
      await updateApi(id, data);
      toast.success('Código actualizado con éxito.');
      await fetchAll();
      return true;
    } catch (error) {
      toast.error('Error al actualizar el código.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function remove(id: string) {
    isLoading.value = true;
    try {
      await deleteApi(id);
      toast.success('Código eliminado con éxito.');
      await fetchAll();
    } catch (error) {
      toast.error('Error al eliminar el código.');
    } finally {
      isLoading.value = false;
    }
  }

  return { codes, isLoading, fetchAll, create, update, remove };
});