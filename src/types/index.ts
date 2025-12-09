// ===================================================================
// ENUMS (Definiciones de Opciones)
// ===================================================================

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum ToothStatus {
  // Estados de Superficie
  HEALTHY = 'healthy',
  CARIES = 'caries',
  FILLED = 'filled',
  FILLED_DEFECTIVE = 'filled_defective',
  SEALANT = 'sealant',
  SEALANT_DEFECTIVE = 'sealant_defective',
  FRACTURE = 'fracture',
  DISCHROMIA = 'dischromia',

  // Estados de Diente Completo
  CROWN = 'crown',
  CROWN_DEFECTIVE = 'crown_defective',
  TEMPORARY_CROWN = 'temporary_crown',
  ENDODONTICS = 'endodontics',
  IMPLANT = 'implant',
  PONTIC = 'pontic',
  EXTRACTION_NEEDED = 'extraction_needed',
  EXTRACTED = 'extracted',
  SUPERNUMERARY = 'supernumerary',
}

export interface Tooth {
  id: string;
  toothNumber: number;
  status: ToothStatus;
}

export enum PaymentMethod {
  CASH = 'cash',
  YAPE = 'yape',
  CARD = 'card',
  TRANSFER = 'transfer',
  OTHER = 'other',
}

export enum ExpenseCategory {
  SALARIES = 'salarios',
  SUPPLIES = 'insumos',
  RENT = 'alquiler',
  UTILITIES = 'servicios_publicos',
  MARKETING = 'marketing',
  OTHER = 'otros',
}


// ===================================================================
// INTERFACES (Estructuras de Datos)
// ===================================================================

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  tenant?: Tenant;
}

export interface Tenant {
  id: string;
  name: string;
  schema: string;
  status: TenantStatus;
  nextPaymentDate: string | null;
  users: User[];
  patientCount?: number;
  createdAt: string;
  googleAccessToken: string | null;
  googleRefreshToken: string | null;
  googleCalendarId: string | null;
  plan: string;
  maxUsers: number;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface Patient {
  id: string;
  fullName: string;
  dni: string;
  phone: string;
  birthDate: string;
  email?: string;
  address?: string;
  department?: string;
  province?: string;
  district?: string;
  gender?: Gender;
  medicalHistory: MedicalHistory | null;
  odontopediatricHistory: OdontopediatricHistory | null;
  orthodonticHistory: OrthodonticAnamnesis | null;
  category?: string;
  fileCode?: string;
}

export interface MedicalHistory {
  id: string;
  mainComplaint: string;
  illnessHistory: string;
  biologicalFunctions: string;
  familyHistory: string;
  personalHistory: string;
  currentMedications: string;
  allergies: string;
  anesthesiaReaction: string;
  hasBleedingIssues: boolean;
  isPregnant: boolean | null;
  isLactating: boolean | null;
  medicalChecklist: Record<string, boolean>;
  medicalChecklistDetails: Record<string, string>;
  lastDentalVisit: Date | null;
  brushingFrequency: number;
  usesFloss: boolean;
  bruxism: boolean;
  oralDiscomfort: string;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
}

export enum CollaborationIndex {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}
export enum OralHygiene {
  ADEQUATE = 'adequate',
  DEFICIENT = 'deficient',
}
export enum FacialType {
  MESOFACIAL = 'mesofacial',
  DOLICOFACIAL = 'dolicofacial',
  BRAQUIFACIAL = 'braquifacial',
}
export enum Convexity {
  RECTO = 'recto',
  CONCAVO = 'concavo',
  CONVEXO = 'convexo',
}
export enum NasolabialAngle {
  NORMAL = 'normal',
  OPEN = 'open',
  REDUCED = 'reduced',
}
export enum MentolabialAngle {
  NORMAL = 'normal',
  DEEP = 'deep',
  SHALLOW = 'shallow',
}
export enum ZygomaticProjection {
  NORMAL = 'normal',
  INCREASED = 'increased',
  DEFICIENT = 'deficient',
}
export enum ChinNeckLine {
  NORMAL = 'normal',
  INCREASED = 'increased',
  DECREASED = 'decreased',
}
export enum ChinNeckAngle {
  NORMAL = 'normal',
  OPEN = 'open',
  CLOSED = 'closed',
}
export enum FacialPattern {
  PATTERN_1 = 'pattern_1',
  PATTERN_2 = 'pattern_2',
  PATTERN_3 = 'pattern_3',
  MANDIBULAR_RETRUSION = 'mandibular_retrusion',
  MAXILLARY_PROTRUSION = 'maxillary_protrusion',
  SHORT_FACE = 'short_face',
  LONG_FACE = 'long_face',
}
export enum DentalTransverseRelation {
  BRODIE = 'brodie',
  NORMAL = 'normal',
  BILATERAL_POSTERIOR_CROSSBITE = 'bilateral_posterior_crossbite',
  UNILATERAL_POSTERIOR_CROSSBITE_RIGHT = 'unilateral_posterior_crossbite_right',
  UNILATERAL_POSTERIOR_CROSSBITE_LEFT = 'unilateral_posterior_crossbite_left',
}
export enum CrossbiteCharacteristic {
  SKELETAL = 'skeletal',
  DENTO_ALVEOLAR = 'dento_alveolar',
  NONE = 'none',
}
export enum VerticalRelation {
  NORMAL = 'normal',
  EDGE_TO_EDGE = 'edge_to_edge',
  DEEP_BITE = 'deep_bite',
  OPEN_BITE = 'open_bite',
}

// --- AÑADE ESTA INTERFACE ---
export interface IOrthoGeneralAnalysis {
  mainComplaint: string | null;
  medicalHistory: string | null;
  traumaHistory: string | null;
  previousTreatment: {
    hasPrevious: boolean | null;
    comments: string | null;
  };
  collaborationIndex: 'alto' | 'medio' | 'bajo' | null;
  oralHygiene: 'adecuada' | 'deficiente' | null;
  needsGeneralTreatment: string | null;
}

// PDF Sección 2: ANÁLISIS FACIAL
export interface IOrthoFacialAnalysis {
  facialType: 'mesofacial' | 'dolicofacial' | 'braquifacial' | null;
  convexity: 'recto' | 'concavo' | 'convexo' | null;
  facialThirds: {
    proportional: boolean | null;
    upperAugmented: boolean | null;
    middleAugmented: boolean | null;
    lowerAugmented: boolean | null;
    upperDiminished: boolean | null;
    middleDiminished: boolean | null;
    lowerDiminished: boolean | null;
  };
  lipSeal: boolean | null;
  restSymmetry: {
    isSymmetric: boolean | null;
    deviation: 'derecha' | 'izquierda' | null;
  };
  openingSymmetry: {
    isSymmetric: boolean | null;
    deviation: 'derecha' | 'izquierda' | null;
  };
  nasolabialAngle: 'normal' | 'abierto' | 'disminuido' | null;
  mentolabialAngle: 'normal' | 'profundo' | 'poco profundo' | null;
  zygomaticProjection: 'normal' | 'aumentada' | 'deficiente' | null;
  chinNeckLine: 'normal' | 'aumentada' | 'disminuida' | null;
  chinNeckAngle: 'normal' | 'abierto' | 'cerrado' | null;
  facialPattern: {
    pattern: 'I' | 'II' | 'III' | 'cara corta' | 'cara larga' | null;
    details: string[]; // ej: ['protrusion_maxilar', 'retrusion_mandibular']
  };
}

// Tipo para relaciones Caninas/Molares
type SagittalRelation = 'claseI' | 'claseII' | 'claseIII' | 'mediaClaseII' | 'tresCuartosClaseII' | 'completaClaseII' | 'mediaClaseIII' | 'tresCuartosClaseIII' | 'completaClaseIII' | null;

// PDF Sección 3: ANÁLISIS OCLUSAL
export interface IOrthoOcclusalAnalysis {
  manipulation: 'rc_mih_igual' | 'rc_mih_diferente' | null;
  transversal: {
    relation: 'brodie' | 'normal' | 'cruzada_unilateral' | 'cruzada_bilateral' | null;
    crossbiteFeatures: 'esqueletal' | 'dentoalveolar' | 'no_presenta' | null;
  };
  vertical: {
    relation: 'normal' | 'bis_a_bis' | 'mordida_profunda' | 'mordida_abierta' | null;
    amount: string | null; // (para registrar mm o piezas de profunda/abierta)
  };
  speeCurve: {
    isAltered: boolean | null;
    details: string[]; // ej: ['extrusion_incisivos_inf']
  };
  sagittalIncisors: 'normal' | 'overjet_aumentado' | 'mordida_cruzada_anterior' | null;
  mihCanineRelation: {
    right: SagittalRelation;
    left: SagittalRelation;
  };
  mihMolarRelation: {
    right: SagittalRelation;
    left: SagittalRelation;
  };
  rcCanineRelation: {
    right: SagittalRelation;
    left: SagittalRelation;
  };
  rcMolarRelation: {
    right: SagittalRelation;
    left: SagittalRelation;
  };
  midline: {
    coincident: boolean | null;
    upperDeviation: 'derecha' | 'izquierda' | null;
    lowerDeviation: 'derecha' | 'izquierda' | null;
  };
  dentalAnomalies: string | null;
  atmCondition: string | null;
  familyMalocclusion: string | null;
}

// PDF Sección 5: DIAGNOSTICO FUNCIONAL
export interface IOrthoFunctionalAnalysis {
  respirationType: string | null;
  // (Se puede expandir fácil)
}

// --- EL TIPO PRINCIPAL DE LA ANAMNESIS DE ORTODONCIA ---
export type OrthodonticAnamnesis = {
  id: string;
  generalAnalysis: IOrthoGeneralAnalysis;
  facialAnalysis: IOrthoFacialAnalysis;
  occlusalAnalysis: IOrthoOcclusalAnalysis;
  functionalAnalysis: IOrthoFunctionalAnalysis;
  cephalometricAnalysis: string | null;
  diagnosis: string | null;
  treatmentPlan: string | null;
};

export interface OdontopediatricHistory {
  id: string;
  childhoodIllnesses: string;
  vaccinesUpToDate: boolean;
  allergies: string;
  currentMedications: string;
  previousSurgeries: string;
  pregnancyIssues: string;
  birthType: string;
  birthComplications: string;
  feedingType: string;
  usedBottle: boolean;
  usedPacifier: boolean;
  oralHabits: string;
  firstToothAge: string;
  firstDentalVisit: Date | null;
  previousDentalExperience: string;
}

export interface Treatment {
  id: string;
  name: string;
  description?: string;
  price: number;
}

export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  patient: Patient;
  doctor: User & { tenant: Tenant };
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
}

export interface ToothSurfaceState {
  id: string;
  toothNumber: number;
  surface: string;
  status: ToothStatus;
}

export interface ToothState {
  id: string;
  toothNumber: number;
  condition: string;
  sub_type: string | null;
  abbreviation: string;
  status: 'bueno' | 'malo';
}

export interface OdontogramData {
  wholeTeeth: Tooth[]; // <-- Debe ser un Array
  surfaces: ToothSurfaceState[]; // <-- Debe ser un Array
  toothStates: ToothState[];
}

export interface ToothUpdate {
  toothNumber: number;
  status: ToothStatus; // <-- CORREGIDO de 'string' a 'ToothStatus'
  surface?: string;
}

export interface ClinicalHistoryEntry {
  id: string;
  entryDate: string;
  description: string;
  evolution: string;
  treatmentPerformed?: string;
  diagnosis?: string;
  prescription?: string;
  indications?: string;
  nextAppointmentPlan?: string;
  nextAppointmentDate?: string;
  user: User;
}

export interface BudgetItem {
  id: string;
  priceAtTimeOfBudget: number;
  quantity: number;
  treatment: Treatment;
}

export interface Budget {
  id: string;
  creationDate: string;
  totalAmount: number;
  discountAmount: number;
  paidAmount: number;
  status: string;
  items: BudgetItem[];
  patient: Patient;
  tenant: Tenant;
  doctor?: User;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  budget: Budget;
}

export interface Cie10Code {
  id: string;
  code: string;
  description: string;
}

export interface DailySummary {
  payments: Payment[];
  expenses: Expense[];
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface Announcement {
  id: string;
  message: string;
  isActive: boolean;
  createdAt: string;
}

export interface PlannedTreatment {
  id: string;
  treatment: Treatment;
  toothSurfaceState: ToothSurfaceState;
}

export interface ConsentTemplate {
  id: string;
  title: string;
  content: string;
  forMinor: boolean;
  category?: string;
  tenant?: Tenant | null
}

export interface PatientDocument {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
}

export enum SiteLocation {
  MESIOBUCCAL = 'mesiobuccal',
  BUCCAL = 'buccal',
  DISTOBUCCAL = 'distobuccal',
  MESIOLINGUAL = 'mesiolingual',
  LINGUAL = 'lingual',
  DISTOLINGUAL = 'distolingual',
}

export interface PeriodontalMeasurement {
  id: string;
  date: string;
  toothNumber: number;
  site: SiteLocation;
  probingDepth: number | null;
  gingivalMargin: number | null;
  bleedingOnProbing: boolean;
  suppuration: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: {
    id: string;
    fullName: string;
  };
}

export interface DentalBridge {
  id: string;
  startTooth: number;
  endTooth: number;
  type: 'fixed' | 'removable'; // Por si quieres expandirlo luego
  color: string; // 'blue' | 'red'
}