<template>
  <div class="mt-8 pt-4 border-t border-gray-200">
    <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Leyenda del Odontograma</h3>
    
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-4 text-xs text-gray-700">

      <!-- Estados de Superficie -->
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded-full bg-white border border-gray-400"></div>
        <span>Sano</span>
      </div>
      
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded-full bg-red-500 border border-red-600"></div>
        <span>Caries / Mal Estado</span>
      </div>
      
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded-full bg-blue-500 border border-blue-600"></div>
        <span>Restauración (Buen Estado)</span>
      </div>

      <!-- NUEVO: Sellantes (S de color sobre fondo blanco) -->
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-blue-600 font-extrabold text-xs">S</div>
        <span>Sellante (Bueno)</span>
      </div>
      
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-red-600 font-extrabold text-xs">S</div>
        <span>Sellante (Defectuoso)</span>
      </div>

      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded-full bg-orange-500 border border-orange-600"></div>
        <span>Fractura</span>
      </div>
      
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded-full bg-amber-800 border border-amber-900"></div>
        <span>Discoloración</span>
      </div>

      <!-- Estados de Diente Completo -->
      
      <!-- Coronas -->
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" class="stroke-blue-600" stroke-width="10" fill="none"/></svg>
        <span>Corona (Buena)</span>
      </div>
      
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" class="stroke-red-600" stroke-width="10" fill="none"/></svg>
        <span>Corona (Defectuosa)</span>
      </div>
      
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" class="stroke-pink-500" stroke-width="10" fill="none" stroke-dasharray="10,5"/></svg>
        <span>Corona Temporal</span>
      </div>

      <div class="flex items-center gap-2">
        <svg class="w-6 h-6" viewBox="0 0 100 100"><line x1="50" y1="20" x2="50" y2="80" class="stroke-purple-600" stroke-width="10" stroke-linecap="round"/></svg>
        <span>Endodoncia</span>
      </div>

      <div class="flex items-center gap-2">
        <svg class="w-6 h-6" viewBox="0 0 100 100"><g class="stroke-black" stroke-width="10" stroke-linecap="round"><line x1="20" y1="20" x2="80" y2="80"/><line x1="20" y1="80" x2="80" y2="20"/></g></svg>
        <span>Ausente / Extraído</span>
      </div>
      
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6" viewBox="0 0 100 100"><g class="stroke-red-600" stroke-width="10" stroke-linecap="round"><line x1="20" y1="20" x2="80" y2="80"/><line x1="20" y1="80" x2="80" y2="20"/></g></svg>
        <span>Extracción Indicada</span>
      </div>
      
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6" viewBox="0 0 100 100"><g class="stroke-gray-600" stroke-width="8" stroke-linecap="round"><line x1="50" y1="20" x2="50" y2="80"/><line x1="30" y1="35" x2="70" y2="35"/><line x1="30" y1="50" x2="70" y2="50"/><line x1="30" y1="65" x2="70" y2="65"/></g></svg>
        <span>Implante</span>
      </div>
      
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6" viewBox="0 0 100 100"><rect x="20" y="35" width="60" height="30" rx="5" class="stroke-gray-500" stroke-width="8" fill="none"/></svg>
        <span>Póntico</span>
      </div>

      <!-- Puente -->
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6" viewBox="0 0 100 100">
           <circle cx="25" cy="50" r="10" class="stroke-gray-600" stroke-width="8" fill="none" />
           <circle cx="75" cy="50" r="10" class="stroke-gray-600" stroke-width="8" fill="none" />
           <line x1="35" y1="50" x2="65" y2="50" class="stroke-gray-600" stroke-width="8" />
        </svg>
        <span>Puente</span>
      </div>
      
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 100 100"><g class="stroke-teal-super" stroke-width="12" stroke-linecap="round"><line x1="50" y1="20" x2="50" y2="80"/><line x1="20" y1="50" x2="80" y2="50"/></g></svg>
        <span>Supernumerario</span>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Estilos SVG alineados con Tooth.vue */
.stroke-blue-600 { stroke: #2563EB; }
.stroke-red-600 { stroke: #dc2626; }
.stroke-pink-500 { stroke: #ec4899; }
.stroke-purple-600 { stroke: #9333ea; }
.stroke-gray-600 { stroke: #4b5563; }
.stroke-gray-500 { stroke: #6b7280; }
.stroke-black { stroke: #000; }
.stroke-teal-600 { stroke: #0d9488; }
</style>