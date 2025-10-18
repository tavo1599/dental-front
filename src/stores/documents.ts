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

  async function deleteDocument(patientId: string, documentId: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await service.deleteDocument(documentId);
      toast.success('Documento eliminado con éxito.');
      // Actualiza la lista sin volver a llamar a la API
      documents.value = documents.value.filter(doc => doc.id !== documentId);
    } catch (error) {
      toast.error('Error al eliminar el documento.');
    }
  }

  return { documents, isLoading, fetchDocuments, uploadDocument, deleteDocument, };
});