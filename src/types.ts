// ============================================================================
// SISTEMA DE CITAS MÉDICAS - TIPOS GLOBALES
// ============================================================================

// --- ROLES Y PERMISOS ---
export type UserRole = 'admin' | 'medico' | 'paciente';

// --- ESTADOS ---
export type AppointmentStatus = 'programada' | 'confirmada' | 'completada' | 'cancelada' | 'pendiente' | 'activa';

// --- ENTIDADES BASE ---

// 1. ESPECIALIDAD
export interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
}

// 2. PACIENTE (Datos anidados)
export interface PacienteData {
  id: number;
  usuario_id: number | null;
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  tipo_sangre?: string;
  alergias?: string;
}

// 3. MÉDICO (Datos anidados)
export interface MedicoData {
  id: number;
  usuario_id: number | null;
  especialidad_id?: number;
  licencia_medica?: string;
  telefono_consultorio?: string;
  biografia?: string;
  especialidad?: Especialidad;
  user?: User; // Relación inversa si la API la carga
}

// 4. USUARIO (Entidad Principal)
export interface User {
  id: number;
  nombre: string;
  apellidos: string;
  nombre_completo: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  created_at: string;
  updated_at: string;
  
  // Relaciones Anidadas
  paciente: PacienteData | null;
  medico: MedicoData | null;
  
  // Campos Legacy (por compatibilidad con código viejo si existe)
  telefono?: string;
  especialidad?: string;
  numeroLicencia?: string; 
}

// 5. CITA (APPOINTMENT)
export interface Appointment {
  id: number;
  fecha_hora_inicio: string; // ISO 8601
  fecha_hora_fin?: string;
  estado: AppointmentStatus;
  motivo_consulta?: string;
  
  // Relación Médico
  medico: {
    id: number;
    nombre_completo: string;
    telefono_consultorio?: string;
    // Soporte dual: Objeto (nuevo) o String (viejo/error)
    especialidad: {
      id: number;
      nombre: string;
    } | string;
  };
  
  // Relación Paciente
  paciente: {
    id: number;
    nombre_completo: string;
  };
}

// ============================================================================
// MÓDULOS ESPECÍFICOS
// ============================================================================

// --- MÓDULO: DIRECTORIO DE MÉDICOS ---
export interface DoctorIndividualStats {
  citas_totales: number;
  citas_completadas: number;
  citas_pendientes: number;
  pacientes_atendidos: number;
}

export interface DoctorDirectoryItem {
  id_medico: number;
  id_usuario: number | null;
  nombre_completo: string;
  email: string;
  licencia_medica: string;
  telefono_consultorio: string;
  biografia: string | null;
  especialidad: {
    id: number;
    nombre: string;
  };
  estadisticas: DoctorIndividualStats;
  usuario?: User; 
}

// --- MÓDULO: PACIENTE (DASHBOARD & HISTORIAL) ---
export interface PatientDashboardStats {
  resumen: {
    citas_programadas: number;
    historial_completado: number;
  };
  proxima_cita: {
    id: number;
    fecha_hora_inicio: string;
    estado: string; 
    motivo_consulta: string;
    medico: {
      id: number;
      nombre_completo: string;
      especialidad: {
        id: number;
        nombre: string;
      } | string;
    };
  } | null;
}

export interface MedicalRecord {
  id: number;
  fecha: string;
  diagnostico: string;
  tratamiento: string;
  notas?: string;
  archivos_adjuntos?: boolean;
  medico: {
    nombre: string;
    especialidad: string | { nombre: string }; // Soporte flexible
  };
}

export interface PatientClinicalProfile {
  tipo_sangre: string;
  edad: number;
  alergias: string;
  condiciones_cronicas: string;
  altura?: string; 
  peso?: string;   
}

// --- MÓDULO: ADMIN (DASHBOARD & GESTIÓN) ---
export interface AdminDashboardStats {
  // Usuarios
  totalPacientes: number;
  totalMedicos: number;
  
  // Citas
  totalCitas: number;
  citasHoy: number;
  
  // Desglose Estados
  citasActivas: number;
  citasPendientes: number;
  citasConfirmadas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  
  // KPIs
  tasaCompletacion: number;
  tasaCancelacion: number;
  
  // Compatibilidad (Si usas campos antiguos en algún lado)
  total_pacientes?: number;
  total_medicos?: number;
  total_citas?: number;
  citas_hoy?: number;
  citas_pendientes?: number;
  medicos_activos?: number;
}

export interface RecentAppointment {
  id: number;
  fecha_hora_inicio: string;
  estado: AppointmentStatus;
  motivo_consulta: string;
  paciente: { id: number; nombre_completo: string; };
  medico: { id: number; nombre_completo: string; };
}

// ============================================================================
// PAYLOADS Y RESPUESTAS DE API
// ============================================================================

// --- PAGINACIÓN ---
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
    // Stats opcionales que a veces vienen en meta
    stats_generales?: {
        totalMedicos: number;
        totalEspecialidades: number;
        totalCitas: number;
        totalPacientesAtendidos: number;
    };
  };
}

// --- AUTH & USUARIOS ---
export type LoginCredentials = { email: string, password: string };

export interface CreateUserData {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  password_confirmation: string;
  rol: UserRole;
  // Paciente
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  tipo_sangre?: string;
  alergias?: string;
  // Médico
  especialidad_id?: number;
  licencia_medica?: string;
  telefono_consultorio?: string;
  biografia?: string;
}

export interface UpdateUserData extends Omit<CreateUserData, 'password' | 'password_confirmation' | 'rol'> {
  activo?: boolean;
  rol?: UserRole;
}

export interface ChangePasswordData { 
  current_password?: string;
  password: string;
  password_confirmation: string;
}

export interface UserFilters {
  page?: number;
  per_page?: number;
  q?: string;
  rol?: UserRole;
  activo?: boolean;
  especialidad_id?: number;
}

// --- CITAS (OPERACIONES) ---
export interface CreateAppointmentPayload {
  medico_id: number;
  paciente_id: number; 
  fecha: string; 
  hora: string;  
  motivo: string;
}

export interface AvailableSlotsResponse {
  fecha: string;
  slots: string[];
}

// --- REPORTES ---
export interface ReportFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  medico_id?: number;
  paciente_id?: number;
}

export interface AppointmentsByDate { fecha: string; total: number; }
export interface AppointmentsByStatus { estado: string; total: number; }
export interface DoctorPerformance { medico_id: number; nombre_medico: string; total_citas: number; citas_completadas: number; }
export interface PatientStatistics { nuevos_pacientes: number; total_pacientes: number; }
export interface RevenueReport { mes: string; total_ingresos: number; }
export interface UserStats { total_usuarios: number; pacientes: number; medicos: number; administradores: number; }