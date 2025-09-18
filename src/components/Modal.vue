<script setup lang="ts">
// Define las propiedades (props) que el componente recibe desde fuera (si está abierto o no)
// y los eventos (emits) que envía hacia fuera (cuando se cierra)
defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits(['close']);

function closeModal() {
  emit('close');
}
</script>

<template>
  <Transition name="fade">
    <div 
      v-if="isOpen" 
      @click="closeModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div 
        @click.stop class="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-text-dark">
            <slot name="header">Título del Modal</slot>
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
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