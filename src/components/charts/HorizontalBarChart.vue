<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import { computed } from 'vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type ChartOptions,
  type ChartData,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps<{
  chartData: ChartData<'bar'>;
  chartOptions?: ChartOptions<'bar'>;
}>();

function truncateLabel(label: string | number | undefined, max = 18) {
  if (label === undefined || label === null) return '';
  const s = String(label);
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}

const defaultOptions: ChartOptions<'bar'> = {
  // Vertical bars (bottom -> up)
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {},
  },
  scales: {
    x: {
      ticks: {
        autoSkip: true,
        maxRotation: 45,
        callback: function (value: any) {
          return truncateLabel(value, 18);
        },
      },
    },
    y: {
      beginAtZero: true,
    },
  },
};

const chartOptions = computed(() => Object.assign({}, defaultOptions, props.chartOptions || {}));
</script>
<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>