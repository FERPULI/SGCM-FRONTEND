// src/types/index.ts

// --- DEFINICIONES DE TIPOS BASE ---
export type UserRole = 'admin' | 'doctor' | 'patient' | 'medico' | 'paciente'; // Agregamos variantes en español por seguridad
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// --- INTERFACES PRINCIPALES ---

// User interface (Alineado con la respuesta API de Laravel)
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  
  // [IMPORTANTE] Cambiado de 'role' a 'rol' para coincidir con tu Backend
  rol: UserRole; 
  
  is_active: boolean;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Doctor;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole; // En el registro solemos enviar 'role', el backend lo mapea
  phone?: string;
}

// Patient interface
export interface Patient {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

// Doctor interface
export interface Doctor {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  license_number: string;
  years_of_experience: number;
  education?: string;
  bio?: string;
  consultation_fee?: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

// Appointment interface
export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  cancellation_reason?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Doctor;
}

// Medical record interface
export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  record_date: string;
  diagnosis: string;
  treatment: string;
  prescriptions?: string;
  notes?: string;
  vital_signs?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  attachments?: string[];
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Doctor;
  appointment?: Appointment;
}

// Doctor schedule interface
export interface DoctorSchedule {
  id: number;
  doctor_id: number;
  day_of_week: number; // 0-6 (Sunday to Saturday)
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Legacy types for backwards compatibility
export interface DoctorAvailability {
  id: string;
  medicoId: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

// --- NUEVOS TIPOS PARA EL DASHBOARD DEL DOCTOR ---

export interface DashboardStats {
  appointments_today: number;
  pending_appointments: number;
  upcoming_appointments: number;
  unique_patients_month: number;
}

export interface DoctorDashboardData {
  stats: DashboardStats;
  today_appointments: Appointment[];
  pending_appointments: Appointment[];
  recent_patients: Patient[];
}

// --- TIPOS DE UTILIDAD Y PAGINACIÓN (Necesarios para services) ---

export interface UserFilters {
  q?: string;
  role?: string;
  page?: number;
  per_page?: number;
  specialty?: string;
}

// Estructura para el directorio de médicos (puede ser igual a Doctor o extendida)
export type DoctorDirectoryItem = Doctor; 

// Estructura de paginación estándar de Laravel
export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
    // Stats generales opcionales para vistas de directorio
    stats_generales?: {
      totalMedicos: number;
      totalEspecialidades: number;
      totalCitas: number;
      totalPacientesAtendidos: number;
    };
  };
}