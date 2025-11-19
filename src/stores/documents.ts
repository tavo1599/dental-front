import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { 
  getDocuments, 
  uploadDocument as uploadApi, 
  deleteDocument as deleteApi 
} from '@/services/documentService';
import type { PatientDocument } from '@/types';

export const useDocumentsStore = defineStore('documents', () => {
  const toast = useToast();
  const documents = ref<PatientDocument[]>([]);
  const isLoading = ref(false);

  async function fetchDocuments(patientId: string) {
    isLoading.value = true;
    try {
      const response = await getDocuments(patientId);
      documents.value = response.data;
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar documentos.');
    } finally {
      isLoading.value = false;
    }
  }

  async function uploadDocument(patientId: string, file: File) {
    isLoading.value = true;
    try {
      await uploadApi(patientId, file);
      toast.success('Documento subido con éxito.');
      await fetchDocuments(patientId); // Recargar la lista
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Error al subir el documento.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteDocument(patientId: string, documentId: string) {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;
    
    isLoading.value = true;
    try {
      await deleteApi(documentId);
      toast.success('Documento eliminado.');
      await fetchDocuments(patientId); // Recargar la lista
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar el documento.');
    } finally {
      isLoading.value = false;
    }
  }

  // Ya no necesitamos la acción 'downloadDocumentFile' aquí.

  return {
    documents,
    isLoading,
    fetchDocuments,
    uploadDocument,
    deleteDocument
  };
});