<script setup lang="ts">
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

defineProps<{
  chartData: {
    labels: string[];
    datasets: {
      backgroundColor: string[];
      data: number[];
    }[];
  };
}>();

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>
<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>