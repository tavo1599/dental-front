<script setup lang="ts">
defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmButtonText: {
    type: String,
    default: 'Confirmar'
  }
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
  <Transition name="fade">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">

        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <slot name="icon"></slot>
        </div>

        <h3 class="text-lg leading-6 font-bold text-text-dark mt-4">{{ title }}</h3>
        <div class="mt-2">
          <p class="text-sm text-text-light">{{ message }}</p>
        </div>

        <div class="mt-6 flex justify-center space-x-4">
          <button @click="emit('cancel')" type="button" class="px-4 py-2 bg-gray-200 text-text-dark rounded-md hover:bg-gray-300 font-semibold">
            Cancelar
          </button>
          <button @click="emit('confirm')" type="button" class="px-4 py-2 bg-danger text-white rounded-md hover:bg-opacity-80 font-semibold">
            {{ confirmButtonText }}
          </button>
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