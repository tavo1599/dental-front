<script setup lang="ts">
const emit = defineEmits(['insert-placeholder']);

const placeholders = [
  { label: 'Nombre del Paciente', tag: '{{patientName}}' },
  { label: 'DNI del Paciente', tag: '{{patientDni}}' },
  { label: 'Nombre del Doctor', tag: '{{doctorName}}' },
  { label: 'Nombre de la Clínica', tag: '{{clinicName}}' },
  { label: 'Fecha Actual', tag: '{{currentDate}}' },
];
</script>

<template>
  <div class="mb-2">
    <p class="text-sm font-medium text-gray-600 mb-1">Insertar Campo:</p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="p in placeholders"
        :key="p.tag"
        @click="emit('insert-placeholder', p.tag)"
        type="button"
        class="btn-secondary text-xs"
      >
        {{ p.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.btn-secondary { @apply px-2 py-1 bg-gray-200 text-text-dark rounded-md hover:bg-gray-300 font-semibold; }
</style>