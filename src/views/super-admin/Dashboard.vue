<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useSuperAdminStore } from '@/stores/superAdmin';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import Modal from '@/components/Modal.vue';
import ClinicCreateForm from '@/components/ClinicCreateForm.vue';
import BarChart from '@/components/charts/BarChart.vue';
import { type Tenant, type User, TenantStatus } from '@/types';
import { impersonateUser } from '@/services/superAdminService';
import PlanManagementForm from '@/components/PlanManagementForm.vue';

const superAdminStore = useSuperAdminStore();
const { tenants, isLoading, tenantGrowthData, kpis, activeAnnouncement } = storeToRefs(superAdminStore);
const authStore = useAuthStore();

const isPlanModalOpen = ref(false); // <-- Nuevo estado para el modal de planes
const selectedTenant = ref<Tenant | null>(null);

const isModalOpen = ref(false);
const searchQuery = ref('');
const announcementMessage = ref('');

onMounted(() => {
  superAdminStore.fetchAllSuperAdminData();
});

const growthChartData = computed(() => ({
  labels: tenantGrowthData.value.labels,
  datasets: [{
    label: 'Nuevas Clínicas por Mes',
    backgroundColor: '#10B981',
    data: tenantGrowthData.value.data,
  }],
}));

const filteredTenants = computed(() => {
  if (!searchQuery.value) {
    return tenants.value;
  }
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  return tenants.value.filter(tenant =>
    tenant.name.toLowerCase().includes(lowerCaseQuery) ||
    (getAdminUser(tenant.users)?.fullName || '').toLowerCase().includes(lowerCaseQuery) ||
    (getAdminUser(tenant.users)?.email || '').toLowerCase().includes(lowerCaseQuery)
  );
});

async function handleSaveClinic(data: any) {
  const success = await superAdminStore.createTenant(data);
  if (success) {
    isModalOpen.value = false;
  }
}


async function impersonate(userId: string) {
  if (!userId) return;
  if (confirm('¿Estás seguro de que quieres iniciar sesión como este usuario? Serás redirigido.')) {
    try {
      const response = await impersonateUser(userId);
      const impersonationToken = response.data.access_token;
      authStore.startImpersonation(impersonationToken);
    } catch (error) {
      alert('No se pudo personificar al usuario.');
      console.error(error);
    }
  }
}

const getAdminUser = (users: User[]): User | undefined => {
  if (!users) return undefined;
  return users.find(u => u.role === 'admin');
};

const activeTenantsCount = computed(() => {
  return tenants.value.filter(t => t.status === 'active').length;
});

function handleStatusChange(tenantId: string, event: Event) {
  const newStatus = (event.target as HTMLSelectElement).value as TenantStatus;
  superAdminStore.updateTenantStatus(tenantId, newStatus);
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
};

function handlePostAnnouncement() {
  if (announcementMessage.value) {
    superAdminStore.postAnnouncement(announcementMessage.value);
    announcementMessage.value = '';
  }
}
function handleClearAnnouncement() {
  superAdminStore.clearAnnouncement();
}

function openPlanModal(tenant: Tenant) {
  selectedTenant.value = tenant;
  isPlanModalOpen.value = true;
}

async function handleSavePlan(data: any) {
  if (selectedTenant.value) {
    const success = await superAdminStore.updateTenantPlan(selectedTenant.value.id, data);
    if (success) {
      isPlanModalOpen.value = false;
    }
  }
}

const getPaymentStatusClass = (dateString: string | null): string => {
  if (!dateString) return 'text-gray-400';

  const paymentDate = new Date(dateString);
  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);

  // Ponemos la hora a cero para comparar solo las fechas
  paymentDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (paymentDate <= today) {
    return 'text-red-400 font-bold animate-pulse'; // Vencido o vence hoy
  }
  if (paymentDate <= sevenDaysFromNow) {
    return 'text-yellow-400 font-semibold'; // Vence pronto
  }
  return 'text-gray-300'; // Normal
};

function handleRenew(tenantId: string) {
  superAdminStore.renewSubscription(tenantId);
}
</script>

<template>
  <div class="space-y-6">
    <!-- Fila 1: KPIs Globales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 class="text-gray-400">Total de Clínicas</h3>
        <p class="text-3xl font-bold text-white mt-2">{{ tenants.length }}</p>
      </div>
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 class="text-gray-400">Clínicas Activas</h3>
        <p class="text-3xl font-bold text-green-400 mt-2">{{ activeTenantsCount }}</p>
      </div>
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 class="text-gray-400">Pacientes en el Sistema</h3>
        <p class="text-3xl font-bold text-sky-400 mt-2">{{ kpis.totalPatientCount || 0 }}</p>
      </div>
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 class="text-gray-400">Ingresos Totales (Mes)</h3>
        <p class="text-3xl font-bold text-amber-400 mt-2">S/. {{ Number(kpis.totalMonthlyRevenue || 0).toFixed(2) }}</p>
      </div>
    </div>

    <!-- Fila 2: Gráfico de Crecimiento y Anuncios -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Crecimiento de Clínicas</h2>
        <div class="h-80">
          <BarChart :chart-data="growthChartData" />
        </div>
      </div>
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col">
        <h2 class="text-2xl font-bold mb-4">Enviar Anuncio Global</h2>
        <div v-if="activeAnnouncement" class="mb-4 p-3 bg-blue-900/50 border border-blue-700 rounded-lg">
          <p class="text-sm text-blue-300 font-semibold">Anuncio Activo:</p>
          <p class="text-white">{{ activeAnnouncement.message }}</p>
        </div>
        <div v-else class="mb-4 p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-center">
          <p class="text-gray-400">No hay ningún anuncio activo.</p>
        </div>
        <div class="mt-auto space-y-4">
          <textarea v-model="announcementMessage" rows="3" class="input-style-dark w-full" placeholder="Escribe tu nuevo anuncio aquí..."></textarea>
          <div class="flex justify-end gap-4">
            <button @click="handleClearAnnouncement" class="btn-secondary">Quitar Anuncio</button>
            <button @click="handlePostAnnouncement" class="btn-primary">Publicar</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Fila 3: Tabla de Clínicas -->
    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h2 class="text-2xl font-bold">Clínicas Registradas</h2>
        <input v-model="searchQuery" type="text" placeholder="Buscar clínica o admin..." class="bg-gray-700 border-gray-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary w-full md:w-1/3" />
        <button @click="isModalOpen = true" class="btn-primary w-full md:w-auto flex-shrink-0">+ Nueva Clínica</button>
      </div>
      <div v-if="isLoading && tenants.length === 0" class="text-center py-8 text-gray-400">Cargando...</div>
      <div class="overflow-x-auto">
        <table v-if="filteredTenants.length > 0" class="w-full text-left text-gray-300 min-w-[1024px]">
          <thead>
            <tr class="border-b border-gray-600 text-sm">
              <th class="p-3">Clínica / Admin</th>
              <th class="p-3">Contacto Admin</th>
              <th class="p-3 text-center">Usuarios</th>
              <th class="p-3 text-center">Pacientes</th>
              <th class="p-3">Fecha Registro</th>
              <th class="p-3">Próximo Pago</th>
              <th class="p-3 text-center">Estado</th>
              <th class="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tenant in filteredTenants" :key="tenant.id" class="border-b border-gray-700 hover:bg-gray-700">
              <td class="p-3">
                <p class="font-medium text-white">{{ tenant.name }}</p>
                <p class="text-sm text-gray-400">{{ getAdminUser(tenant.users)?.fullName || 'N/A' }}</p>
              </td>
              <td class="p-3 text-sm">
                <p>{{ getAdminUser(tenant.users)?.email }}</p>
                <p class="text-gray-400">{{ getAdminUser(tenant.users)?.phone || 'N/A' }}</p>
              </td>
              <td class="p-3 text-center font-medium">{{ tenant.users?.length || 0 }}</td>
              <td class="p-3 text-center font-medium">{{ tenant.patientCount || 0 }}</td>
              <td class="p-3">{{ formatDate(tenant.createdAt) }}</td>
              <td class="p-3" :class="getPaymentStatusClass(tenant.nextPaymentDate)">
                {{ formatDate(tenant.nextPaymentDate) }}
              </td>
              <td class="p-3">
                <select :value="tenant.status" @change="handleStatusChange(tenant.id, $event)" class="bg-gray-700 border-gray-600 text-white rounded-md p-1.5 text-sm focus:outline-none focus:ring-primary focus:border-primary w-full">
                  <option v-for="s in TenantStatus" :key="s" :value="s" class="capitalize">{{ s }}</option>
                </select>
              </td>
              <td class="p-3 text-center space-x-2">
                <button @click="openPlanModal(tenant)" class="text-sky-400 hover:underline text-xs">
                  Gestionar Plan
                </button>
                <button @click="handleRenew(tenant.id)" class="text-green-400 hover:underline text-xs font-semibold">Renovar</button>
                <button v-if="getAdminUser(tenant.users)" @click="impersonate(getAdminUser(tenant.users)!.id)" class="bg-yellow-500 text-yellow-900 px-2 py-1 text-xs font-bold rounded hover:bg-yellow-400" title="Iniciar sesión como este usuario">
                  Personificar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!isLoading && filteredTenants.length === 0" class="text-center py-8 text-gray-400">
        {{ searchQuery ? 'No se encontraron clínicas que coincidan.' : 'No hay clínicas registradas.' }}
      </div>
    </div>
    
    <!-- Modal para Crear Clínica -->
    <Modal :isOpen="isModalOpen" @close="isModalOpen = false">
      <template #header>Registrar Nueva Clínica</template>
      <template #default>
        <ClinicCreateForm v-if="isModalOpen" :loading="isLoading" @submit="handleSaveClinic" @cancel="isModalOpen = false" />
      </template>
    </Modal>

    <Modal :isOpen="isPlanModalOpen" @close="isPlanModalOpen = false">
    <template #header>Gestionar Plan de {{ selectedTenant?.name }}</template>
    <template #default>
      <PlanManagementForm 
        v-if="isPlanModalOpen"
        :tenant="selectedTenant"
        :loading="isLoading"
        @submit="handleSavePlan"
        @cancel="isPlanModalOpen = false"
      />
    </template>
  </Modal>
  </div>
</template>

<style scoped>
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold; }
.btn-secondary { @apply px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 font-semibold; }
.input-style-dark { @apply bg-gray-700 border-gray-600 text-black rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
</style>