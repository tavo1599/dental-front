import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Vistas y Layouts
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import PatientsView from '../views/PatientsView.vue';
import PatientDetailView from '../views/PatientDetailView.vue';
import TreatmentsView from '../views/TreatmentsView.vue';
import AppointmentsView from '../views/AppointmentsView.vue';
import ForgotPasswordView from '../views/ForgotPasswordView.vue';
import ResetPasswordView from '../views/ResetPasswordView.vue';
import PrintLayout from '@/layouts/PrintLayout.vue';
import BudgetPrintView from '@/views/BudgetPrintView.vue';
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue';
import SuperAdminDashboard from '@/views/super-admin/Dashboard.vue';
import SuperAdminDiagnosesView from '@/views/super-admin/DiagnosesView.vue';
import ExpensesView from '../views/ExpensesView.vue';
import CashManagementView from '../views/CashManagementView.vue';
import SettingsView from '../views/SettingsView.vue';
import UserManagementView from '../views/settings/UserManagementView.vue';
import SuperAdminConsentTemplatesView from '@/views/super-admin/ConsentTemplatesView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- GRUPO 1: RUTAS PÚBLICAS (Cualquiera puede acceder) ---
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
    },

    // --- GRUPO 2: RUTAS DE SUPER ADMIN (Protegidas) ---
    {
      path: '/super-admin',
      component: SuperAdminLayout,
      meta: { requiresAuth: true, requiresSuperAdmin: true },
      redirect: '/super-admin/dashboard',
      children: [
        { 
          path: 'dashboard', 
          name: 'super-admin-dashboard', 
          component: SuperAdminDashboard 
        },
        {
          path: 'diagnoses',
          name: 'super-admin-diagnoses',
          component: SuperAdminDiagnosesView,
        },
        {
          path: 'consent-templates',
          name: 'super-admin-consent-templates',
          component: SuperAdminConsentTemplatesView,
        },
      ],
    },

    // --- GRUPO 3: RUTA DE IMPRESIÓN (Layout especial) ---
    {
      path: '/print',
      component: PrintLayout,
      meta: { requiresAuth: true }, // Requiere login, pero no un layout específico
      children: [
        {
          path: 'budget/:id',
          name: 'print-budget',
          component: BudgetPrintView,
        },
      ],
    },

    // --- GRUPO 4: RUTAS DE CLÍNICA (Protegidas y con MainLayout) ---
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true, requiresClinicUser: true },
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'patients',
          name: 'patients',
          component: PatientsView,
        },
        { 
          path: 'patients/:id', 
          name: 'patient-detail',
          component: PatientDetailView,
        },
        {
          path: 'treatments',
          name: 'treatments',
          component: TreatmentsView,
        },
        {
          path: 'appointments',
          name: 'appointments',
          component: AppointmentsView,
        },
        {
          path: 'expenses',
          name: 'expenses',
          component: ExpensesView,
        },
        {
          path: 'cash-management',
          name: 'cash-management',
          component: CashManagementView,
        },
        {
          path: 'settings',
          component: SettingsView,
          redirect: '/settings/users',
          children: [
            {
              path: 'users',
              name: 'settings-users',
              component: UserManagementView,
            },
          ]
        },
      ],
    },
  ],
})

// Navigation Guard para proteger las rutas
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const isSuperAdmin = authStore.user?.isSuperAdmin;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } else if (to.meta.requiresSuperAdmin && !isSuperAdmin) {
    next({ name: 'dashboard' });
  } else if (to.meta.requiresClinicUser && isSuperAdmin) {
    next({ name: 'super-admin-dashboard' });
  } else {
    next();
  }
});

export default router