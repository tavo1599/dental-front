<template>
  <div>
    <h1 class="text-3xl font-bold text-text-dark mb-4">Configuración</h1>
    
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-6">
        <RouterLink 
          to="/settings/users"
          class="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700"
          active-class="!border-primary !text-primary"
        >
          Usuarios
        </RouterLink>
        <RouterLink 
          to="/settings/security"
          class="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700"
          active-class="!border-primary !text-primary"
        >
          Seguridad
        </RouterLink>
        <RouterLink 
          to="/settings/audit"
          class="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700"
          active-class="!border-primary !text-primary"
        >
          Auditoría
        </RouterLink>
        <RouterLink 
          to="/settings/integrations"
          class="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700"
          active-class="!border-primary !text-primary"
        >
          Integraciones
        </RouterLink>
      </nav>
    </div>
    
    <RouterView />
  </div>
</template>