import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';
import * as service from '@/services/consentTemplateService';
import type { ConsentTemplate } from '@/types';

export const useConsentTemplatesStore = defineStore('consentTemplates', () => {
  const toast = useToast();
  const templates = ref<ConsentTemplate[]>([]);
  const isLoading = ref(false);

  const systemTemplates = computed(() => templates.value.filter(t => !t.tenant));
  const clinicTemplates = computed(() => templates.value.filter(t => !!t.tenant));

  async function fetchAllTemplates() {
    isLoading.value = true;
    try {
      const response = await service.getConsentTemplates();
      templates.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar las plantillas.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createTemplate(data: Partial<ConsentTemplate>) {
    isLoading.value = true;
    try {
      // Aseguramos que todos los campos requeridos se envíen
      const payload = {
        title: data.title,
        content: data.content,
        category: data.category,
        forMinor: data.forMinor || false,
      };

      console.log('Enviando payload para crear plantilla:', payload); // Para depuración
      
      await service.createConsentTemplate(payload);
      toast.success('Plantilla creada con éxito.');
      await fetchAllTemplates();
      return true;
    } catch (error) {
      toast.error('Error al crear la plantilla.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateTemplate(id: string, data: Partial<ConsentTemplate>) {
    isLoading.value = true;
    try {
      await service.updateConsentTemplate(id, data);
      toast.success('Plantilla actualizada con éxito.');
      await fetchAllTemplates();
      return true;
    } catch (error) {
      toast.error('Error al actualizar la plantilla.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta plantilla?')) return;
    try {
      await service.deleteConsentTemplate(id);
      toast.success('Plantilla eliminada.');
      await fetchAllTemplates();
    } catch (error) {
      toast.error('Error al eliminar la plantilla.');
    }
  }

  return {
    templates,
    systemTemplates,
    clinicTemplates,
    isLoading,
    fetchAllTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
});