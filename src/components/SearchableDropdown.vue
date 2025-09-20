<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

const props = defineProps<{
  items: any[];
  modelValue: string | null;
  placeholder?: string;
  displayKey?: string; // <-- 1. Nueva propiedad para decirle qué campo mostrar/buscar
}>();

const emit = defineEmits(['update:modelValue']);
const displayField = props.displayKey || 'fullName'; // Usa 'fullName' por defecto

const query = ref('');

const filteredItems = computed(() => {
  if (!props.items) return [];
  if (query.value === '') return props.items;

  return props.items.filter((item) =>
    item && item[displayField] && typeof item[displayField] === 'string' &&
    item[displayField].toLowerCase().includes(query.value.toLowerCase())
  );
});

const selectedItem = computed({
  get: () => props.items.find(item => item.id === props.modelValue),
  set: (value) => {
    emit('update:modelValue', value ? value.id : null);
  }
});
</script>
<template>
  <Combobox v-model="selectedItem">
    <div class="relative mt-1">
      <div class="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md">
        <ComboboxInput
          class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 input-style"
          :displayValue="(item: any) => item?.[displayField]"
          @change="query = $event.target.value"
          :placeholder="placeholder"
          autocomplete="off" />
        <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </ComboboxButton>
      </div>
      <TransitionRoot
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        @after-leave="query = ''"
      >
        <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
          <div v-if="filteredItems.length === 0 && query !== ''" class="relative cursor-default select-none px-4 py-2 text-gray-700">
            No se encontró nada.
          </div>
          <ComboboxOption
            v-for="item in filteredItems"
            as="template"
            :key="item.id"
            :value="item"
            v-slot="{ selected, active }"
          >
            <li class="relative cursor-default select-none py-2 pl-10 pr-4" :class="{ 'bg-primary text-white': active, 'text-gray-900': !active }">
              <span class="block truncate" :class="{ 'font-medium': selected, 'font-normal': !selected }">
                {{ item[displayField] }}
              </span>
              <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3" :class="{ 'text-white': active, 'text-primary': !active }">
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ComboboxOption>
        </ComboboxOptions>
      </TransitionRoot>
    </div>
  </Combobox>
</template>