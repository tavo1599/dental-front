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
  HEALTHY = 'healthy',
  CARIES = 'caries',
  FILLED = 'filled',
  SEALANT = 'sealant',
  FRACTURE = 'fracture',
  CROWN = 'crown',
  ENDODONTICS = 'endodontics',
  IMPLANT = 'implant',
  EXTRACTION_NEEDED = 'extraction_needed',
  EXTRACTED = 'extracted',
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
  // Las propiedades del tema han sido eliminadas
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
  status: string;
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