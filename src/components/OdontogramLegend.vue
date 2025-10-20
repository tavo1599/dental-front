<template>
  <div class="mt-8 pt-4 border-t">
    <h3 class="text-lg font-semibold text-text-dark mb-3">Leyenda</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-4 text-sm">

      <!-- Estados de Superficie -->
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-white border"></div>
        <span>Sano</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-red-500"></div>
        <span>Caries</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-blue-500"></div>
        <span>Obturado</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-yellow-sealant"></div>
        <span>Sellante</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-orange-fracture"></div>
        <span>Fractura</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-brown-dischromia"></div>
        <span>Discoloración</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-purple-defective"></div>
        <span>Obturado Defectuoso</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-teal-defective"></div>
        <span>Sellante Defectuoso</span>
      </div>

      <!-- Estados de Diente Completo -->
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" class="stroke-primary" stroke-width="10" fill="none"/></svg>
        <span>Corona</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" class="stroke-red-700" stroke-width="10" fill="none"/></svg>
        <span>Corona Defectuosa</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" class="stroke-pink-temp" stroke-width="10" fill="none"/></svg>
        <span>Corona Temporal</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 100 100"><line x1="50" y1="20" x2="50" y2="80" class="stroke-purple-endo" stroke-width="10" stroke-linecap="round"/></svg>
        <span>Endodoncia</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 100 100"><g class="stroke-gray-implant" stroke-width="10" stroke-linecap="round"><line x1="50" y1="30" x2="50" y2="70"/><line x1="30" y1="45" x2="70" y2="45"/></g></svg>
        <span>Implante</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 100 100"><rect x="25" y="40" width="50" height="20" rx="5" class="stroke-gray-400" stroke-width="10" fill="none"/></svg>
        <span>Póntico</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 100 100"><g class="stroke-red-800" stroke-width="12" stroke-linecap="round"><line x1="20" y1="20" x2="80" y2="80"/><line x1="20" y1="80" x2="80" y2="20"/></g></svg>
        <span>Extracción Indicada</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 100 100"><g class="stroke-black" stroke-width="12" stroke-linecap="round"><line x1="20" y1="20" x2="80" y2="80"/><line x1="20" y1="80" x2="80" y2="20"/></g></svg>
        <span>Extraído / Ausente</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 100 100"><g class="stroke-teal-super" stroke-width="12" stroke-linecap="round"><line x1="50" y1="20" x2="50" y2="80"/><line x1="20" y1="50" x2="80" y2="50"/></g></svg>
        <span>Supernumerario</span>
      </div>

    </div>
  </div>
</template>