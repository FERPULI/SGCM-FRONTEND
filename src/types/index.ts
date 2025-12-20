// src/types/index.ts

// --- ENUMS & CONSTANTS ---
export type UserRole = 'admin' | 'medico' | 'paciente' | 'doctor' | 'patient';
export type Gender = 'male' | 'female' | 'other';

// Estados de citas (soporte para ambos formatos)
export type AppointmentStatus = 
  | 'programada' | 'confirmada' | 'cancelada' | 'completada' | 'pendiente'
  | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'activa';

// --- INTERFACES PRINCIPALES (Modelos Eloquent) ---

// 1. USUARIO (Base)
export interface User {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relaciones (Opcionales porque dependen del eager loading)
  paciente?: Paciente;
  medico?: Medico;
  patient?: Patient;
  doctor?: Doctor;
  
  // Aliases para compatibilidad
  name?: string;
  role?: UserRole;
  telefono?: string;
  phone?: string;
  is_active?: boolean;
}

// 2. PACIENTE (Perfil)
export interface Paciente {
  id: number;
  usuario_id: number;
  fecha_nacimiento: string;
  telefono: string;
  direccion: string;
  tipo_sangre?: string;
  alergias?: string;
  nombre_completo?: string;
    
  // Relaciones
  user?: User;
  historiales_medicos?: HistorialMedico[];
}

// 3. MEDICO (Perfil)
export interface Medico {
  id: number;
  usuario_id: number;
  especialidad_id: number;
  licencia_medica: string;
  telefono_consultorio: string;
  biografia?: string;
  nombre_completo?: string;

  user?: User;
  especialidad?: Especialidad;
}

// 4. Especialidad
export interface Especialidad {
  id: number;
  nombre: string;
  descripcion?: string;
}

// 5. HistorialMedico
export interface HistorialMedico {
  id: number;
  paciente_id: number;
  medico_id: number;
  diagnostico: string;
  tratamiento?: string;
  created_at: string;
}

// Patient interface (Versión en inglés para compatibilidad)
export interface Patient {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: Gender;
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

// Doctor interface (Versión en inglés para compatibilidad)
export interface Doctor {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  license_number: string;
  years_of_experience?: number;
  education?: string;
  bio?: string;
  consultation_fee?: number;
  is_available?: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

// 6. Cita / Appointment (Versión principal en español)
export interface Cita {
  id: number;
  paciente_id: number;
  medico_id: number;
  fecha_hora_inicio: string;
  fecha_hora_fin?: string;
  estado: AppointmentStatus;
  motivo_consulta: string;
  notas_paciente?: string;

  // Relaciones
  paciente?: Paciente;
  medico?: Medico;
}

// Appointment interface (Combina ambas versiones)
export interface Appointment {
  id: number;
  // Campos en español (principales)
  paciente_id?: number;
  medico_id?: number;
  fecha_hora_inicio?: string;
  fecha_hora_fin?: string;
  estado?: AppointmentStatus;
  motivo_consulta?: string;
  notas_paciente?: string;
  
  // Campos en inglés (aliases)
  patient_id?: number;
  doctor_id?: number;
  appointment_date?: string;
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
  cancellation_reason?: string;
  completion_notes?: string;
  
  created_at?: string;
  updated_at?: string;
  
  // Relaciones cargadas (soporte para ambos)
  paciente?: Paciente;
  medico?: Medico;
  patient?: Patient;
  doctor?: Doctor;
  medical_record?: MedicalRecord;
}

// Medical Record interface (Historial)
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

// Doctor Schedule (Horarios)
export interface DoctorSchedule {
  id: number;
  doctor_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// --- DTOs PARA FORMULARIOS Y AUTH ---

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  phone?: string;
}

export interface CreateAppointmentPayload {
  medico_id: number;
  paciente_id: number;
  fecha: string;
  hora: string;
  motivo: string;
}

export interface AvailableSlotsResponse {
  success: boolean;
  slots: string[];
}

// --- DASHBOARD STATS ---

export interface DashboardStats {
  appointments_today?: number;
  pending_appointments?: number;
  upcoming_appointments?: number;
  unique_patients_month?: number;
  citasHoy?: number;
  citasPendientes?: number;
}

export interface AdminDashboardStats {
  totalPacientes: number;
  totalMedicos: number;
  citasHoy: number;
  citasPendientes: number;
  citasCompletadas: number;
  citasCanceladas: number;
  tasaCompletacion: number;
  tasaCancelacion: number;
  totalCitas: number;
  citasEsteMes: number;
  nuevosUsuarios: number;
  citasRecientes: Appointment[];
}

export interface DoctorDashboardData {
  stats: DashboardStats;
  today_appointments: Appointment[];
  pending_appointments: Appointment[];
  recent_patients: Patient[];
}

// --- UTILIDADES DE FILTRADO Y PAGINACIÓN ---

export interface UserFilters {
  q?: string;
  role?: string;
  status?: string;
  date?: string;
  page?: number;
  per_page?: number;
  specialty?: string;
}

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
    stats_generales?: {
      totalMedicos: number;
      totalEspecialidades: number;
      totalCitas: number;
      totalPacientesAtendidos: number;
    };
  };
}

// Tipos Legacy (Compatibilidad)
export interface DoctorAvailability {
  id: string;
  medicoId: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}
