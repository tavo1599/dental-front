<script setup lang="ts">
import type { Appointment } from '@/types';
import { AppointmentStatus } from '@/types';

defineProps<{
  appointments: Appointment[];
}>();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-PE', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
};

const getStatusClass = (status: AppointmentStatus) => {
  const classes: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-orange-100 text-orange-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};
</script>
<template>
  <div class="space-y-4">
    <div v-if="appointments.length === 0" class="text-center py-8 text-text-light">
      No hay citas registradas para este paciente.
    </div>
    <div v-for="appt in appointments" :key="appt.id" class="p-4 border rounded-lg bg-gray-50">
      <div class="flex justify-between items-start">
        <div>
          <p class="font-bold text-primary">{{ formatDate(appt.startTime) }}</p>
          <p class="text-sm text-text-light">Con: Dr(a). {{ appt.doctor.fullName }}</p>
        </div>
        <span :class="getStatusClass(appt.status)" class="px-2 py-1 text-xs font-semibold rounded-full capitalize">
          {{ appt.status.replace('_', ' ') }}
        </span>
      </div>
      <p v-if="appt.notes" class="text-sm text-text-light mt-2 border-t pt-2">
        <strong>Notas:</strong> {{ appt.notes }}
      </p>
    </div>
  </div>
</template>