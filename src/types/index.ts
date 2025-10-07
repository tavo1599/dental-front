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
}

export interface Patient {
  id: string;
  fullName: string;
  dni: string;
  phone: string;
  birthDate: string;
  email?: string;
  address?: string;
  allergies?: string;
  department?: string;
  province?: string;
  district?: string;
  gender?: Gender;
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

export interface ClinicalHistoryEntry {
  id: string;
  entryDate: string;
  description: string;
  treatmentPerformed?: string;
  diagnosis?: string;
  prescription?: string;
  indications?: string;
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
  paidAmount: number;
  status: string;
  items: BudgetItem[];
  patient: Patient;
  tenant: Tenant;
}

export interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  budget?: Budget;
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