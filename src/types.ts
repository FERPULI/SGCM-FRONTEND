// --- Roles (Corregidos según tu SQL) ---
export type UserRole = 'admin' | 'medico' | 'paciente';

// --- (NUEVO) Interfaz para Especialidad ---
export interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
}

// --- (NUEVO) Interfaz para Paciente (Datos de la tabla 'pacientes') ---
export interface PacienteData {
  id: number;
  usuario_id: number | null;
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  tipo_sangre?: string;
  alergias?: string;
}

// --- (NUEVO) Interfaz para Medico (Datos de la tabla 'medicos') ---
export interface MedicoData {
  id: number;
  usuario_id: number | null; // (Corregido, tu API puede devolver null)
  especialidad_id?: number;
  licencia_medica?: string;
  telefono_consultorio?: string;
  biografia?: string;
  especialidad?: Especialidad; // (La relación cargada)
  user?: User;
}

// --- Usuario (MODIFICADO con relaciones anidadas) ---
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
  
  // --- RELACIONES ANIDADAS (de la API) ---
  paciente: PacienteData | null;
  medico: MedicoData | null;
  
  // (Campos opcionales que ya tenías)
  telefono?: string; // (Lo mantenemos por si acaso)
  especialidad?: string;
  numeroLicencia?: string; 
}

// --- (NUEVO) Interfaz para las Estadísticas de CADA médico ---
export interface DoctorIndividualStats {
  citas_totales: number;
  citas_completadas: number;
  citas_pendientes: number;
  pacientes_atendidos: number;
}

// --- (NUEVO) Interfaz para el Directorio de Médicos (basado en tu JSON) ---
export interface DoctorDirectoryItem {
  id_medico: number;
  id_usuario: number | null; // <-- El problema de tu API está aquí
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
  
  // (Esta propiedad 'usuario' es la que TU API DEBERÍA enviar para que Editar/Eliminar funcionen)
  usuario?: User; 
}

// --- (NUEVO) Interfaz para las Tarjetas de Stats de Médicos ---
export interface DoctorStats {
  totalMedicos: number;
  totalEspecialidades: number; // (Corregido de tu JSON)
  totalCitas: number;          // (Corregido de tu JSON)
  totalPacientesAtendidos: number; // (Corregido de tu JSON)
}

// --- Paginación ---
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
    stats_generales?: DoctorStats; // (Stats para el módulo de médicos)
  };
}

// --- Interfaz para las Stats de Usuarios ---
export interface UserStats {
  total_usuarios: number;
  pacientes: number;
  medicos: number;
  administradores: number;
}

// --- Tipos de Estado de Citas ---
export type AppointmentStatus = 'programada' | 'confirmada' | 'completada' | 'cancelada' | 'pendiente' | 'activa';

// --- Interfaz para Citas Recientes (Dashboard de Admin) ---
export interface RecentAppointment {
  id: number;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  estado: AppointmentStatus;
  motivo_consulta: string;
  notas_paciente: string | null;
  paciente: { id: number; nombre_completo: string; };
  medico: { 
    id: number; 
    // (Acepta un string O el objeto MedicoData (el error de tu API))
    nombre_completo: string | MedicoData; 
  };
}

// --- Interfaz para Stats (Dashboard de Admin) ---
// (Coincide con tu JSON de /dashboard-stats)
export interface AdminDashboardStats {
  totalPacientes: number;
  totalMedicos: number;
  citasHoy: number;
  citasPendientes: number;
  citasCompletadas: number;
  tasaCompletacion: number;
  tasaCancelacion: number;
  totalCitas: number;
  citasEsteMes: number;
  nuevosUsuarios: number;
  citasRecientes: RecentAppointment[];
}
// --- Interfaz de Cita (Completa) ---
// (Esta era la que tenías duplicada, la he borrado y dejado una sola)
export interface Appointment {
  id: number;
  fecha_hora_inicio: string;
  fecha_hora_fin?: string;
  estado: AppointmentStatus;
  motivo_consulta?: string;
  
  // Estructura actualizada según el Backend
  medico: {
    id: number;
    nombre_completo: string;
    telefono_consultorio?: string;
    // 👇 AHORA ES UN OBJETO, NO UN STRING O NULL
    especialidad: {
      id: number;
      nombre: string;
    };
  };
  
  paciente: {
    id: number;
    nombre_completo: string;
  };
}

// --- Tipos de Autenticación ---
export type LoginCredentials = { 
  email: string, 
  password: string 
};

export interface RegisterData {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// --- Tipos de CRUD de Usuarios (Formularios) ---
export interface CreateUserData {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  password_confirmation: string;
  rol: UserRole;
  
  // Campos de Paciente
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  tipo_sangre?: string;
  alergias?: string;
  
  // Campos de Médico
  especialidad_id?: number;
  licencia_medica?: string;
  telefono_consultorio?: string;
  biografia?: string;
}

export interface UpdateUserData extends Omit<CreateUserData, 'password' | 'password_confirmation' | 'rol'> {
  activo?: boolean;
  rol?: UserRole;
}

// --- Otros Tipos ---
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
  especialidad_id?: number; // Para filtrar médicos por especialidad
}

// --- (¡AÑADIDOS!) Tipos de Reportes que faltaban ---
// (Estos los importa 'reports.service.ts')
export interface ReportFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  medico_id?: number;
  paciente_id?: number;
}

export interface AppointmentsByDate {
  fecha: string;
  total: number;
}

export interface AppointmentsByStatus {
  estado: string;
  total: number;
}

export interface DoctorPerformance {
  medico_id: number;
  nombre_medico: string;
  total_citas: number;
  citas_completadas: number;
}

export interface PatientStatistics {
  nuevos_pacientes: number;
  total_pacientes: number;
}

export interface RevenueReport {
  mes: string;
  total_ingresos: number;
}

export interface PatientDashboardStats {
  resumen: {
    citas_programadas: number;
    historial_completado: number;
  };
  proxima_cita: {
    id: number;
    fecha_hora_inicio: string;
    estado: string; // "programada"
    motivo_consulta: string;
    medico: {
      id: number;
      nombre_completo: string;
      // 👇 IMPORTANTE: Ahora es un objeto
      especialidad: {
        id: number;
        nombre: string;
      };
    };
  } | null;
}
export interface AvailableSlotsResponse {
  fecha: string;
  slots: string[]; // Array de horas ["09:00", "09:30", ...]
}

export interface CreateAppointmentPayload {
  medico_id: number;
  paciente_id: number; // <-- ¡NUEVO CAMPO OBLIGATORIO!
  fecha: string; 
  hora: string;  
  motivo: string;
}
export interface MedicalRecord {
  id: number;
  fecha: string; // YYYY-MM-DD
  diagnostico: string;
  tratamiento: string;
  notas?: string;
  archivos_adjuntos?: boolean; // Para saber si mostrar botón de descarga
  
  // Relación con médico (puede venir anidada)
  medico: {
    nombre: string; // o nombre_completo
    especialidad: string; // o especialidad.nombre
  };
}
export interface PatientClinicalProfile {
  tipo_sangre: string;
  edad: number;
  alergias: string;
  condiciones_cronicas: string;
  // Campos opcionales (si no están en tu BD, mostraremos '-')
  altura?: string; 
  peso?: string;   
}