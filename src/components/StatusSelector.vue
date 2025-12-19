<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ToothStatus, type ToothState } from '@/types';
import { ToothStatus as TS } from '@/types';

defineProps<{}>();

const emit = defineEmits(['select-status', 'select-state', 'open-delete-manager', 'close', 'start-bridge']);

// Estado global (Azul/Rojo/Verde)
const currentCondition = ref<'bueno' | 'malo' | 'evolucionado'>('bueno');
const selectorEl = ref<HTMLDivElement | null>(null);

// --- NAVEGACIÓN DE SECCIONES ---
// null = Menú Principal
const activeSection = ref<'pulp' | 'surface' | 'whole' | null>(null);

const sectionTitles: Record<string, string> = {
  pulp: 'Tratamiento Pulpar',
  surface: 'Superficies (Caras)',
  whole: 'Diente Completo'
};

// Orden de navegación para las flechas
const sectionOrder = ['pulp', 'surface', 'whole'] as const;

function nextSection() {
  if (!activeSection.value) return;
  const currentIndex = sectionOrder.indexOf(activeSection.value);
  const nextIndex = (currentIndex + 1) % sectionOrder.length;
  activeSection.value = sectionOrder[nextIndex];
}

function prevSection() {
  if (!activeSection.value) return;
  const currentIndex = sectionOrder.indexOf(activeSection.value);
  const prevIndex = (currentIndex - 1 + sectionOrder.length) % sectionOrder.length;
  activeSection.value = sectionOrder[prevIndex];
}

// --- ACCIONES DE SELECCIÓN ---

// 1. TRATAMIENTOS PULPARES
function selectPulpTreatment(sub_type: string, abbreviation: string) {
  emit('select-state', {
    condition: 'Tratamiento Pulpar',
    sub_type: sub_type,
    abbreviation: abbreviation,
    status: currentCondition.value,
  });
  if (currentCondition.value === 'evolucionado') {
     emit('select-status', ToothStatus.ENDODONTICS_EVOLVED);
  } else {
     emit('select-status', ToothStatus.ENDODONTICS);
  }
}

// 2. ESTADOS ESTÁNDAR
function selectSurfaceStatus(status: ToothStatus) {
  emit('select-status', status);
}

// 3. SELLANTE INTELIGENTE
function selectSealant() {
  if (currentCondition.value === 'bueno') emit('select-status', ToothStatus.SEALANT);
  else if (currentCondition.value === 'malo') emit('select-status', ToothStatus.SEALANT_DEFECTIVE);
  else emit('select-status', ToothStatus.SEALANT_EVOLVED);
}

// 4. CORONA INTELIGENTE
function selectCrown() {
  if (currentCondition.value === 'bueno') emit('select-status', ToothStatus.CROWN);
  else if (currentCondition.value === 'malo') emit('select-status', ToothStatus.CROWN_DEFECTIVE);
  else emit('select-status', ToothStatus.CROWN_EVOLVED);
}

// 5. RESTAURACIÓN INTELIGENTE
function selectFilled() {
  if (currentCondition.value === 'bueno') emit('select-status', ToothStatus.FILLED);
  else if (currentCondition.value === 'malo') emit('select-status', ToothStatus.FILLED_DEFECTIVE);
  else emit('select-status', ToothStatus.FILLED_EVOLVED);
}

// 6. PUENTE
function startBridgeSelection() {
  let color = 'blue';
  if (currentCondition.value === 'malo') color = 'red';
  if (currentCondition.value === 'evolucionado') color = 'green';
  emit('start-bridge', color);
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
  <div ref="selectorEl" class="status-selector-popup fixed bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-[22rem] flex flex-col overflow-hidden animate-fade-in">
    
    <!-- 1. HEADER FIJO: SELECTOR DE ESTADO -->
    <div class="bg-gray-50 p-3 border-b border-gray-200">
      <div class="flex rounded-lg shadow-sm overflow-hidden">
        <button
          @click="currentCondition = 'bueno'"
          :class="['flex-1 py-2 text-[10px] font-bold transition-all border-r', currentCondition === 'bueno' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50']"
        >
          Bueno
        </button>
        <button
          @click="currentCondition = 'malo'"
          :class="['flex-1 py-2 text-[10px] font-bold transition-all border-r', currentCondition === 'malo' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100']"
        >
          Malo
        </button>
        <button
          @click="currentCondition = 'evolucionado'"
          :class="['flex-1 py-2 text-[10px] font-bold transition-all', currentCondition === 'evolucionado' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100']"
        >
          Evol.
        </button>
      </div>
    </div>

    <!-- 2. CUERPO DINÁMICO -->
    <div class="flex-1 bg-white relative min-h-[320px]">
      
      <!-- A. MENÚ PRINCIPAL (SECCIONES) -->
      <div v-if="!activeSection" class="p-4 grid grid-cols-1 gap-3 h-full">
         <p class="text-xs text-gray-400 font-bold uppercase tracking-wider text-center mb-2">Seleccione Categoría</p>
         
         <button @click="activeSection = 'pulp'" class="menu-card group hover:border-purple-300 hover:bg-purple-50">
            <div class="p-3 bg-purple-100 rounded-full text-purple-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <div class="text-left">
                <span class="block font-bold text-gray-700 group-hover:text-purple-700">Tratamiento Pulpar</span>
                <span class="text-[10px] text-gray-500">Endodoncia, Pulpotomía...</span>
            </div>
            <div class="ml-auto text-gray-300 group-hover:text-purple-400">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
            </div>
         </button>

         <button @click="activeSection = 'surface'" class="menu-card group hover:border-blue-300 hover:bg-blue-50">
            <div class="p-3 bg-blue-100 rounded-full text-blue-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <div class="text-left">
                <span class="block font-bold text-gray-700 group-hover:text-blue-700">Superficies</span>
                <span class="text-[10px] text-gray-500">Caries, Restauraciones...</span>
            </div>
             <div class="ml-auto text-gray-300 group-hover:text-blue-400">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
            </div>
         </button>

         <button @click="activeSection = 'whole'" class="menu-card group hover:border-orange-300 hover:bg-orange-50">
            <div class="p-3 bg-orange-100 rounded-full text-orange-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <div class="text-left">
                <span class="block font-bold text-gray-700 group-hover:text-orange-700">Diente Completo</span>
                <span class="text-[10px] text-gray-500">Coronas, Puentes, Implantes...</span>
            </div>
             <div class="ml-auto text-gray-300 group-hover:text-orange-400">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
            </div>
         </button>
      </div>

      <!-- B. VISTA DE SECCIÓN ESPECÍFICA -->
      <div v-else class="flex flex-col h-full">
         
         <!-- Navegación Interna -->
         <div class="flex justify-between items-center px-4 py-3 bg-gray-50/50 border-b border-gray-100">
             <button @click="activeSection = null" class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100" title="Volver al Menú">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
             </button>
             
             <div class="flex items-center gap-3">
                 <button @click="prevSection" class="text-gray-400 hover:text-primary p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                 </button>
                 <h4 class="text-sm font-bold text-gray-700 uppercase tracking-wide min-w-[140px] text-center">{{ sectionTitles[activeSection] }}</h4>
                 <button @click="nextSection" class="text-gray-400 hover:text-primary p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                 </button>
             </div>
             
             <div class="w-6"></div> <!-- Espaciador para centrar título -->
         </div>

         <!-- CONTENIDO DE SECCIÓN -->
         <div class="p-3 overflow-y-auto flex-1 custom-scrollbar">
             
             <!-- 1. PULPAR -->
             <div v-if="activeSection === 'pulp'" class="grid grid-cols-1 gap-2">
                <button @click="selectPulpTreatment('T. de Conducto', 'TC')" class="palette-btn-pulp">
                  <span class="font-bold mr-3 bg-white px-1.5 py-0.5 rounded text-purple-700 border border-purple-200 text-xs">TC</span> T. de Conducto
                </button>
                <button @click="selectPulpTreatment('Pulpotomía', 'PP')" class="palette-btn-pulp">
                  <span class="font-bold mr-3 bg-white px-1.5 py-0.5 rounded text-purple-700 border border-purple-200 text-xs">PP</span> Pulpotomía
                </button>
                <button @click="selectPulpTreatment('Necropulpectomía', 'N')" class="palette-btn-pulp">
                  <span class="font-bold mr-3 bg-white px-1.5 py-0.5 rounded text-purple-700 border border-purple-200 text-xs">N</span> Necropulpectomía
                </button>
                <button @click="selectPulpTreatment('Biopulpectomía', 'B')" class="palette-btn-pulp">
                  <span class="font-bold mr-3 bg-white px-1.5 py-0.5 rounded text-purple-700 border border-purple-200 text-xs">B</span> Biopulpectomía
                </button>
             </div>

             <!-- 2. SUPERFICIES -->
             <div v-if="activeSection === 'surface'" class="grid grid-cols-1 gap-2">
                <button @click="selectSurfaceStatus(TS.CARIES)" class="btn-option border-red-100 hover:bg-red-50 text-red-800">
                  <div class="w-4 h-4 rounded-full bg-red-500 mr-3 shadow-sm border border-red-600"></div> Caries
                </button>
                
                <button @click="selectFilled()" class="btn-option border-blue-100 hover:bg-blue-50 text-blue-800">
                   <div class="w-4 h-4 rounded-full mr-3 shadow-sm border transition-colors"
                       :class="{
                           'bg-blue-500 border-blue-600': currentCondition === 'bueno',
                           'bg-red-500 border-red-600': currentCondition === 'malo',
                           'bg-green-500 border-green-600': currentCondition === 'evolucionado'
                       }"></div> 
                   <span>Restauración</span>
                </button>
                
                <button @click="selectSealant()" class="btn-option border-gray-200 hover:bg-gray-50 text-gray-800">
                  <div class="w-4 h-4 rounded-full mr-3 flex items-center justify-center text-[9px] font-bold text-white shadow-sm transition-colors"
                       :class="{
                           'bg-blue-500': currentCondition === 'bueno',
                           'bg-red-500': currentCondition === 'malo',
                           'bg-green-500': currentCondition === 'evolucionado'
                       }">S</div> 
                  <span>Sellante</span>
                </button>

                <button @click="selectSurfaceStatus(TS.FRACTURE)" class="btn-option border-orange-100 hover:bg-orange-50 text-orange-800">
                  <div class="w-4 h-4 rounded-full bg-orange-500 mr-3 shadow-sm border border-orange-600"></div> Fractura
                </button>
                <button @click="selectSurfaceStatus(TS.DISCHROMIA)" class="btn-option border-amber-100 hover:bg-amber-50 text-amber-900">
                  <div class="w-4 h-4 rounded-full bg-amber-800 mr-3 shadow-sm border border-amber-900"></div> Discoloración
                </button>
             </div>

             <!-- 3. DIENTE COMPLETO -->
             <div v-if="activeSection === 'whole'" class="grid grid-cols-2 gap-2">
                <button @click="startBridgeSelection()" class="btn-icon group bg-gray-50 hover:bg-gray-100 border-gray-300" title="Crear Puente">
                   <svg class="w-7 h-7 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                     <circle cx="20" cy="50" r="12" class="fill-none stroke-current" :class="{'text-green-600': currentCondition === 'evolucionado', 'text-gray-600': currentCondition !== 'evolucionado'}" stroke-width="4" />
                     <circle cx="80" cy="50" r="12" class="fill-none stroke-current" :class="{'text-green-600': currentCondition === 'evolucionado', 'text-gray-600': currentCondition !== 'evolucionado'}" stroke-width="4" />
                     <line x1="32" y1="50" x2="68" y2="50" class="stroke-current" :class="{'text-green-600': currentCondition === 'evolucionado', 'text-gray-600': currentCondition !== 'evolucionado'}" stroke-width="6" />
                   </svg>
                   <span class="text-xs font-bold mt-1 text-gray-700">Puente</span>
                </button>

                <button @click="selectCrown()" class="btn-icon group relative" title="Corona">
                  <div class="absolute top-1 right-1 w-2 h-2 rounded-full" 
                       :class="{
                           'bg-blue-500': currentCondition === 'bueno',
                           'bg-red-500': currentCondition === 'malo',
                           'bg-green-500': currentCondition === 'evolucionado'
                       }"></div>
                  <svg class="w-7 h-7 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke-width="8" fill="none" 
                            :class="{
                               'stroke-blue-600': currentCondition === 'bueno',
                               'stroke-red-600': currentCondition === 'malo',
                               'stroke-green-600': currentCondition === 'evolucionado'
                            }"/>
                  </svg>
                  <span class="text-xs font-medium mt-1">Corona</span>
                </button>
                
                <button @click="selectSurfaceStatus(TS.TEMPORARY_CROWN)" class="btn-icon group" title="Corona Temporal">
                  <svg class="w-7 h-7 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="40" class="stroke-pink-500" stroke-width="8" fill="none" stroke-dasharray="10,5"/>
                  </svg>
                  <span class="text-xs font-medium mt-1">Temp.</span>
                </button>

                <button @click="selectPulpTreatment('Tratamiento de Conducto', 'TC')" class="btn-icon group" title="Endodoncia">
                  <svg class="w-7 h-7 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                    <line x1="50" y1="15" x2="50" y2="85" class="stroke-width-10 stroke-linecap-round"
                          :class="currentCondition === 'evolucionado' ? 'stroke-green-600' : 'stroke-purple-600'" />
                  </svg>
                  <span class="text-xs font-medium mt-1">Endo</span>
                </button>

                <button @click="selectSurfaceStatus(TS.IMPLANT)" class="btn-icon group" title="Implante">
                  <svg class="w-7 h-7 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                     <g class="stroke-gray-600" stroke-width="8" stroke-linecap="round"><line x1="50" y1="20" x2="50" y2="80"/><line x1="30" y1="35" x2="70" y2="35"/><line x1="30" y1="50" x2="70" y2="50"/><line x1="30" y1="65" x2="70" y2="65"/></g>
                  </svg>
                  <span class="text-xs font-medium mt-1">Implante</span>
                </button>

                <button @click="selectSurfaceStatus(TS.PONTIC)" class="btn-icon group" title="Póntico">
                  <svg class="w-7 h-7 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                     <rect x="20" y="35" width="60" height="30" rx="5" class="stroke-gray-500" stroke-width="8" fill="none"/>
                  </svg>
                  <span class="text-xs font-medium mt-1">Póntico</span>
                </button>

                <button @click="selectSurfaceStatus(TS.EXTRACTED)" class="btn-icon group" title="Ausente / Extraído">
                   <svg class="w-7 h-7 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                     <g class="stroke-gray-800" stroke-width="10" stroke-linecap="round"><line x1="20" y1="20" x2="80" y2="80"/><line x1="20" y1="80" x2="80" y2="20"/></g>
                   </svg>
                   <span class="text-xs font-medium mt-1">Ausente</span>
                </button>

                <button @click="selectSurfaceStatus(TS.EXTRACTION_NEEDED)" class="btn-icon group" title="Extracción Indicada">
                   <svg class="w-7 h-7 group-hover:scale-110 transition-transform" viewBox="0 0 100 100">
                     <g class="stroke-red-600" stroke-width="10" stroke-linecap="round"><line x1="20" y1="20" x2="80" y2="80"/><line x1="20" y1="80" x2="80" y2="20"/></g>
                   </svg>
                   <span class="text-xs font-medium mt-1">Extracción</span>
                </button>
                
                <button @click="selectSurfaceStatus(TS.SUPERNUMERARY)" class="btn-icon group" title="Supernumerario">
                   <div class="w-7 h-7 flex items-center justify-center font-bold text-teal-600 border-2 border-teal-600 rounded-full text-sm group-hover:scale-110 transition-transform">S</div>
                   <span class="text-xs font-medium mt-1">Supernum.</span>
                </button>
             </div>

         </div>
      </div>

    </div>
    
    <!-- Footer -->
    <div class="flex-shrink-0 flex items-center border-t bg-gray-50 p-0 rounded-b-xl">
      <button 
        @click="emit('open-delete-manager')" 
        class="flex-1 p-3 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors rounded-bl-xl flex justify-center items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        Borrar Estados
      </button>
      <div class="w-px h-full bg-gray-300"></div>
      <button 
        @click="emit('close')" 
        class="flex-1 p-3 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors rounded-br-xl"
      >
        Cerrar
      </button>
    </div>
    
  </div>
</template>

<style scoped>
.menu-card {
  @apply flex items-center p-3 rounded-lg border border-gray-200 bg-white transition-all cursor-pointer gap-4 w-full shadow-sm;
}
.btn-option { 
  @apply flex items-center p-3 rounded-lg border border-gray-200 text-sm font-medium bg-white shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 text-left; 
}
.palette-btn-pulp { 
  @apply w-full px-3 py-3 text-sm text-left rounded-lg whitespace-nowrap transition-colors bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-100 flex items-center; 
}
.btn-icon { 
  @apply flex flex-col items-center justify-center p-2 rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all h-20; 
}

/* Colores SVG */
.stroke-primary { stroke: #2563EB; } 
.stroke-pink-500 { stroke: #ec4899; }
.stroke-purple-600 { stroke: #9333ea; }
.stroke-green-600 { stroke: #16a34a; }
.stroke-gray-600 { stroke: #4b5563; }
.stroke-gray-800 { stroke: #1f2937; }
.stroke-gray-500 { stroke: #6b7280; }
.stroke-red-600 { stroke: #dc2626; }
.stroke-blue-600 { stroke: #2563EB; }
.stroke-teal-600 { stroke: #0d9488; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

/* Responsividad mejorada: Modal centrado en móviles y tablets */
@media (max-width: 768px) {
  .status-selector-popup {
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 90vw !important;
    max-width: 380px !important;
    max-height: 80vh !important;
    margin: 0 !important;
  }
}
</style>