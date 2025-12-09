<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ToothStatus, type ToothState } from '@/types';
import { translateStatus, getStatusButtonClass } from '@/utils/formatters';
import { ToothStatus as TS } from '@/types';

defineProps<{}>();

// Añadimos 'start-bridge' a los eventos emitidos
const emit = defineEmits(['select-status', 'select-state', 'open-delete-manager', 'close', 'start-bridge']);

const currentCondition = ref<'bueno' | 'malo'>('bueno');
const selectorEl = ref<HTMLDivElement | null>(null);

// --- 1. TRATAMIENTOS PULPARES (Top Box) ---
function selectPulpTreatment(sub_type: string, abbreviation: string) {
  emit('select-state', {
    condition: 'Tratamiento Pulpar',
    sub_type: sub_type,
    abbreviation: abbreviation,
    status: currentCondition.value,
  });
  emit('select-status', ToothStatus.ENDODONTICS); // Marca visualmente como endodoncia
}

// --- 2. ESTADOS ESTÁNDAR ---
function selectSurfaceStatus(status: ToothStatus) {
  emit('select-status', status);
}

// --- 3. LÓGICA INTELIGENTE: SELLANTE ---
function selectSealant() {
  if (currentCondition.value === 'bueno') {
    emit('select-status', ToothStatus.SEALANT); // Azul + S
  } else {
    emit('select-status', ToothStatus.SEALANT_DEFECTIVE); // Rojo + S
  }
}

// --- 4. LÓGICA INTELIGENTE: CORONA ---
function selectCrown() {
  if (currentCondition.value === 'bueno') {
    emit('select-status', ToothStatus.CROWN); // Azul
  } else {
    emit('select-status', ToothStatus.CROWN_DEFECTIVE); // Rojo
  }
}

// --- 5. NUEVA FUNCIÓN: INICIAR PUENTE ---
function startBridgeSelection() {
  // Emitimos el evento con el color actual para saber si es un puente "bueno" (azul) o "malo/a realizar" (rojo)
  emit('start-bridge', currentCondition.value === 'bueno' ? 'blue' : 'red');
}

// Cierre al hacer clic fuera
const handleClickOutside = (event: MouseEvent) => {
  if (selectorEl.value && !selectorEl.value.contains(event.target as Node)) {
    emit('close');
  }
};

onMounted(() => { document.addEventListener('mousedown', handleClickOutside); });
onUnmounted(() => { document.removeEventListener('mousedown', handleClickOutside); });
</script>

<template>
  <div ref="selectorEl" class="fixed bg-white rounded-lg shadow-xl border z-50 w-[58rem] max-w-[95vw] flex flex-col max-h-[85vh]">
    
    <!-- HEADER: Selector de Estado General -->
    <div class="flex-shrink-0 bg-gray-50 p-3 border-b">
      <div class="flex shadow-sm">
        <button
          @click="currentCondition = 'bueno'"
          :class="['flex-1 p-2 text-sm font-bold rounded-l-md border transition-all', currentCondition === 'bueno' ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300 z-10' : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-300']"
        >
          Buen Estado (Azul)
        </button>
        <button
          @click="currentCondition = 'malo'"
          :class="['flex-1 p-2 text-sm font-bold rounded-r-md border-t border-b border-r transition-all', currentCondition === 'malo' ? 'bg-red-600 text-white border-red-600 ring-2 ring-red-300 z-10' : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-300']"
        >
          Mal Estado / Defectuoso (Rojo)
        </button>
      </div>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <div class="overflow-y-auto p-5 custom-scrollbar">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- COLUMNA 1: TRATAMIENTO PULPAR -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-gray-400 uppercase border-b pb-1 tracking-wider">Tratamiento Pulpar</h4>
          <div class="grid grid-cols-1 gap-2">
            <button @click="selectPulpTreatment('T. de Conducto', 'TC')" class="palette-btn-pulp">
              <span class="font-bold mr-2 bg-white px-1.5 py-0.5 rounded text-purple-700 border border-purple-200">TC</span> Tratamiento de Conducto
            </button>
            <button @click="selectPulpTreatment('Pulpotomía', 'PP')" class="palette-btn-pulp">
              <span class="font-bold mr-2 bg-white px-1.5 py-0.5 rounded text-purple-700 border border-purple-200">PP</span> Pulpotomía
            </button>
            <button @click="selectPulpTreatment('Necropulpectomía', 'N')" class="palette-btn-pulp">
              <span class="font-bold mr-2 bg-white px-1.5 py-0.5 rounded text-purple-700 border border-purple-200">N</span> Necropulpectomía
            </button>
            <button @click="selectPulpTreatment('Biopulpectomía', 'B')" class="palette-btn-pulp">
              <span class="font-bold mr-2 bg-white px-1.5 py-0.5 rounded text-purple-700 border border-purple-200">B</span> Biopulpectomía
            </button>
          </div>
        </div>
        
        <!-- COLUMNA 2: SUPERFICIES -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-gray-400 uppercase border-b pb-1 tracking-wider">Superficies (Caras)</h4>
          <div class="grid grid-cols-1 gap-2">
            <button @click="selectSurfaceStatus(TS.CARIES)" class="btn-option border-red-100 hover:bg-red-50 text-red-800">
              <div class="w-4 h-4 rounded-full bg-red-500 mr-3 shadow-sm border border-red-600"></div> Caries
            </button>
            <button @click="selectSurfaceStatus(TS.FILLED)" class="btn-option border-blue-100 hover:bg-blue-50 text-blue-800">
              <div class="w-4 h-4 rounded-full bg-blue-500 mr-3 shadow-sm border border-blue-600"></div> Restauración
            </button>
            
            <!-- BOTÓN SELLANTE (INTELIGENTE) -->
            <button @click="selectSealant()" class="btn-option border-gray-200 hover:bg-gray-50 text-gray-800 group">
              <div class="w-5 h-5 rounded-full mr-3 flex items-center justify-center text-[10px] font-bold text-white shadow-sm transition-colors"
                   :class="currentCondition === 'bueno' ? 'bg-blue-500' : 'bg-red-500'">S</div> 
              <span>Sellante <span class="text-xs text-gray-400 font-normal ml-1">({{ currentCondition === 'bueno' ? 'Bueno' : 'Defectuoso' }})</span></span>
            </button>

            <button @click="selectSurfaceStatus(TS.FRACTURE)" class="btn-option border-orange-100 hover:bg-orange-50 text-orange-800">
              <div class="w-4 h-4 rounded-full bg-orange-500 mr-3 shadow-sm border border-orange-600"></div> Fractura
            </button>
            <button @click="selectSurfaceStatus(TS.DISCHROMIA)" class="btn-option border-amber-100 hover:bg-amber-50 text-amber-900">
              <div class="w-4 h-4 rounded-full bg-amber-800 mr-3 shadow-sm border border-amber-900"></div> Discoloración
            </button>
          </div>
        </div>

        <!-- COLUMNA 3: DIENTE COMPLETO -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-gray-400 uppercase border-b pb-1 tracking-wider">Diente Completo</h4>
          <div class="grid grid-cols-2 gap-2">
            
            <!-- PUENTE (NUEVO) -->
            <button @click="startBridgeSelection()" class="btn-icon group bg-gray-50 hover:bg-gray-100 border-gray-300" title="Crear Puente">
               <svg class="w-8 h-8 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                 <circle cx="20" cy="50" r="12" class="fill-none stroke-current text-gray-600" stroke-width="4" />
                 <circle cx="80" cy="50" r="12" class="fill-none stroke-current text-gray-600" stroke-width="4" />
                 <line x1="32" y1="50" x2="68" y2="50" class="stroke-current text-gray-600" stroke-width="6" />
               </svg>
               <span class="text-xs font-bold mt-1 text-gray-700">Puente</span>
            </button>

            <!-- CORONA (INTELIGENTE) -->
            <button @click="selectCrown()" class="btn-icon group relative" title="Corona">
              <div class="absolute top-1 right-1 w-2 h-2 rounded-full" :class="currentCondition === 'bueno' ? 'bg-blue-500' : 'bg-red-500'"></div>
              <svg class="w-8 h-8 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke-width="8" fill="none" :class="currentCondition === 'bueno' ? 'stroke-blue-600' : 'stroke-red-600'"/>
              </svg>
              <span class="text-xs font-medium mt-1 text-center leading-tight">Corona <br><span class="text-[9px] text-gray-400">({{ currentCondition === 'bueno' ? 'OK' : 'Mal' }})</span></span>
            </button>
            
            <!-- CORONA TEMPORAL -->
            <button @click="selectSurfaceStatus(TS.TEMPORARY_CROWN)" class="btn-icon group" title="Corona Temporal">
              <svg class="w-8 h-8 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="40" class="stroke-pink-500" stroke-width="8" fill="none" stroke-dasharray="10,5"/>
              </svg>
              <span class="text-xs font-medium mt-1">Corona Temp.</span>
            </button>

            <!-- ENDODONCIA -->
            <button @click="selectSurfaceStatus(TS.ENDODONTICS)" class="btn-icon group" title="Endodoncia">
              <svg class="w-8 h-8 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                <line x1="50" y1="15" x2="50" y2="85" class="stroke-purple-600" stroke-width="10" stroke-linecap="round"/>
              </svg>
              <span class="text-xs font-medium mt-1">Endodoncia</span>
            </button>

            <!-- IMPLANTE -->
            <button @click="selectSurfaceStatus(TS.IMPLANT)" class="btn-icon group" title="Implante">
              <svg class="w-8 h-8 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                 <g class="stroke-gray-600" stroke-width="8" stroke-linecap="round"><line x1="50" y1="20" x2="50" y2="80"/><line x1="30" y1="35" x2="70" y2="35"/><line x1="30" y1="50" x2="70" y2="50"/><line x1="30" y1="65" x2="70" y2="65"/></g>
              </svg>
              <span class="text-xs font-medium mt-1">Implante</span>
            </button>

            <!-- PÓNTICO -->
            <button @click="selectSurfaceStatus(TS.PONTIC)" class="btn-icon group" title="Póntico">
              <svg class="w-8 h-8 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                 <rect x="20" y="35" width="60" height="30" rx="5" class="stroke-gray-500" stroke-width="8" fill="none"/>
              </svg>
              <span class="text-xs font-medium mt-1">Póntico</span>
            </button>

            <!-- AUSENTE -->
            <button @click="selectSurfaceStatus(TS.EXTRACTED)" class="btn-icon group" title="Ausente / Extraído">
               <svg class="w-8 h-8 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                 <g class="stroke-gray-800" stroke-width="10" stroke-linecap="round"><line x1="20" y1="20" x2="80" y2="80"/><line x1="20" y1="80" x2="80" y2="20"/></g>
               </svg>
               <span class="text-xs font-medium mt-1">Ausente</span>
            </button>

            <!-- EXTRACCIÓN INDICADA -->
            <button @click="selectSurfaceStatus(TS.EXTRACTION_NEEDED)" class="btn-icon group" title="Extracción Indicada">
               <svg class="w-8 h-8 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                 <g class="stroke-red-600" stroke-width="10" stroke-linecap="round"><line x1="20" y1="20" x2="80" y2="80"/><line x1="20" y1="80" x2="80" y2="20"/></g>
               </svg>
               <span class="text-xs font-medium mt-1">Extracción</span>
            </button>
            
            <!-- SUPERNUMERARIO -->
            <button @click="selectSurfaceStatus(TS.SUPERNUMERARY)" class="btn-icon group" title="Supernumerario">
               <div class="w-8 h-8 flex items-center justify-center font-bold text-teal-600 border-2 border-teal-600 rounded-full text-lg group-hover:scale-110 transition-transform">S</div>
               <span class="text-xs font-medium mt-1">Supernum.</span>
            </button>

          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="flex-shrink-0 flex items-center border-t bg-gray-50 p-0 rounded-b-lg">
      <button 
        @click="emit('open-delete-manager')" 
        class="flex-1 p-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors rounded-bl-lg flex justify-center items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        Borrar Estados
      </button>
      <div class="w-px h-full bg-gray-300"></div>
      <button 
        @click="emit('close')" 
        class="flex-1 p-3 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors rounded-br-lg"
      >
        Cerrar
      </button>
    </div>
    
  </div>
</template>

<style scoped>
.btn-option { 
  @apply flex items-center p-2.5 rounded-md border border-gray-200 text-sm font-medium bg-white shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 text-left; 
}
.palette-btn-pulp { 
  @apply w-full px-3 py-2.5 text-sm text-left rounded-md whitespace-nowrap transition-colors bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-100 flex items-center; 
}
.btn-icon { 
  @apply flex flex-col items-center justify-center p-2 rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all h-24; 
}

/* Colores SVG */
.stroke-primary { stroke: #2563EB; } 
.stroke-pink-500 { stroke: #ec4899; }
.stroke-purple-600 { stroke: #9333ea; }
.stroke-gray-600 { stroke: #4b5563; }
.stroke-gray-800 { stroke: #1f2937; }
.stroke-gray-500 { stroke: #6b7280; }
.stroke-red-600 { stroke: #dc2626; }
.stroke-blue-600 { stroke: #2563EB; }
.stroke-teal-600 { stroke: #0d9488; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
</style>