<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{ budgetId: string }>();
const emit = defineEmits(['close']);
const router = useRouter();

const printForPatient = ref(true);
const printForDoctor = ref(false);

function handlePrint() {
  const formats = [];
  if (printForPatient.value) formats.push('patient');
  if (printForDoctor.value) formats.push('doctor');

  if (formats.length === 0) {
    alert('Por favor, selecciona al menos un formato para imprimir.');
    return;
  }

  const routeData = router.resolve({
    name: 'print-budget',
    params: { id: props.budgetId },
    query: { formats: formats.join(',') },
  });
  window.open(routeData.href, '_blank');
  emit('close');
}
</script>
<template>
  <div class="space-y-4">
    <p class="text-text-light">Selecciona los formatos que deseas generar para la impresión.</p>
    <div class="space-y-2">
      <div class="flex items-center">
        <input v-model="printForPatient" id="formatPatient" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary">
        <label for="formatPatient" class="ml-2 block text-sm text-text-dark">Formato para Paciente (diseño formal)</label>
      </div>
      <div class="flex items-center">
        <input v-model="printForDoctor" id="formatDoctor" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary">
        <label for="formatDoctor" class="ml-2 block text-sm text-text-dark">Formato para Doctor (ficha interna)</label>
      </div>
    </div>
    <div class="flex justify-end space-x-4 pt-4">
      <button @click="emit('close')" type="button" class="btn-secondary">Cancelar</button>
      <button @click="handlePrint" type="button" class="btn-primary">Generar Impresión</button>
    </div>
  </div>
</template>
<style scoped>
  /* ... estilos de botones ... */
</style>