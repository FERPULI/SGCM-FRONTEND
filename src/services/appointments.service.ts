/**
 * Servicio de Citas Médicas
 * Conecta con el backend Laravel y adapta los tipos
 */

import { http, ApiResponse } from './http';
import { API_ENDPOINTS } from '../config/api';
// Importamos 'Cita' porque es la interfaz real que coincide con la BD
import { Cita, AppointmentStatus, PaginatedResponse } from '../types';

// --- DTOs (Data Transfer Objects) para enviar datos ---

export interface CreateAppointmentPayload {
  medico_id: number;
  paciente_id?: number; // Opcional si el backend lo toma del token
  fecha: string;        // "YYYY-MM-DD"
  hora: string;         // "HH:mm"
  motivo: string;
}

export interface UpdateAppointmentData {
  fecha?: string;
  hora?: string;
  motivo_consulta?: string;
  estado?: AppointmentStatus;
  notas_paciente?: string;
}

// Filtros mapeados a query params de Laravel
export interface AppointmentFilters {
  page?: number;
  per_page?: number;
  estado?: AppointmentStatus; // Backend espera 'estado', no 'status'
  medico_id?: number;
  paciente_id?: number;
  fecha?: string;
}

// Objeto vacío seguro
const emptyPaginatedResponse: PaginatedResponse<Cita> = {
  data: [],
  links: { first: null, last: null, prev: null, next: null },
  meta: { current_page: 1, from: 0, last_page: 1, per_page: 10, to: 0, total: 0 }
};

export const appointmentsService = {
  /**
   * Obtener lista de citas
   */
  getAppointments: async (filters?: AppointmentFilters): Promise<PaginatedResponse<Cita>> => {
    try {
      const response = await http.get<PaginatedResponse<Cita>>(
        API_ENDPOINTS.APPOINTMENTS.LIST,
        { params: filters }
      );
      return response.data || emptyPaginatedResponse;
    } catch (error) {
      console.error("Error al obtener citas:", error);
      return emptyPaginatedResponse;
    }
  },

  /**
   * Obtener una cita por ID
   */
  getAppointmentById: async (id: number): Promise<Cita | null> => {
    try {
      // Laravel apiResource devuelve { data: { ...objeto } }
      const response = await http.get<{ data: Cita }>(
        API_ENDPOINTS.APPOINTMENTS.GET(id)
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error al obtener cita ${id}:`, error);
      return null;
    }
  },

  /**
   * Crear nueva cita
   * Traduce de {fecha, hora} -> {fecha_hora_inicio}
   */
  createAppointment: async (data: CreateAppointmentPayload): Promise<Cita> => {
    // 1. Calcular fecha inicio
    const fechaInicio = `${data.fecha} ${data.hora}:00`;
    
    // 2. Calcular fecha fin (Asumimos 30 min por defecto si el usuario no lo define)
    // Esto es opcional, depende de si tu backend lo calcula automáticamente.
    // Lo enviamos para asegurar que el campo required de BD se llene.
    const fechaDate = new Date(fechaInicio);
    fechaDate.setMinutes(fechaDate.getMinutes() + 30);
    const fechaFin = fechaDate.toISOString().slice(0, 19).replace('T', ' ');

    const payload = {
      medico_id: data.medico_id,
      paciente_id: data.paciente_id,
      fecha_hora_inicio: fechaInicio,
      fecha_hora_fin: fechaFin, // Enviamos fin calculado
      motivo_consulta: data.motivo,
      estado: 'programada' // Estado inicial por defecto
    };

    const response = await http.post<{ data: Cita }>(
      API_ENDPOINTS.APPOINTMENTS.CREATE,
      payload
    );
    
    return response.data.data;
  },

  /**
   * Actualizar cita
   */
  updateAppointment: async (id: number, data: UpdateAppointmentData): Promise<Cita> => {
    // Convertimos datos parciales si es necesario
    const payload: any = { ...data };
    
    // Si viene fecha y hora nuevas, reconstruimos el datetime
    if (data.fecha && data.hora) {
        payload.fecha_hora_inicio = `${data.fecha} ${data.hora}:00`;
        // Recalcular fin...
    }

    const response = await http.put<{ data: Cita }>(
      API_ENDPOINTS.APPOINTMENTS.UPDATE(id),
      payload
    );
    return response.data.data;
  },

  /**
   * Eliminar cita
   */
  deleteAppointment: async (id: number): Promise<void> => {
    await http.delete(API_ENDPOINTS.APPOINTMENTS.DELETE(id));
  },

  /**
   * Cancelar cita (Shortcut)
   */
  cancelAppointment: async (id: number, reason?: string): Promise<Cita> => {
    // En Laravel apiResource, PUT a /citas/{id} es lo estándar
    const response = await http.put<{ data: Cita }>(
      API_ENDPOINTS.APPOINTMENTS.UPDATE(id),
      { 
        estado: 'cancelada',
        notas_paciente: reason ? `Motivo cancelación: ${reason}` : undefined
      }
    );
    return response.data.data;
  },

  /**
   * Obtener horarios disponibles
   */
  getAvailableSlots: async (medicoId: number, date: string): Promise<string[]> => {
    try {
      // Espera query params: ?medico_id=1&fecha=2023-10-01
      const response = await http.get<{ slots: string[] }>( // Ajusta según tu API
        API_ENDPOINTS.APPOINTMENTS.AVAILABLE_SLOTS,
        { params: { medico_id: medicoId, fecha: date } }
      );
      
      // Valida que sea array
      if (response.data && Array.isArray(response.data.slots)) {
        return response.data.slots;
      }
      return [];
    } catch (error) {
      console.error("Error fetching slots:", error);
      return [];
    }
  },
};