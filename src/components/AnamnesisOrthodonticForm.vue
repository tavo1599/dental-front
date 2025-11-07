<script setup lang="ts">
import { ref, watch } from 'vue';
// Importa el tipo principal desde tu archivo /src/types/index.ts
import type { OrthodonticAnamnesis } from '@/types'; 

const props = defineProps<{
  initialData: OrthodonticAnamnesis | null;
  loading: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

// --- Estado de Pestañas ---
type TabName = 'general' | 'facial' | 'oclusal' | 'funcional' | 'diagnostico';
const currentTab = ref<TabName>('general');
const tabs: { key: TabName, label: string }[] = [
  { key: 'general', label: '1. Análisis General' },
  { key: 'facial', label: '2. Análisis Facial' },
  { key: 'oclusal', label: '3. Análisis Oclusal' },
  { key: 'funcional', label: '4. Análisis Funcional' },
  { key: 'diagnostico', label: '5. Diagnóstico y Plan' },
];

// --- Lógica del Formulario Anidado ---

// 1. La función ahora devuelve un tipo 'Partial' (parcial)
//    y NO debe incluir 'id'.
const createDefaultFormData = (): Partial<OrthodonticAnamnesis> => ({
  // ¡LA LÍNEA 'id: ""' SE HA ELIMINADO!
  // Esto asegura que TypeORM haga un INSERT (crear) en lugar de un UPDATE.
  generalAnalysis: {
    mainComplaint: null,
    medicalHistory: null,
    traumaHistory: null,
    previousTreatment: { hasPrevious: false, comments: null },
    collaborationIndex: null,
    oralHygiene: null,
    needsGeneralTreatment: null,
  },
  facialAnalysis: {
    facialType: null,
    convexity: null,
    facialThirds: {
      proportional: true, upperAugmented: false, middleAugmented: false, lowerAugmented: false,
      upperDiminished: false, middleDiminished: false, lowerDiminished: false,
    },
    lipSeal: true,
    restSymmetry: { isSymmetric: true, deviation: null },
    openingSymmetry: { isSymmetric: true, deviation: null },
    nasolabialAngle: null,
    mentolabialAngle: null,
    zygomaticProjection: null,
    chinNeckLine: null,
    chinNeckAngle: null,
    facialPattern: { pattern: null, details: [] },
  },
  occlusalAnalysis: {
    manipulation: null,
    transversal: { relation: null, crossbiteFeatures: null },
    vertical: { relation: null, amount: null },
    speeCurve: { isAltered: false, details: [] }, // 'details' es un array
    sagittalIncisors: null,
    mihCanineRelation: { right: null, left: null },
    mihMolarRelation: { right: null, left: null },
    rcCanineRelation: { right: null, left: null },
    rcMolarRelation: { right: null, left: null },
    midline: { coincident: true, upperDeviation: null, lowerDeviation: null },
    dentalAnomalies: null,
    atmCondition: null,
    familyMalocclusion: null,
  },
  functionalAnalysis: {
    respirationType: null,
  },
  cephalometricAnalysis: null,
  diagnosis: null,
  treatmentPlan: null,
});

// 2. El 'ref' ahora usa el tipo 'Partial'
const formData = ref<Partial<OrthodonticAnamnesis>>(createDefaultFormData());

// 3. El 'watch' se ajusta
watch(() => props.initialData, (newData) => {
  if (newData) {
    // Si estamos editando (newData existe), SÍ tendremos un ID.
    formData.value = {
      ...createDefaultFormData(), // Carga la plantilla base (sin id)
      ...newData, // Sobrescribe con los datos reales (CON id)
      // Fusiona los objetos anidados
      generalAnalysis: { ...createDefaultFormData().generalAnalysis, ...newData.generalAnalysis },
      facialAnalysis: { ...createDefaultFormData().facialAnalysis, ...newData.facialAnalysis },
      occlusalAnalysis: { ...createDefaultFormData().occlusalAnalysis, ...newData.occlusalAnalysis },
      functionalAnalysis: { ...createDefaultFormData().functionalAnalysis, ...newData.functionalAnalysis },
    };
  } else {
    // Si estamos creando (newData es null), usamos la plantilla (sin id).
    formData.value = createDefaultFormData();
  }
}, { immediate: true, deep: true }); 

const handleSubmit = () => {
  emit('submit', formData.value);
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click.prevent="currentTab = tab.key"
          type="button"
          :class="[
            tab.key === currentTab
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none'
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <div class="p-1">
      
      <div v-if="currentTab === 'general' && formData.generalAnalysis">
        <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <legend class="sr-only">Análisis General</legend>
          
          <div class="md:col-span-2">
            <label for="mainComplaint">Queja Principal (¿Por qué busca tratamiento?)</label>
            <input v-model="formData.generalAnalysis.mainComplaint" type="text" id="mainComplaint" class="input-style w-full mt-1">
          </div>
          <div class="md:col-span-2">
            <label for="medicalHistory">Historia Médica / Medicación de uso contínuo</label>
            <input v-model="formData.generalAnalysis.medicalHistory" type="text" id="medicalHistory" class="input-style w-full mt-1">
          </div>
          <div class="md:col-span-2">
            <label for="traumaHistory">Antecedentes de accidentes o traumas</label>
            <input v-model="formData.generalAnalysis.traumaHistory" type="text" id="traumaHistory" class="input-style w-full mt-1">
          </div>
          
          <div class="flex items-center gap-4 md:col-span-2">
            <input v-model="formData.generalAnalysis.previousTreatment.hasPrevious" type="checkbox" id="previousOrtho" class="checkbox-style">
            <label for="previousOrtho">¿Tratamiento de ortodoncia previo?</label>
          </div>
          <div v-if="formData.generalAnalysis.previousTreatment.hasPrevious" class="md:col-span-2">
            <label for="previousOrthoDetails">Comente cómo fue:</label>
            <input v-model="formData.generalAnalysis.previousTreatment.comments" type="text" id="previousOrthoDetails" class="input-style w-full mt-1">
          </div>

          <div class="md:col-span-1">
            <label for="collaborationIndex">Índice de Colaboración</label>
            <select v-model="formData.generalAnalysis.collaborationIndex" id="collaborationIndex" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="alto">Alto</option>
              <option value="medio">Medio</option>
              <option value="bajo">Bajo</option>
            </select>
          </div>
          <div class="md:col-span-1">
            <label for="oralHygiene">Higiene Oral</label>
            <select v-model="formData.generalAnalysis.oralHygiene" id="oralHygiene" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="adecuada">Adecuada</option>
              <option value="deficiente">Deficiente</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label for="needsGeneralTreatment">Necesita tratamiento general (caries, endodoncia, etc.)</label>
            <input v-model="formData.generalAnalysis.needsGeneralTreatment" type="text" id="needsGeneralTreatment" class="input-style w-full mt-1">
          </div>
        </fieldset>
      </div>

      <div v-if="currentTab === 'facial' && formData.facialAnalysis">
        <fieldset class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <legend class="sr-only">Análisis Facial</legend>
          
          <div>
            <label for="facialType">Tipo Facial</label>
            <select v-model="formData.facialAnalysis.facialType" id="facialType" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="mesofacial">Mesofacial</option>
              <option value="dolicofacial">Dolicofacial</option>
              <option value="braquifacial">Braquifacial</option>
            </select>
          </div>
          <div>
            <label for="convexity">Convexidad</label>
            <select v-model="formData.facialAnalysis.convexity" id="convexity" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="recto">Recto</option>
              <option value="concavo">Cóncavo</option>
              <option value="convexo">Convexo</option>
            </select>
          </div>
          <div class="flex items-center gap-3 pt-6">
            <input v-model="formData.facialAnalysis.lipSeal" type="checkbox" id="labialSeal" class="checkbox-style">
            <label for="labialSeal">Presenta Sellado Labial</label>
          </div>

          <div>
            <label for="nasolabialAngle">Ángulo Nasolabial</label>
            <select v-model="formData.facialAnalysis.nasolabialAngle" id="nasolabialAngle" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="normal">Normal</option>
              <option value="abierto">Abierto</option>
              <option value="disminuido">Disminuido</option>
            </select>
          </div>
          <div>
            <label for="mentolabialAngle">Ángulo Mentolabial</label>
            <select v-model="formData.facialAnalysis.mentolabialAngle" id="mentolabialAngle" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="normal">Normal</option>
              <option value="profundo">Profundo</option>
              <option value="poco profundo">Poco profundo</option>
            </select>
          </div>
          <div>
            <label for="zygomaticProjection">Proyección Cigomática</label>
            <select v-model="formData.facialAnalysis.zygomaticProjection" id="zygomaticProjection" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="normal">Normal</option>
              <option value="aumentada">Aumentada</option>
              <option value="deficiente">Deficiente</option>
            </select>
          </div>
          <div>
            <label for="chinNeckLine">Línea Mentón-Cuello</label>
            <select v-model="formData.facialAnalysis.chinNeckLine" id="chinNeckLine" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="normal">Normal</option>
              <option value="aumentada">Aumentada</option>
              <option value="disminuida">Disminuida</option>
            </select>
          </div>
          <div>
            <label for="chinNeckAngle">Ángulo Mentón-Cuello</label>
            <select v-model="formData.facialAnalysis.chinNeckAngle" id="chinNeckAngle" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="normal">Normal</option>
              <option value="abierto">Abierto</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>
          
          <div class="border rounded-md p-3 md:col-span-3">
            <span class="font-medium text-gray-700">Proporción Tercios Faciales</span>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <div class="flex items-center gap-2">
                <input v-model="formData.facialAnalysis.facialThirds.proportional" type="checkbox" id="thirds-prop" class="checkbox-style">
                <label for="thirds-prop">Proporcional</label>
              </div>
              <div class="flex items-center gap-2">
                <input v-model="formData.facialAnalysis.facialThirds.lowerAugmented" type="checkbox" id="thirds-lower-aug" class="checkbox-style">
                <label for="thirds-lower-aug">Inferior Aumentado</label>
              </div>
              <div class="flex items-center gap-2">
                <input v-model="formData.facialAnalysis.facialThirds.middleAugmented" type="checkbox" id="thirds-mid-aug" class="checkbox-style">
                <label for="thirds-mid-aug">Medio Aumentado</label>
              </div>
              <div class="flex items-center gap-2">
                <input v-model="formData.facialAnalysis.facialThirds.lowerDiminished" type="checkbox" id="thirds-lower-dim" class="checkbox-style">
                <label for="thirds-lower-dim">Inferior Disminuido</label>
              </div>
            </div>
          </div>

          <div class="border rounded-md p-3 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>Simetría Facial (Reposo)</label>
              <div class="flex gap-4 mt-2">
                <div class="flex items-center gap-2">
                  <input v-model="formData.facialAnalysis.restSymmetry.isSymmetric" :value="true" type="radio" id="rest-sym-yes" name="restSymmetry" class="radio-style">
                  <label for="rest-sym-yes">Presenta</label>
                </div>
                <div class="flex items-center gap-2">
                  <input v-model="formData.facialAnalysis.restSymmetry.isSymmetric" :value="false" type="radio" id="rest-sym-no" name="restSymmetry" class="radio-style">
                  <label for="rest-sym-no">No Presenta</label>
                </div>
              </div>
              <select v-if="!formData.facialAnalysis.restSymmetry.isSymmetric" v-model="formData.facialAnalysis.restSymmetry.deviation" class="input-style w-full mt-2">
                <option :value="null">Desviación...</option>
                <option value="derecha">Hacia la derecha</option>
                <option value="izquierda">Hacia la izquierda</option>
              </select>
            </div>
            <div>
              <label>Simetría Facial (Apertura)</label>
              <div class="flex gap-4 mt-2">
                <div class="flex items-center gap-2">
                  <input v-model="formData.facialAnalysis.openingSymmetry.isSymmetric" :value="true" type="radio" id="open-sym-yes" name="openSymmetry" class="radio-style">
                  <label for="open-sym-yes">Presenta</label>
                </div>
                <div class="flex items-center gap-2">
                  <input v-model="formData.facialAnalysis.openingSymmetry.isSymmetric" :value="false" type="radio" id="open-sym-no" name="openSymmetry" class="radio-style">
                  <label for="open-sym-no">No Presenta</label>
                </div>
              </div>
              <select v-if="!formData.facialAnalysis.openingSymmetry.isSymmetric" v-model="formData.facialAnalysis.openingSymmetry.deviation" class="input-style w-full mt-2">
                <option :value="null">Desviación...</option>
                <option value="derecha">Hacia la derecha</option>
                <option value="izquierda">Hacia la izquierda</option>
              </select>
            </div>
          </div>
          
        </fieldset>
      </div>

      <div v-if="currentTab === 'oclusal' && formData.occlusalAnalysis">
        
        <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <legend class="text-lg font-semibold text-text-dark col-span-full mb-2">Relación Sagital (MIH)</legend>
          
          <div>
            <label for="mihCanineRight">Relación Canina (Derecha)</label>
            <select v-model="formData.occlusalAnalysis.mihCanineRelation.right" id="mihCanineRight" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="claseI">Clase I</option>
              <option value="claseII">Clase II</option>
              <option value="mediaClaseII">1/2 Clase II</option>
              <option value="tresCuartosClaseII">3/4 Clase II</option>
              <option value="completaClaseII">Clase II Completa</option>
              <option value="claseIII">Clase III</option>
              <option value="mediaClaseIII">1/2 Clase III</option>
              <option value="tresCuartosClaseIII">3/4 Clase III</option>
              <option value="completaClaseIII">Clase III Completa</option>
            </select>
          </div>
          <div>
            <label for="mihCanineLeft">Relación Canina (Izquierda)</label>
            <select v-model="formData.occlusalAnalysis.mihCanineRelation.left" id="mihCanineLeft" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="claseI">Clase I</option>
              <option value="claseII">Clase II</option>
              <option value="mediaClaseII">1/2 Clase II</option>
              <option value="tresCuartosClaseII">3/4 Clase II</option>
              <option value="completaClaseII">Clase II Completa</option>
              <option value="claseIII">Clase III</option>
              <option value="mediaClaseIII">1/2 Clase III</option>
              <option value="tresCuartosClaseIII">3/4 Clase III</option>
              <option value="completaClaseIII">Clase III Completa</option>
            </select>
          </div>
          <div>
            <label for="mihMolarRight">Relación Molar (Derecha)</label>
            <select v-model="formData.occlusalAnalysis.mihMolarRelation.right" id="mihMolarRight" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="claseI">Clase I</option>
              <option value="claseII">Clase II</option>
              <option value="mediaClaseII">1/2 Clase II</option>
              <option value="tresCuartosClaseII">3/4 Clase II</option>
              <option value="completaClaseII">Clase II Completa</option>
              <option value="claseIII">Clase III</option>
              <option value="mediaClaseIII">1/2 Clase III</option>
              <option value="tresCuartosClaseIII">3/4 Clase III</option>
              <option value="completaClaseIII">Clase III Completa</option>
            </select>
          </div>
          <div>
            <label for="mihMolarLeft">Relación Molar (Izquierda)</label>
            <select v-model="formData.occlusalAnalysis.mihMolarRelation.left" id="mihMolarLeft" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="claseI">Clase I</option>
              <option value="claseII">Clase II</option>
              <option value="mediaClaseII">1/2 Clase II</option>
              <option value="tresCuartosClaseII">3/4 Clase II</option>
              <option value="completaClaseII">Clase II Completa</option>
              <option value="claseIII">Clase III</option>
              <option value="mediaClaseIII">1/2 Clase III</option>
              <option value="tresCuartosClaseIII">3/4 Clase III</option>
              <option value="completaClaseIII">Clase III Completa</option>
            </select>
          </div>
        </fieldset>

        <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <legend class="text-lg font-semibold text-text-dark col-span-full mb-2">Relación Transversal y Vertical</legend>

          <div>
            <label for="transversalRelation">Relación Transversal</label>
            <select v-model="formData.occlusalAnalysis.transversal.relation" id="transversalRelation" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="normal">Normal</option>
              <option value="brodie">Brodie</option>
              <option value="cruzada_unilateral">Mordida Cruzada Unilateral</option>
              <option value="cruzada_bilateral">Mordida Cruzada Bilateral</option>
            </select>
          </div>
          <div>
            <label for="crossbiteFeatures">Caract. Mordida Cruzada</label>
            <select v-model="formData.occlusalAnalysis.transversal.crossbiteFeatures" id="crossbiteFeatures" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="no_presenta">No Presenta</option>
              <option value="esqueletal">Esqueletal</option>
              <option value="dentoalveolar">Dento-alveolar</option>
            </select>
          </div>

          <div>
            <label for="verticalRelation">Relación Vertical</label>
            <select v-model="formData.occlusalAnalysis.vertical.relation" id="verticalRelation" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="normal">Normal</option>
              <option value="bis_a_bis">Bis a Bis / Borde a Borde</option>
              <option value="mordida_profunda">Mordida Profunda</option>
              <option value="mordida_abierta">Mordida Abierta</option>
            </select>
          </div>
          <div>
            <label for="verticalAmount">Detalle Vertical (mm o piezas)</label>
            <input v-model="formData.occlusalAnalysis.vertical.amount" type="text" id="verticalAmount" class="input-style w-full mt-1">
          </div>
          
          <div>
            <label for="sagittalIncisors">Relación Sagital Incisivos</label>
            <select v-model="formData.occlusalAnalysis.sagittalIncisors" id="sagittalIncisors" class="input-style w-full mt-1">
              <option :value="null">Seleccione...</option>
              <option value="normal">Normal</option>
              <option value="overjet_aumentado">Overjet Aumentado</option>
              <option value="mordida_cruzada_anterior">Mordida Cruzada Anterior</option>
            </select>
          </div>
          
          <div class="border rounded-md p-3 md:col-span-1">
            <label class="font-medium text-gray-700">Curva de Spee</label>
            <div class="flex gap-4 mt-2">
                <div class="flex items-center gap-2">
                    <input v-model="formData.occlusalAnalysis.speeCurve.isAltered" :value="false" type="radio" id="spee-normal" name="speeCurveAltered" class="radio-style">
                    <label for="spee-normal">Normal</label>
                </div>
                <div class="flex items-center gap-2">
                    <input v-model="formData.occlusalAnalysis.speeCurve.isAltered" :value="true" type="radio" id="spee-alterada" name="speeCurveAltered" class="radio-style">
                    <label for="spee-alterada">Alterada</label>
                </div>
            </div>
            
            <div v-if="formData.occlusalAnalysis.speeCurve.isAltered" class="space-y-2 mt-3 pl-6">
                <div class="flex items-center gap-2">
                    <input v-model="formData.occlusalAnalysis.speeCurve.details" value="extrusion_incisivos_inf" type="checkbox" id="spee-det-1" class="checkbox-style">
                    <label for="spee-det-1" class="text-sm">Por extrusión de incisivos inferiores</label>
                </div>
                <div class="flex items-center gap-2">
                    <input v-model="formData.occlusalAnalysis.speeCurve.details" value="extrusion_incisivos_sup" type="checkbox" id="spee-det-2" class="checkbox-style">
                    <label for="spee-det-2" class="text-sm">Por extrusión de incisivos superiores</label>
                </div>
                 <div class="flex items-center gap-2">
                    <input v-model="formData.occlusalAnalysis.speeCurve.details" value="intrusion_incisivos" type="checkbox" id="spee-det-3" class="checkbox-style">
                    <label for="spee-det-3" class="text-sm">Por intrusión de incisivos</label>
                </div>
                <div class="flex items-center gap-2">
                    <input v-model="formData.occlusalAnalysis.speeCurve.details" value="molares_extruidos" type="checkbox" id="spee-det-4" class="checkbox-style">
                    <label for="spee-det-4" class="text-sm">Por molares extruidos</label>
                </div>
                 <div class="flex items-center gap-2">
                    <input v-model="formData.occlusalAnalysis.speeCurve.details" value="molares_intruidos" type="checkbox" id="spee-det-5" class="checkbox-style">
                    <label for="spee-det-5" class="text-sm">Por molares intruidos</label>
                </div>
            </div>
          </div>
          </fieldset>

        <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <legend class="text-lg font-semibold text-text-dark col-span-full mb-2">Otros Análisis Oclusales</legend>
          <div>
            <label for="atmCondition">Condición de la ATM</label>
            <input v-model="formData.occlusalAnalysis.atmCondition" type="text" id="atmCondition" class="input-style w-full mt-1">
          </div>
          <div>
            <label for="familyMalocclusion">Familiar con misma maloclusión</label>
            <input v-model="formData.occlusalAnalysis.familyMalocclusion" type="text" id="familyMalocclusion" class="input-style w-full mt-1" placeholder="Ej: Sí, padre (Clase III)">
          </div>
          <div class="md:col-span-2">
            <label for="dentalAnomalies">Anomalías Dentarias (forma/color/número)</label>
            <textarea v-model="formData.occlusalAnalysis.dentalAnomalies" id="dentalAnomalies" rows="2" class="input-style w-full mt-1"></textarea>
          </div>
        </fieldset>
      </div>

      <div v-if="currentTab === 'funcional' && formData.functionalAnalysis">
        <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <legend class="sr-only">Análisis Funcional</legend>
          <div class="md:col-span-2">
            <label for="respirationType">Tipo de Respiración</label>
            <input v-model="formData.functionalAnalysis.respirationType" type="text" id="respirationType" class="input-style w-full mt-1" placeholder="Ej: Oral, Nasal, Mixta">
          </div>
        </fieldset>
      </div>

      <div v-if="currentTab === 'diagnostico'">
        <fieldset class="grid grid-cols-1 gap-4">
          <legend class="sr-only">Diagnóstico y Plan de Tratamiento</legend>
          
          <div>
            <label for="cephalometricAnalysis">Análisis Cefalométrico (Resumen)</label>
            <textarea v-model="formData.cephalometricAnalysis" id="cephalometricAnalysis" rows="4" class="input-style w-full mt-1"></textarea>
          </div>
          <div>
            <label for="diagnosis">Diagnóstico</label>
            <textarea v-model="formData.diagnosis" id="diagnosis" rows="4" class="input-style w-full mt-1" placeholder="Esqueletal: ...&#10;Dental: ...&#10;Funcional: ..."></textarea>
          </div>
          <div>
            <label for="treatmentPlan">Plan de Tratamiento</label>
            <textarea v-model="formData.treatmentPlan" id="treatmentPlan" rows="4" class="input-style w-full mt-1"></textarea>
          </div>
        </fieldset>
      </div>

    </div>

    <div class="flex justify-end gap-4 border-t pt-6">
      <button @click="emit('cancel')" type="button" class="btn-secondary">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Guardar Anamnesis de Ortodoncia' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
label {
  @apply block text-sm font-medium text-gray-700;
}
.input-style { 
  @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; 
}
.checkbox-style {
  @apply h-4 w-4 rounded text-primary focus:ring-primary border-gray-300;
}
.radio-style {
  @apply h-4 w-4 text-primary focus:ring-primary border-gray-300;
}
.btn-primary { 
  @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold disabled:opacity-50; 
}
.btn-secondary { 
  @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; 
}
</style>