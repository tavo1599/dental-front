<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  templateContent: string;
  templateTitle: string;
}>();

const mockData = {
  patientName: 'Juan Pérez García',
  patientDni: '12345678',
  doctorName: 'Dr. Carlos Mendoza',
  clinicName: 'Clínica SonriAndes',
  currentDate: new Date().toLocaleDateString('es-PE', { dateStyle: 'long' }),
};

const renderedContent = computed(() => {
  if (!props.templateContent) return '<p class="text-gray-400">Comienza a escribir para ver la vista previa.</p>';

  let content = props.templateContent;
  content = content.replace(/{{patientName}}/g, `<strong>${mockData.patientName}</strong>`);
  content = content.replace(/{{patientDni}}/g, `<strong>${mockData.patientDni}</strong>`);
  content = content.replace(/{{doctorName}}/g, `<strong>${mockData.doctorName}</strong>`);
  content = content.replace(/{{clinicName}}/g, `<strong>${mockData.clinicName}</strong>`);
  content = content.replace(/{{currentDate}}/g, `<strong>${mockData.currentDate}</strong>`);
  
  return content;
});

const renderHeader = computed(() => {
    const clinicName = mockData.clinicName;
    const clinicContactInfo = `
        <p style="font-size: 0.75rem; color: #666; margin: 0;">Av. Siempreviva 742, Lima</p>
        <p style="font-size: 0.75rem; color: #666; margin: 0;">(01) 234-5678 | info@sonriandes.com</p>
    `;
    const logoPlaceholder = `
        <div style="width: 80px; height: 80px; background-color: #eee; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #999;">
            Logo
        </div>
    `;
    
    return `
        <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem;">
            <div>
                <h1 style="font-size: 1.3rem; font-weight: bold; margin: 0; color: #333;">${clinicName}</h1>
                ${clinicContactInfo}
            </div>
            ${logoPlaceholder}
        </header>
    `;
});
</script>

<template>
  <div class="sticky top-4">
    <h3 class="text-lg font-semibold text-text-dark mb-2">Vista Previa del Documento</h3>
    
    <div class="document-preview bg-white shadow-lg border border-gray-200 rounded-lg p-8 max-h-[70vh] overflow-y-auto">
      <div v-html="renderHeader"></div>
      <h2 class="text-xl font-bold text-center mb-6">{{ templateTitle }}</h2>
      <div class="content" v-html="renderedContent"></div>
      <div class="mt-16 text-sm text-gray-600">
          <p>Firma del Paciente: _________________________</p>
          <p class="mt-2">Firma del Doctor: _________________________</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.document-preview {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}
.content {
  white-space: pre-wrap;
}
</style>