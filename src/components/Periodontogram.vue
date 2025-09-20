<script setup lang="ts">
import { usePeriodontogramStore } from '@/stores/periodontogram';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { SiteLocation, type PeriodontalMeasurement } from '@/types';

const store = usePeriodontogramStore();
const { measurements, isLoading } = storeToRefs(store);
const route = useRoute();

const teethLayout = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerRight: [41, 42, 43, 44, 45, 46, 47, 48],
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],
};

const sitesBuccal: SiteLocation[] = [SiteLocation.DISTOBUCCAL, SiteLocation.BUCCAL, SiteLocation.MESIOBUCCAL];
const sitesLingual: SiteLocation[] = [SiteLocation.DISTOLINGUAL, SiteLocation.LINGUAL, SiteLocation.MESIOLINGUAL];

const dataMatrix = ref<Record<number, Partial<Record<SiteLocation, Partial<PeriodontalMeasurement>>>>>({});
const hasChanges = ref(false);

watch(measurements, (newMeasurements) => {
  const matrix: any = {};
  if (newMeasurements) {
    for (const m of newMeasurements) {
      if (!matrix[m.toothNumber]) {
        matrix[m.toothNumber] = {};
      }
      matrix[m.toothNumber][m.site] = m;
    }
  }
  dataMatrix.value = matrix;
  hasChanges.value = false;
}, { immediate: true, deep: true });

function getMeasurement(tooth: number, site: SiteLocation) {
  return dataMatrix.value[tooth]?.[site] || {};
}

function updateValue(tooth: number, site: SiteLocation, field: keyof PeriodontalMeasurement, value: any) {
  if (!dataMatrix.value[tooth]) dataMatrix.value[tooth] = {};
  if (!dataMatrix.value[tooth][site]) dataMatrix.value[tooth][site] = {};
  
  const measurement = dataMatrix.value[tooth][site]!;
  
  if (field === 'bleedingOnProbing' || field === 'suppuration') {
    (measurement as any)[field] = !measurement[field];
  } else {
    const numValue = Number(value);
    (measurement as any)[field] = isNaN(numValue) ? null : numValue;
  }
  
  measurement.toothNumber = tooth;
  measurement.site = site;
  hasChanges.value = true;
}

function saveChanges() {
  const patientId = route.params.id as string;
  const updates: any[] = [];
  Object.values(dataMatrix.value).forEach(toothData => {
    Object.values(toothData).forEach(measurement => {
      if (Object.keys(measurement).length > 2) { // Solo guarda si tiene más que toothNumber y site
        updates.push(measurement);
      }
    });
  });
  store.updatePeriodontogram(patientId, updates);
  hasChanges.value = false;
}
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-text-dark">Periodontograma</h2>
      <button @click="saveChanges" :disabled="!hasChanges || isLoading" class="btn-primary">
        {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
      </button>
    </div>
    <div v-if="isLoading && !measurements.length" class="text-center py-8">Cargando datos...</div>
    <div v-else class="overflow-x-auto text-center text-sm">
      
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-1 w-24">Vestibular</th>
            <th v-for="tooth in teethLayout.upperRight" :key="tooth" class="border p-1 font-semibold" colspan="3">{{ tooth }}</th>
            <th v-for="tooth in teethLayout.upperLeft" :key="tooth" class="border p-1 font-semibold" colspan="3">{{ tooth }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border p-1 font-semibold">Margen Gingival</td>
            <template v-for="tooth in [...teethLayout.upperRight, ...teethLayout.upperLeft]" :key="tooth + '-mg'">
              <td v-for="site in sitesBuccal" :key="site" class="border p-0">
                <input type="number" class="perio-input" :value="getMeasurement(tooth, site).gingivalMargin" @input="updateValue(tooth, site, 'gingivalMargin', ($event.target as HTMLInputElement).value)">
              </td>
            </template>
          </tr>
          <tr>
            <td class="border p-1 font-semibold">Prof. Sondaje</td>
            <template v-for="tooth in [...teethLayout.upperRight, ...teethLayout.upperLeft]" :key="tooth + '-ps'">
              <td v-for="site in sitesBuccal" :key="site" class="border p-0">
                <input type="number" class="perio-input" :value="getMeasurement(tooth, site).probingDepth" @input="updateValue(tooth, site, 'probingDepth', ($event.target as HTMLInputElement).value)">
              </td>
            </template>
          </tr>
          <tr>
            <td class="border p-1 font-semibold">Sangrado/Sup.</td>
            <template v-for="tooth in [...teethLayout.upperRight, ...teethLayout.upperLeft]" :key="tooth + '-ss'">
              <td v-for="site in sitesBuccal" :key="site" class="border p-1">
                <input type="checkbox" class="perio-checkbox" :checked="getMeasurement(tooth, site).bleedingOnProbing" @change="updateValue(tooth, site, 'bleedingOnProbing', null)">
              </td>
            </template>
          </tr>
          <tr class="bg-gray-200 h-10">
            <td class="border p-1">Dientes</td>
            <td v-for="tooth in [...teethLayout.upperRight, ...teethLayout.upperLeft]" :key="tooth" class="border p-2 font-bold" colspan="3">🦷</td>
          </tr>
          <tr>
            <td class="border p-1 font-semibold">Sangrado/Sup.</td>
            <template v-for="tooth in [...teethLayout.upperRight, ...teethLayout.upperLeft]" :key="tooth + '-ss-lingual'">
              <td v-for="site in sitesLingual" :key="site" class="border p-1">
                <input type="checkbox" class="perio-checkbox" :checked="getMeasurement(tooth, site).bleedingOnProbing" @change="updateValue(tooth, site, 'bleedingOnProbing', null)">
              </td>
            </template>
          </tr>
          <tr>
            <td class="border p-1 font-semibold">Prof. Sondaje</td>
            <template v-for="tooth in [...teethLayout.upperRight, ...teethLayout.upperLeft]" :key="tooth + '-ps-lingual'">
              <td v-for="site in sitesLingual" :key="site" class="border p-0">
                <input type="number" class="perio-input" :value="getMeasurement(tooth, site).probingDepth" @input="updateValue(tooth, site, 'probingDepth', ($event.target as HTMLInputElement).value)">
              </td>
            </template>
          </tr>
          <tr>
            <td class="border p-1 font-semibold">Margen Gingival</td>
            <template v-for="tooth in [...teethLayout.upperRight, ...teethLayout.upperLeft]" :key="tooth + '-mg-lingual'">
              <td v-for="site in sitesLingual" :key="site" class="border p-0">
                <input type="number" class="perio-input" :value="getMeasurement(tooth, site).gingivalMargin" @input="updateValue(tooth, site, 'gingivalMargin', ($event.target as HTMLInputElement).value)">
              </td>
            </template>
          </tr>
        </tbody>
      </table>
      
      <hr class="my-4 border-2 border-gray-300">

      <table class="min-w-full border-collapse">
        <tbody>
          <tr>
            <td class="border p-1 font-semibold w-24">Margen Gingival</td>
            <template v-for="tooth in [...teethLayout.lowerRight.slice().reverse(), ...teethLayout.lowerLeft]" :key="tooth + '-mg-lingual-inf'">
              <td v-for="site in sitesLingual" :key="site" class="border p-0">
                <input type="number" class="perio-input" :value="getMeasurement(tooth, site).gingivalMargin" @input="updateValue(tooth, site, 'gingivalMargin', ($event.target as HTMLInputElement).value)">
              </td>
            </template>
          </tr>
          <tr>
            <td class="border p-1 font-semibold">Prof. Sondaje</td>
            <template v-for="tooth in [...teethLayout.lowerRight.slice().reverse(), ...teethLayout.lowerLeft]" :key="tooth + '-ps-lingual-inf'">
              <td v-for="site in sitesLingual" :key="site" class="border p-0">
                <input type="number" class="perio-input" :value="getMeasurement(tooth, site).probingDepth" @input="updateValue(tooth, site, 'probingDepth', ($event.target as HTMLInputElement).value)">
              </td>
            </template>
          </tr>
          <tr>
            <td class="border p-1 font-semibold">Sangrado/Sup.</td>
            <template v-for="tooth in [...teethLayout.lowerRight.slice().reverse(), ...teethLayout.lowerLeft]" :key="tooth + '-ss-lingual-inf'">
              <td v-for="site in sitesLingual" :key="site" class="border p-1">
                <input type="checkbox" class="perio-checkbox" :checked="getMeasurement(tooth, site).bleedingOnProbing" @change="updateValue(tooth, site, 'bleedingOnProbing', null)">
              </td>
            </template>
          </tr>
          <tr class="bg-gray-200 h-10">
            <td class="border p-1">Dientes</td>
            <td v-for="tooth in [...teethLayout.lowerRight.slice().reverse(), ...teethLayout.lowerLeft]" :key="tooth" class="border p-2 font-bold" colspan="3">🦷</td>
          </tr>
          <tr>
            <td class="border p-1 font-semibold">Sangrado/Sup.</td>
            <template v-for="tooth in [...teethLayout.lowerRight.slice().reverse(), ...teethLayout.lowerLeft]" :key="tooth + '-ss-inf'">
              <td v-for="site in sitesBuccal" :key="site" class="border p-1">
                <input type="checkbox" class="perio-checkbox" :checked="getMeasurement(tooth, site).bleedingOnProbing" @change="updateValue(tooth, site, 'bleedingOnProbing', null)">
              </td>
            </template>
          </tr>
          <tr>
            <td class="border p-1 font-semibold">Prof. Sondaje</td>
            <template v-for="tooth in [...teethLayout.lowerRight.slice().reverse(), ...teethLayout.lowerLeft]" :key="tooth + '-ps-inf'">
              <td v-for="site in sitesBuccal" :key="site" class="border p-0">
                <input type="number" class="perio-input" :value="getMeasurement(tooth, site).probingDepth" @input="updateValue(tooth, site, 'probingDepth', ($event.target as HTMLInputElement).value)">
              </td>
            </template>
          </tr>
          <tr>
            <td class="border p-1 font-semibold">Margen Gingival</td>
            <template v-for="tooth in [...teethLayout.lowerRight.slice().reverse(), ...teethLayout.lowerLeft]" :key="tooth + '-mg-inf'">
              <td v-for="site in sitesBuccal" :key="site" class="border p-0">
                <input type="number" class="perio-input" :value="getMeasurement(tooth, site).gingivalMargin" @input="updateValue(tooth, site, 'gingivalMargin', ($event.target as HTMLInputElement).value)">
              </td>
            </template>
          </tr>
        </tbody>
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-1">Lingual</th>
            <th v-for="tooth in teethLayout.lowerRight.slice().reverse()" :key="tooth" class="border p-1 font-semibold" colspan="3">{{ tooth }}</th>
            <th v-for="tooth in teethLayout.lowerLeft" :key="tooth" class="border p-1 font-semibold" colspan="3">{{ tooth }}</th>
          </tr>
        </thead>
      </table>
    </div>
  </div>
</template>

<style scoped>
.perio-input {
  @apply w-full h-full p-1 text-center border-none bg-transparent focus:outline-none focus:bg-blue-100;
}
.perio-checkbox {
  @apply w-4 h-4 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500;
}
</style>