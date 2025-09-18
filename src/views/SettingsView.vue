<template>
  <div>
    <h1 class="text-3xl font-bold text-text-dark mb-4">Configuración</h1>

    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-6">
        <RouterLink 
          to="/settings"
          class="py-4 px-1 border-b-2 font-medium text-sm"
          active-class="border-primary text-primary"
          exact-active-class="border-primary text-primary"
        >
          Usuarios
        </RouterLink>
      </nav>
    </div>

    <RouterView />
  </div>
</template>