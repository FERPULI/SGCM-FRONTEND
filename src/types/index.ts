// src/types/index.ts

// --- ENUMS & CONSTANTS ---
export type UserRole = 'admin' | 'medico' | 'paciente';

// Valores exactos de tu constante ESTADOS en Cita.php
export type AppointmentStatus = 'programada' | 'confirmada' | 'cancelada' | 'completada';

// --- INTERFACES DE MODELOS (Base de Datos) ---

// 1. USUARIO (Base)
export interface User {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  email_verified_at?: string;
  created_at?: string; // Fechas vienen como string ISO
  
  // Relaciones (Opcionales porque dependen del eager loading)
  paciente?: Paciente;
  medico?: Medico;
}

// 2. PACIENTE (Perfil)
export interface Paciente {
  id: number;
  usuario_id: number;
  fecha_nacimiento: string; // Cast 'date' en Laravel = string 'YYYY-MM-DD'
  telefono: string;
  direccion: string;
  tipo_sangre?: string;
  alergias?: string;
  nombre_completo?: string; // Para compatibilidad con CitaResource
    
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
  nombre_completo?: string; // Para compatibilidad con CitaResource

  user?: User;
  especialidad?: Especialidad;

// 4. CITA (Transaccional)
export interface Cita {
  id: number;
  paciente_id: number;
  medico_id: number;
  fecha_hora_inicio: string; // "2023-10-25 10:00:00"
  fecha_hora_fin: string;
  estado: AppointmentStatus;
  motivo_consulta: string;
  notas_paciente?: string;

  // Relaciones
  paciente?: Paciente;
  medico?: Medico;
}

// 5. AUXILIARES
export interface Especialidad {
  id: number;
  nombre: string;
  descripcion?: string;
}

// Placeholder para Historial (aún no vimos el modelo, pero sabemos la relación)
export interface HistorialMedico {
  id: number;
  paciente_id: number;
  medico_id: number;
  diagnostico: string;
  tratamiento?: string;
  created_at: string;
}

// --- RESPUESTAS DE API ---

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  citas_hoy?: number;
  citas_pendientes?: number;
  pacientes_mes?: number;
  // Agrega aquí lo que devuelva tu DashboardController
}