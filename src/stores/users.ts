import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { getUsers as getApi, createUser as createApi, updateUser as updateApi } from '@/services/userService';
import { changePassword as changePasswordApi } from '@/services/userService';
import type { User } from '@/types';

export const useUsersStore = defineStore('users', () => {
  const toast = useToast();
  const users = ref<User[]>([]);
  const isLoading = ref(false);

  async function fetchUsers() {
    isLoading.value = true;
    try {
      const response = await getApi();
      users.value = response.data;
    } catch (error) {
      toast.error('No se pudo cargar la lista de usuarios.');
    } finally {
      isLoading.value = false;
    }
  }

  async function createUser(data: any) {
    isLoading.value = true;
    try {
      await createApi(data);
      toast.success('Usuario creado con éxito.');
      await fetchUsers();
      return true;
    } catch (error: any) {
      // 1. Leemos el mensaje específico del backend.
      const errorMessage = error.response?.data?.message || 'Error al crear el usuario.';
      // 2. Mostramos ese mensaje en la notificación.
      toast.error(errorMessage);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUser(id: string, data: any) {
  isLoading.value = true;
  try {
    const response = await updateApi(id, data);
    const updatedUser = response.data;

    // Buscamos el usuario en nuestra lista local
    const index = users.value.findIndex(u => u.id === id);
    if (index !== -1) {
      // Lo reemplazamos con los datos actualizados del servidor
      users.value[index] = updatedUser;
    }

    toast.success('Usuario actualizado con éxito.');
    return true;
  } catch (error) {
    toast.error('Error al actualizar el usuario.');
    return false;
  } finally {
    isLoading.value = false;
  }
}

  async function changePassword(data: any) {
    isLoading.value = true;
    try {
      const response = await changePasswordApi(data);
      toast.success(response.data.message || 'Contraseña actualizada con éxito.');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'No se pudo cambiar la contraseña.');
      return false;
    } finally {
      isLoading.value = false;
    }
  }


  return { users, isLoading, fetchUsers, createUser, updateUser, changePassword };
});