<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUsersStore } from '@/stores/users';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import Modal from '@/components/Modal.vue';
import UserForm from '@/components/UserForm.vue';
import type { User } from '@/types';

const usersStore = useUsersStore();
const { users, isLoading } = storeToRefs(usersStore);
const authStore = useAuthStore();

const isModalOpen = ref(false);
const formData = ref<Partial<User>>({});

onMounted(() => {
  usersStore.fetchUsers();
});

function openCreateModal() {
  formData.value = { role: 'dentist' };
  isModalOpen.value = true;
}

function openEditModal(user: User) {
  formData.value = { ...user };
  isModalOpen.value = true;
}

async function handleSave(data: any) {
  let success = false;
  if (data.id) {
    const { password, ...updateData } = data;
    success = await usersStore.updateUser(data.id, updateData);
  } else {
    success = await usersStore.createUser(data);
  }
  if (success) {
    isModalOpen.value = false;
  }
}
</script>
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-text-dark">Gestión de Usuarios</h2>
      <button v-if="authStore.user?.role === 'admin'" @click="openCreateModal" class="btn-primary">
        + Nuevo Usuario
      </button>
    </div>
    <div v-if="isLoading">Cargando...</div>
    <table v-else class="w-full text-left">
      <thead>
        <tr class="border-b-2 text-text-light">
          <th class="py-3 px-4">Nombre Completo</th>
          <th class="py-3 px-4">Email</th>
          <th class="py-3 px-4">Rol</th>
          <th v-if="authStore.user?.role === 'admin'" class="py-3 px-4">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id" class="border-b hover:bg-light-gray">
          <td class="py-3 px-4 font-medium text-text-dark">{{ user.fullName }}</td>
          <td class="py-3 px-4">{{ user.email }}</td>
          <td class="py-3 px-4 capitalize">{{ user.role }}</td>
          <td v-if="authStore.user?.role === 'admin'" class="py-3 px-4">
            <button @click="openEditModal(user)" class="text-primary hover:underline font-semibold">Editar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <Modal :isOpen="isModalOpen" @close="isModalOpen = false">
    <template #header>{{ formData.id ? 'Editar Usuario' : 'Nuevo Usuario' }}</template>
    <template #default>
      <UserForm 
        v-if="isModalOpen" 
        :initial-data="formData" 
        :loading="isLoading" 
        @submit="handleSave" 
        @cancel="isModalOpen = false" 
      />
    </template>
  </Modal>
</template>