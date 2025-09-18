<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  searchFunction: (term: string) => Promise<any[]>;
}>();
const emit = defineEmits(['select']);

const searchTerm = ref('');
const results = ref<any[]>([]);
const isLoading = ref(false);

let debounceTimer: number;

const onInput = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (searchTerm.value.length < 3) {
      results.value = [];
      return;
    }
    isLoading.value = true;
    results.value = await props.searchFunction(searchTerm.value);
    isLoading.value = false;
  }, 500); // Espera 500ms después de que el usuario deja de escribir
};

const onSelect = (item: any) => {
  searchTerm.value = `${item.code} - ${item.description}`;
  results.value = [];
  emit('select', searchTerm.value);
};
</script>
<template>
  <div class="relative">
    <input 
      type="text" 
      v-model="searchTerm" 
      @input="onInput" 
      class="w-full input-style"
      placeholder="Escribe 3+ letras para buscar..."
    />
    <ul v-if="results.length > 0" class="absolute z-10 w-full bg-white border mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
      <li v-for="item in results" :key="item.code" @click="onSelect(item)" class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
        <span class="font-bold">{{ item.code }}</span> - <span>{{ item.description }}</span>
      </li>
    </ul>
    <div v-if="isLoading" class="absolute right-2 top-2">...</div>
  </div>
</template>