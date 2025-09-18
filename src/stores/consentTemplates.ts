import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { 
  getConsentTemplates, 
  createConsentTemplate,
  updateConsentTemplate as updateApi, // <-- Importa la función de actualizar
  deleteConsentTemplate as deleteApi  // <-- Importa la función de eliminar
} from '@/services/consentTemplateService';
import type { ConsentTemplate } from '@/types';

export const useConsentTemplatesStore = defineStore('consentTemplates', () => {
  const toast = useToast();
  const templates = ref<ConsentTemplate[]>([]);
  const isLoading = ref(false);

  async function fetchAll() {
    isLoading.value = true;
    try {
      const response = await getConsentTemplates();
      templates.value = response.data;
    } catch (error) {
      toast.error('No se pudieron cargar las plantillas.');
    } finally {
      isLoading.value = false;
    }
  }

  async function create(data: Omit<ConsentTemplate, 'id'>) {
    isLoading.value = true;
    try {
      await createConsentTemplate(data);
      toast.success('Plantilla creada con éxito.');
      await fetchAll();
      return true;
    } catch(error) {
      toast.error('Error al crear la plantilla.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  // --- FUNCIÓN 'update' AÑADIDA ---
  async function update(id: string, data: Omit<ConsentTemplate, 'id'>) {
    isLoading.value = true;
    try {
      await updateApi(id, data);
      toast.success('Plantilla actualizada con éxito.');
      await fetchAll();
      return true;
    } catch (error) {
      toast.error('Error al actualizar la plantilla.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // --- FUNCIÓN 'remove' AÑADIDA ---
  async function remove(id: string) {
    isLoading.value = true;
    try {
      await deleteApi(id);
      toast.success('Plantilla eliminada con éxito.');
      await fetchAll();
    } catch (error) {
      toast.error('Error al eliminar la plantilla.');
    } finally {
      isLoading.value = false;
    }
  }
  
  return { templates, isLoading, fetchAll, create, update, remove };
});