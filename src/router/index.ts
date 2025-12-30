import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { jwtDecode } from 'jwt-decode';

// Solo importamos los layouts y la vista de login de forma estática
import LoginView from '../views/LoginView.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue'
import PrintLayout from '@/layouts/PrintLayout.vue'
// Importación de la vista pública (Website Builder)
import ClinicWebsiteView from '../views/public/ClinicWebsiteView.vue';

// Función para detectar subdominio
const getSubdomain = () => {
  const host = window.location.host;
  const parts = host.split('.');
  // En localhost: 'clinica.localhost' -> ['clinica', 'localhost']
  // En prod: 'clinica.sonriandes.com' -> ['clinica', 'sonriandes', 'com']
  
  // Ajuste para localhost simple
  if (host.includes('localhost') && parts.length === 1) return null;
  
  if (parts.length >= 2) return parts[0]; // Retorna el primer segmento
  return null;
};

const subdomain = getSubdomain();

// Determinamos si es la App Principal o una Web de Clínica
// 'app' = Sistema
// 'www' = Landing (si llegara aquí por error DNS)
// null = Localhost raíz o dominio raíz
const isAppSubdomain = subdomain === 'app' || subdomain === 'www' || subdomain === null || subdomain === 'localhost';

let routes = [];

if (!isAppSubdomain) {
  // ==========================================
  // MODO 1: SITIO WEB PÚBLICO DE CLÍNICA
  // ==========================================
  // Carga cuando el subdominio NO es 'app' (ej: 'clinica-sur.sonriandes.com')
  routes = [
    {
      path: '/:pathMatch(.*)*', // Captura cualquier ruta y muestra siempre la web
      name: 'clinic-website',
      component: ClinicWebsiteView,
    }
  ];
} else {
  // ==========================================
  // MODO 2: SISTEMA DE GESTIÓN (APP)
  // ==========================================
  // Carga cuando es 'app.sonriandes.com' o local
  routes = [
    // --- RUTAS PÚBLICAS DEL SISTEMA ---
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: () => import('../views/PrivacyPolicyView.vue'),
    },
    {
      path: '/terms-and-conditions',
      name: 'terms-and-conditions',
      component: () => import('../views/TermsAndConditionsView.vue'),
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
          path: 'payment/:id',
          name: 'print-payment-receipt',
          component: () => import('../views/PaymentReceiptView.vue'),
        },
      ],
    },

    // --- RUTAS DE CLÍNICA (MAIN) ---
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
              path: 'consents',
              name: 'settings-consents',
              component: () => import('@/views/settings/ConsentManagementView.vue'),
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
            },
            { 
              path: 'appearance',
              name: 'settings-appearance',
              component: () => import('../views/settings/AppearanceView.vue'),
              meta: { requiresAdmin: true } 
            },
            { 
              path: 'website',
              name: 'settings-website',
              component: () => import('../views/settings/WebsiteManagementView.vue'),
              meta: { requiresAdmin: true }
            },
          ]
        },
      ],
    },
  ];
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  // 1. Si estamos en modo Sitio Web Público, permitimos todo sin auth
  if (!isAppSubdomain) {
     return next();
  }

  // 2. Si estamos en modo Sistema, aplicamos seguridad
  const authStore = useAuthStore();

  // Si no hay usuario pero sí hay token, espera a que se verifique
  if (!authStore.user && sessionStorage.getItem('token')) {
    await authStore.checkToken();
  }

  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated && to.name !== 'login') {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router