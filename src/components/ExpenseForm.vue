<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Expense } from '@/types';
import { ExpenseCategory } from '@/types';

const props = defineProps<{
  initialData?: Partial<Expense> | null;
  loading: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);
const formData = ref<any>({});

watch(() => props.initialData, (newData) => {
  formData.value = { ...newData };
}, { immediate: true, deep: true });
</script>
<template>
  <form @submit.prevent="emit('submit', formData)" class="space-y-4">
    <div>
      <label for="date" class="block text-sm font-medium text-text-light">Fecha</label>
      <input v-model="formData.date" type="date" id="date" class="mt-1 block w-full input-style" required />
    </div>
    <div>
      <label for="description" class="block text-sm font-medium text-text-light">Descripción</label>
      <input v-model="formData.description" type="text" id="description" class="mt-1 block w-full input-style" required />
    </div>
    <div>
      <label for="amount" class="block text-sm font-medium text-text-light">Monto (S/.)</label>
      <input v-model.number="formData.amount" type="number" step="0.01" id="amount" class="mt-1 block w-full input-style" required />
    </div>
    <div>
      <label for="category" class="block text-sm font-medium text-text-light">Categoría</label>
      <select v-model="formData.category" id="category" class="mt-1 block w-full input-style" required>
        <option v-for="cat in ExpenseCategory" :key="cat" :value="cat" class="capitalize">{{ cat.replace('_', ' ') }}</option>
      </select>
    </div>
    <div class="flex justify-end space-x-4 pt-4">
      <button @click="emit('cancel')" type="button" class="btn-secondary">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Guardar Gasto' }}
      </button>
    </div>
  </form>
</template>