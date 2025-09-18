import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import * as service from '@/services/documentService';
import type { PatientDocument } from '@/types';

export const useDocumentsStore = defineStore('documents', () => {
  const toast = useToast();
  const documents = ref<PatientDocument[]>([]);
  const isLoading = ref(false);

  async function fetchDocuments(patientId: string) {
    isLoading.value = true;
    try {
      const response = await service.getDocuments(patientId);
      documents.value = response.data;
    } catch (error) {
      toast.error('No se pudieron cargar los documentos del paciente.');
    } finally {
      isLoading.value = false;
    }
  }

  async function uploadDocument(patientId: string, file: File) {
    isLoading.value = true;
    try {
      await service.uploadDocument(patientId, file);
      toast.success('Documento subido con éxito.');
      // Recarga la lista para mostrar el nuevo documento
      await fetchDocuments(patientId);
    } catch (error) {
      toast.error('Error al subir el documento.');
    } finally {
      isLoading.value = false;
    }
  }

  return { documents, isLoading, fetchDocuments, uploadDocument };
});