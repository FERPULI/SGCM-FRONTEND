// Types for the Medical Appointment Management System

// User roles (aligned with API)
export type UserRole = 'admin' | 'doctor' | 'patient';

// Appointment statuses (aligned with API)
export type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

// User interface (aligned with Laravel API)
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
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
  role: UserRole;
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

// Legacy types for backwards compatibility with existing components
export interface DoctorAvailability {
  id: string;
  medicoId: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}
