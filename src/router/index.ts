import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Solo importamos los layouts y la vista de login de forma estática
import LoginView from '../views/LoginView.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue'
import PrintLayout from '@/layouts/PrintLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- RUTAS PÚBLICAS ---
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue'),
    },

    // --- RUTAS DE SUPER ADMIN ---
    {
      path: '/super-admin',
      component: SuperAdminLayout,
      meta: { requiresAuth: true, requiresSuperAdmin: true },
      redirect: '/super-admin/dashboard',
      children: [
        { 
          path: 'dashboard', 
          name: 'super-admin-dashboard', 
          component: () => import('../views/super-admin/Dashboard.vue') 
        },
        {
          path: 'diagnoses',
          name: 'super-admin-diagnoses',
          component: () => import('../views/super-admin/DiagnosesView.vue'),
        },
        {
          path: 'consent-templates',
          name: 'super-admin-consent-templates',
          component: () => import('../views/super-admin/ConsentTemplatesView.vue'),
        },
      ],
    },

    // --- RUTA DE IMPRESIÓN ---
    {
      path: '/print',
      component: PrintLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'budget/:id',
          name: 'print-budget',
          component: () => import('../views/BudgetPrintView.vue'),
        },
      ],
    },

    // --- RUTAS DE CLÍNICA ---
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true, requiresClinicUser: true },
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: 'patients',
          name: 'patients',
          component: () => import('../views/PatientsView.vue'),
        },
        { 
          path: 'patients/:id', 
          name: 'patient-detail',
          component: () => import('../views/PatientDetailView.vue'),
        },
        {
          path: 'treatments',
          name: 'treatments',
          component: () => import('../views/TreatmentsView.vue'),
        },
        {
          path: 'appointments',
          name: 'appointments',
          component: () => import('../views/AppointmentsView.vue'),
        },
        {
          path: 'expenses',
          name: 'expenses',
          component: () => import('../views/ExpensesView.vue'),
        },
        {
          path: 'cash-management',
          name: 'cash-management',
          component: () => import('../views/CashManagementView.vue'),
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('../views/ReportsView.vue'),
          meta: { requiresAdmin: true },
        },
        {
          path: 'settings',
          component: () => import('../views/SettingsView.vue'),
          redirect: '/settings/users',
          children: [
            {
              path: 'users',
              name: 'settings-users',
              component: () => import('../views/settings/UserManagementView.vue'),
            },
            {
              path: 'integrations',
              name: 'settings-integrations',
              component: () => import('../views/settings/IntegrationsView.vue'),
              meta: { requiresAdmin: true },
            },
            {
              path: 'audit',
              name: 'settings-audit',
              component: () => import('../views/settings/AuditLogView.vue'),
              meta: { requiresAdmin: true },
            },
            {
              path: 'security',
              name: 'settings-security',
              component: () => import('../views/settings/SecuritySettingsView.vue'),
              meta: { requiresAdmin: true },
            }
          ]
        },
      ],
    },
  ],
})

// Navigation Guard (sin cambios)
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