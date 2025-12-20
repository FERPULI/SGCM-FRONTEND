// src/types/index.ts

// --- ENUMS & CONSTANTS ---
export type UserRole = 'admin' | 'medico' | 'paciente';

// Valores exactos de tu constante ESTADOS en Cita.php
export type AppointmentStatus = 'programada' | 'confirmada' | 'cancelada' | 'completada' | 'pendiente';

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
  
  // Relaciones (Opcionales porque dependen del eager loading)
  paciente?: Paciente;
  medico?: Medico;
  
  // Legacy compatibility
  name?: string;
  role?: UserRole;
  telefono?: string;
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

// Legacy Patient interface (compatibilidad)
export interface Patient {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string;
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

// Legacy Doctor interface (compatibilidad)
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

// Cita / Appointment
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

// Appointment interface (alias compatible con Cita)
export interface Appointment extends Cita {
  patient_id?: number;
  doctor_id?: number;
  appointment_date?: string;
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
  cancellation_reason?: string;
  completion_notes?: string;
  created_at?: string;
  updated_at: string;
  
  // Relaciones cargadas (Eager Loading)
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
  attachments?: string[]; // Array de URLs o paths
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
  day_of_week: number; // 0-6 (Domingo a Sábado)
  start_time: string; // Formato HH:mm
  end_time: string;   // Formato HH:mm
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

// --- TIPOS PARA EL DASHBOARD (Estadísticas y Vistas) ---

export interface DashboardStats {
  appointments_today: number;
  pending_appointments: number;
  upcoming_appointments: number;
  unique_patients_month: number;
}

// Estructura completa de la respuesta del Dashboard del Doctor
export interface DoctorDashboardData {
  stats: DashboardStats;
  today_appointments: Appointment[];
  pending_appointments: Appointment[];
  recent_patients: Patient[];
}

// --- UTILIDADES DE FILTRADO Y PAGINACIÓN ---

export interface UserFilters {
  q?: string;          // Búsqueda general
  role?: string;       // Filtro por rol
  status?: string;     // Filtro por estado de cita
  date?: string;       // Filtro por fecha
  page?: number;
  per_page?: number;
  specialty?: string;
}

// Estructura de paginación estándar de Laravel (LengthAwarePaginator)
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
    // Stats opcionales para respuestas complejas
    stats_generales?: {
      totalMedicos: number;
      totalEspecialidades: number;
      totalCitas: number;
      totalPacientesAtendidos: number;
    };
  };
}

// Tipos Legacy (Mantener solo si es estrictamente necesario para compatibilidad hacia atrás)
export interface DoctorAvailability {
  id: string;
  medicoId: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}