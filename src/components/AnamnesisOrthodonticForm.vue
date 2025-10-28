<script setup lang="ts">
import { ref, watch } from 'vue';
import { type OrthodonticAnamnesis, CollaborationIndex, OralHygiene, FacialType, Convexity, NasolabialAngle, MentolabialAngle, ZygomaticProjection, ChinNeckLine, ChinNeckAngle, FacialPattern, DentalTransverseRelation, CrossbiteCharacteristic, VerticalRelation } from '@/types';

const props = defineProps<{
  initialData: OrthodonticAnamnesis | null;
  loading: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

const formData = ref<Partial<OrthodonticAnamnesis>>({});

watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = { ...newData };
  } else {
    // Inicializa valores por defecto para un formulario nuevo
    formData.value = {
      previousOrthodonticTreatment: false,
      needsGeneralTreatment: false,
      labialSeal: false,
      familyWithSameMalocclusion: false,
    };
  }
}, { immediate: true, deep: true });

const handleSubmit = () => {
  emit('submit', formData.value);
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="p-6 bg-white rounded-lg shadow-md space-y-6">
      
      <fieldset class="border-b pb-6">
        <legend class="text-lg font-semibold text-text-dark">1. Análisis General</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="md:col-span-2">
            <label for="mainComplaint">Queja Principal (¿Por qué busca tratamiento?)</label>
            <input v-model="formData.mainComplaint" type="text" id="mainComplaint" class="input-style w-full mt-1">
          </div>
          <div class="md:col-span-2">
            <label for="medicalHistory">Historia Médica / Medicación de uso contínuo</label>
            <input v-model="formData.medicalHistory" type="text" id="medicalHistory" class="input-style w-full mt-1">
          </div>
          <div class="md:col-span-2">
            <label for="traumaHistory">Antecedentes de accidentes o traumas</label>
            <input v-model="formData.traumaHistory" type="text" id="traumaHistory" class="input-style w-full mt-1">
          </div>
          
          <div class="flex items-center gap-4">
            <input v-model="formData.previousOrthodonticTreatment" type="checkbox" id="previousOrtho" class="h-4 w-4 rounded text-primary focus:ring-primary">
            <label for="previousOrtho" class="font-medium text-gray-700">¿Tratamiento de ortodoncia previo?</label>
          </div>
          <div v-if="formData.previousOrthodonticTreatment">
            <label for="previousOrthoDetails">Comente cómo fue:</label>
            <input v-model="formData.previousOrthodonticTreatmentDetails" type="text" id="previousOrthoDetails" class="input-style w-full mt-1">
          </div>
          
          <div class="md:col-span-1">
            <label for="collaborationIndex">Índice de Colaboración</label>
            <select v-model="formData.collaborationIndex" id="collaborationIndex" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option :value="CollaborationIndex.HIGH">Alto</option>
              <option :value="CollaborationIndex.MEDIUM">Medio</option>
              <option :value="CollaborationIndex.LOW">Bajo</option>
            </select>
          </div>
          <div class="md:col-span-1">
            <label for="oralHygiene">Higiene Oral</label>
            <select v-model="formData.oralHygiene" id="oralHygiene" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option :value="OralHygiene.ADEQUATE">Adecuada</option>
              <option :value="OralHygiene.DEFICIENT">Deficiente</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset class="border-b pb-6">
        <legend class="text-lg font-semibold text-text-dark">2. Análisis Facial</legend>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label for="facialType">Tipo Facial</label>
            <select v-model="formData.facialType" id="facialType" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option :value="FacialType.MESOFACIAL">Mesofacial</option>
              <option :value="FacialType.DOLICOFACIAL">Dolicofacial</option>
              <option :value="FacialType.BRAQUIFACIAL">Braquifacial</option>
            </select>
          </div>
          <div>
            <label for="convexity">Convexidad</label>
            <select v-model="formData.convexity" id="convexity" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option :value="Convexity.RECTO">Recto</option>
              <option :value="Convexity.CONCAVO">Cóncavo</option>
              <option :value="Convexity.CONVEXO">Convexo</option>
            </select>
          </div>
          <div class="flex items-center gap-3 pt-6">
            <input v-model="formData.labialSeal" type="checkbox" id="labialSeal" class="h-4 w-4 rounded text-primary focus:ring-primary">
            <label for="labialSeal" class="font-medium text-gray-700">Sellado Labial</label>
          </div>

          <div>
            <label for="nasolabialAngle">Ángulo Nasolabial</label>
            <select v-model="formData.nasolabialAngle" id="nasolabialAngle" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option :value="NasolabialAngle.NORMAL">Normal</option>
              <option :value="NasolabialAngle.OPEN">Open</option>
              <option :value="NasolabialAngle.REDUCED">Reduced</option>
            </select>
          </div>

          <div>
            <label for="mentolabialAngle">Ángulo Mentolabial</label>
            <select v-model="formData.mentolabialAngle" id="mentolabialAngle" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option :value="MentolabialAngle.NORMAL">Normal</option>
              <option :value="MentolabialAngle.DEEP">Deep</option>
              <option :value="MentolabialAngle.SHALLOW">Shallow</option>
            </select>
          </div>

          <div>
            <label for="zygomaticProjection">Proyección Cigomática</label>
            <select v-model="formData.zygomaticProjection" id="zygomaticProjection" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option :value="ZygomaticProjection.NORMAL">Normal</option>
              <option :value="ZygomaticProjection.INCREASED">Aumentada</option>
              <option :value="ZygomaticProjection.DEFICIENT">Deficiente</option>
            </select>
          </div>

          <div>
            <label for="chinNeckLine">Línea Mentón-Cuello</label>
            <select v-model="formData.chinNeckLine" id="chinNeckLine" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option :value="ChinNeckLine.NORMAL">Normal</option>
              <option :value="ChinNeckLine.INCREASED">Aumentada</option>
              <option :value="ChinNeckLine.DECREASED">Disminuida</option>
            </select>
          </div>

          <div>
            <label for="chinNeckAngle">Ángulo Mentón-Cuello</label>
            <select v-model="formData.chinNeckAngle" id="chinNeckAngle" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option :value="ChinNeckAngle.NORMAL">Normal</option>
              <option :value="ChinNeckAngle.OPEN">Open</option>
              <option :value="ChinNeckAngle.CLOSED">Closed</option>
            </select>
          </div>

          <div class="md:col-span-3">
            <label for="proportionThirds">Proporción Tercios Faciales</label>
            <input v-model="formData.proportionThirds" type="text" id="proportionThirds" class="input-style w-full mt-1" placeholder="Ej: Aumentado, Disminuido, Normal">
          </div>

          <div class="md:col-span-3">
            <label for="facialPattern">Patrón Facial</label>
            <select v-model="formData.facialPattern" id="facialPattern" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option :value="FacialPattern.PATTERN_1">Pattern 1</option>
              <option :value="FacialPattern.PATTERN_2">Pattern 2</option>
              <option :value="FacialPattern.PATTERN_3">Pattern 3</option>
              <option :value="FacialPattern.MANDIBULAR_RETRUSION">Retrusión Mandibular</option>
              <option :value="FacialPattern.MAXILLARY_PROTRUSION">Protrusión Maxilar</option>
              <option :value="FacialPattern.SHORT_FACE">Cara Corta</option>
              <option :value="FacialPattern.LONG_FACE">Cara Larga</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend class="text-lg font-semibold text-text-dark">3. Análisis Oclusal</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label for="canineRelationRight">Relación Canina (Derecha)</label>
            <input v-model="formData.canineRelationRight" type="text" id="canineRelationRight" class="input-style w-full mt-1" placeholder="Ej: Clase I, 1/2 Clase II...">
          </div>
          <div>
            <label for="canineRelationLeft">Relación Canina (Izquierda)</label>
            <input v-model="formData.canineRelationLeft" type="text" id="canineRelationLeft" class="input-style w-full mt-1" placeholder="Ej: Clase I...">
          </div>
          <div>
            <label for="molarRelationRight">Relación Molar (Derecha)</label>
            <input v-model="formData.molarRelationRight" type="text" id="molarRelationRight" class="input-style w-full mt-1" placeholder="Ej: Clase I, Clase III...">
          </div>
          <div>
            <label for="molarRelationLeft">Relación Molar (Izquierda)</label>
            <input v-model="formData.molarRelationLeft" type="text" id="molarRelationLeft" class="input-style w-full mt-1" placeholder="Ej: Clase I...">
          </div>

          <div class="md:col-span-2">
            <label for="occlusionOnManipulation">Oclusión (al manipular)</label>
            <textarea v-model="formData.occlusionOnManipulation" id="occlusionOnManipulation" rows="2" class="input-style w-full mt-1" placeholder="Descripción"></textarea>
          </div>

          <div>
            <label for="dentalTransverseRelation">Relación Transversa</label>
            <select v-model="formData.dentalTransverseRelation" id="dentalTransverseRelation" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option :value="DentalTransverseRelation.BRODIE">Brodie</option>
              <option :value="DentalTransverseRelation.NORMAL">Normal</option>
              <option :value="DentalTransverseRelation.BILATERAL_POSTERIOR_CROSSBITE">Crossbite Posterior Bilateral</option>
              <option :value="DentalTransverseRelation.UNILATERAL_POSTERIOR_CROSSBITE_RIGHT">Crossbite Derecho</option>
              <option :value="DentalTransverseRelation.UNILATERAL_POSTERIOR_CROSSBITE_LEFT">Crossbite Izquierdo</option>
            </select>
          </div>

          <div>
            <label for="crossbiteCharacteristic">Característica Crossbite</label>
            <select v-model="formData.crossbiteCharacteristic" id="crossbiteCharacteristic" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option :value="CrossbiteCharacteristic.SKELETAL">Skeletal</option>
              <option :value="CrossbiteCharacteristic.DENTO_ALVEOLAR">Dento-alveolar</option>
              <option :value="CrossbiteCharacteristic.NONE">Ninguno</option>
            </select>
          </div>

          <div>
            <label for="verticalRelation">Relación Vertical</label>
            <select v-model="formData.verticalRelation" id="verticalRelation" class="input-style w-full mt-1">
              <option :value="undefined">Seleccione...</option>
              <option :value="VerticalRelation.NORMAL">Normal</option>
              <option :value="VerticalRelation.EDGE_TO_EDGE">Edge to edge</option>
              <option :value="VerticalRelation.DEEP_BITE">Deep bite</option>
              <option :value="VerticalRelation.OPEN_BITE">Open bite</option>
            </select>
          </div>

          <div>
            <label for="speeCurve">Curva de Spee</label>
            <input v-model="formData.speeCurve" id="speeCurve" type="text" class="input-style w-full mt-1" />
          </div>

          <div>
            <label for="incisorSagittalRelation">Relación Sagital Incisiva</label>
            <input v-model="formData.incisorSagittalRelation" id="incisorSagittalRelation" type="text" class="input-style w-full mt-1" />
          </div>

          <div>
            <label for="centricRelation">Relación céntrica</label>
            <input v-model="formData.centricRelation" id="centricRelation" type="text" class="input-style w-full mt-1" />
          </div>

          <div>
            <label for="midline">Midline</label>
            <input v-model="formData.midline" id="midline" type="text" class="input-style w-full mt-1" />
          </div>

          <div class="md:col-span-2">
            <label for="dentalAnomalies">Anomalías Dentales</label>
            <textarea v-model="formData.dentalAnomalies" id="dentalAnomalies" rows="2" class="input-style w-full mt-1"></textarea>
          </div>

          <div class="md:col-span-2">
            <label for="tmjCondition">Condición ATM</label>
            <textarea v-model="formData.tmjCondition" id="tmjCondition" rows="2" class="input-style w-full mt-1"></textarea>
          </div>
        </div>
      </fieldset>

      <fieldset class="border-t pt-6">
        <legend class="text-lg font-semibold text-text-dark">4. Anamnesis Familiar / Cefalométrico / Diagnósticos</legend>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="flex items-center gap-4">
            <input v-model="formData.familyWithSameMalocclusion" type="checkbox" id="familyWithSameMalocclusion" class="h-4 w-4 rounded text-primary" />
            <label for="familyWithSameMalocclusion" class="font-medium text-gray-700">Familiares con misma maloclusión</label>
          </div>
          <div>
            <label for="familyMemberDetail">Detalle Familiar</label>
            <input v-model="formData.familyMemberDetail" id="familyMemberDetail" type="text" class="input-style w-full mt-1" />
          </div>

          <div class="md:col-span-2">
            <label for="cephalometricAnalysis">Análisis Cefalométrico</label>
            <textarea v-model="formData.cephalometricAnalysis" id="cephalometricAnalysis" rows="3" class="input-style w-full mt-1"></textarea>
          </div>

          <div class="md:col-span-2">
            <label for="functionalDiagnoses">Diagnósticos Funcionales</label>
            <textarea v-model="formData.functionalDiagnoses" id="functionalDiagnoses" rows="3" class="input-style w-full mt-1"></textarea>
          </div>

          <div class="md:col-span-2">
            <label for="needsGeneralTreatment">Necesita tratamiento general?</label>
            <div class="flex items-center gap-4 mt-2">
              <input id="needsGeneralTreatment" type="checkbox" v-model="formData.needsGeneralTreatment" class="h-4 w-4 rounded text-primary" />
              <input v-model="formData.needsGeneralTreatmentDetails" type="text" placeholder="Detalles (si aplica)" class="input-style flex-1" />
            </div>
          </div>
        </div>
      </fieldset>

      </div>
    
    <div class="flex justify-end mt-6">
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
.input-style { @apply border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-primary focus:border-primary; }
.btn-primary { @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 font-semibold disabled:opacity-50; }
.btn-secondary { @apply px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300 font-semibold; }
</style>