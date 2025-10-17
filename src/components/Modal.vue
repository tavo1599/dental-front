<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  size: {
    type: String,
    default: '2xl',
  },
});
const emit = defineEmits(['close']);

function closeModal() {
  emit('close');
}

const maxWidthClass = computed(() => {
  switch (props.size) {
    case 'md': return 'max-w-md';
    case 'lg': return 'max-w-lg';
    case 'xl': return 'max-w-xl';
    case '2xl': return 'max-w-2xl';
    case '5xl': return 'max-w-5xl';
    case 'screen-xl': return 'max-w-screen-xl';
    default: return 'max-w-2xl';
  }
});
</script>

<template>
  <Transition name="fade">
    <div 
      v-if="isOpen" 
      @click="closeModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <div 
        @click.stop 
        :class="['bg-white rounded-lg shadow-xl w-full flex flex-col', maxWidthClass]"
        style="max-height: 90vh;" >
        <div class="flex-shrink-0 p-6 border-b">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-text-dark">
              <slot name="header">Título del Modal</slot>
            </h2>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex-grow p-6 overflow-y-auto">
          <slot></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>