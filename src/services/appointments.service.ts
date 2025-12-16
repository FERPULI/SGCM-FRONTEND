/**
 * Servicio de Citas Médicas
 * Archivo: src/services/appointments.service.ts
 */

import { http, ApiResponse } from './http';
import { API_ENDPOINTS } from '../config/api';
import { Appointment, AppointmentStatus, PaginatedResponse, CreateAppointmentPayload, AvailableSlotsResponse } from '../types';

// --- Interfaces para el Payload de Actualización ---
// Ajustadas para coincidir con los campos de la base de datos (snake_case)
export interface UpdateAppointmentData {
  fecha_hora_inicio?: string;
  motivo_consulta?: string;
  estado?: AppointmentStatus;
  medico_id?: number;
  paciente_id?: number;
  notas_paciente?: string; // O 'notes' según tu DB
}

export interface AppointmentFilters {
  page?: number;
  per_page?: number;
  status?: AppointmentStatus;
  doctor_id?: number;
  patient_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  estado?: string;
  fecha?: string;
  medico_id?: number;
}

const emptyPaginatedResponse: PaginatedResponse<Appointment> = {
  data: [],
  links: { first: null, last: null, prev: null, next: null },
  meta: {
    current_page: 1,
    from: 0,
    last_page: 1,
    path: "",
    per_page: 10,
    to: 0,
    total: 0,
  }
};

export const appointmentsService = {
  /**
   * Obtener lista de citas (con paginación y filtros)
   */
  getAllAppointments: async (filters: AppointmentFilters = {}): Promise<Appointment[]> => {
    try {
      const params: any = { ...filters };
      if (params.estado === 'todas') delete params.estado;
      if (!params.fecha) delete params.fecha;
      if (!params.medico_id) delete params.medico_id;

      const response = await http.get<any>(API_ENDPOINTS.APPOINTMENTS.LIST, { params });
      
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.data)) return response.data.data;
      
      return [];
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return [];
    }
  },

  /**
   * Obtener una cita por ID
   */
  getAppointmentById: async (id: number): Promise<Appointment | null> => {
    try {
      const response = await http.get<ApiResponse<Appointment>>(
        API_ENDPOINTS.APPOINTMENTS.GET(id)
      );
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error al obtener cita ${id}:`, error);
      return null;
    }
  },

  /**
   * Crear nueva cita
   */
  createAppointment: async (data: CreateAppointmentPayload): Promise<Appointment> => {
    const payload = {
      medico_id: data.medico_id,
      paciente_id: data.paciente_id,
      fecha_hora_inicio: `${data.fecha} ${data.hora}:00`,
      motivo_consulta: data.motivo
    };

    const response = await http.post<ApiResponse<Appointment>>(
      API_ENDPOINTS.APPOINTMENTS.CREATE,
      payload
    );
    
    if (response.data?.data) {
        return response.data.data;
    } else if (response.data) {
         return response.data as unknown as Appointment;
    }

    throw new Error("La API no devolvió la cita creada.");
  },

  /**
   * Actualizar cita (Edición completa o parcial)
   */
  updateAppointment: async (id: number, data: UpdateAppointmentData): Promise<Appointment> => {
    const response = await http.put<ApiResponse<Appointment>>(
      API_ENDPOINTS.APPOINTMENTS.UPDATE(id),
      data
    );
    
    // Verificación robusta de la respuesta
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data as unknown as Appointment;
    }

    throw new Error("La API no devolvió la cita actualizada.");
  },

  /**
   * Eliminar cita
   */
  deleteAppointment: async (id: number): Promise<void> => {
    await http.delete(API_ENDPOINTS.APPOINTMENTS.DELETE(id));
  },

  /**
   * Cancelar cita (Lógica de negocio)
   */
  cancelAppointment: async (id: number, reason?: string): Promise<boolean> => {
    try {
        // Opción A: Borrado físico
        await http.delete(API_ENDPOINTS.APPOINTMENTS.DELETE(id));
        
        // Opción B: Actualización de estado (Descomentar si usas soft delete/estados)
        // await http.put(API_ENDPOINTS.APPOINTMENTS.UPDATE(id), { estado: 'cancelada', motivo_cancelacion: reason });
        
        return true;
    } catch (error) {
        console.error("Error al cancelar cita:", error);
        throw error;
    }
  },

  /**
   * Reprogramar Cita (Helper específico)
   */
  rescheduleAppointment: async (id: number, date: string, time: string): Promise<Appointment> => {
    const payload = {
      fecha_hora_inicio: `${date} ${time}:00`
    };

  /**
   * Cancelar cita
   */
  cancelAppointment: async (id: number, reason?: string): Promise<Appointment> => {
    const response = await http.put<ApiResponse<Appointment>>(
      API_ENDPOINTS.APPOINTMENTS.UPDATE(id),
      { 
        estado: 'cancelada',
        cancellation_reason: reason 
      }
    );

    if (!response.data?.data) throw new Error("Error en respuesta al reprogramar.");
    return response.data.data;
  },

  /**
   * Confirmar cita
   */
  confirmAppointment: async (id: number): Promise<Appointment> => {
    const response = await http.post<ApiResponse<Appointment>>(
      API_ENDPOINTS.APPOINTMENTS.CONFIRM(id)
    );
    return response.data?.data!;
  },

  /**
   * Completar cita
   */
  completeAppointment: async (id: number, notes?: string): Promise<Appointment> => {
    const response = await http.post<ApiResponse<Appointment>>(
      API_ENDPOINTS.APPOINTMENTS.COMPLETE(id),
      { completion_notes: notes }
    );
    return response.data?.data!;
  },

  /**
   * Reprogramar cita
   */
  rescheduleAppointment: async (id: number, newDate: string, newTime: string): Promise<Appointment> => {
    // Asegurarnos de que el formato de hora sea correcto (HH:MM)
    // Los slots vienen como "15:30", así que solo necesitamos agregar ":00" si no lo tiene
    let formattedTime = newTime.trim();
    
    // Si el formato es "HH:MM", agregar ":00"
    if (formattedTime.match(/^\d{2}:\d{2}$/)) {
      formattedTime = `${formattedTime}:00`;
    }
    
    const payload = {
      fecha_hora_inicio: `${newDate} ${formattedTime}`
    };
    
    console.log('Reprogramando cita:', { 
      id, 
      newDate, 
      newTime, 
      formattedTime,
      fullDateTime: payload.fecha_hora_inicio 
    });
    
    const response = await http.put<ApiResponse<Appointment>>(
      API_ENDPOINTS.APPOINTMENTS.UPDATE(id),
      payload
    );
    
    console.log('Respuesta completa de reprogramación:', response);
    
    if (!response.data?.data) {
      throw new Error("La API no devolvió la cita reprogramada.");
    }
    
    return response.data.data;
  },

  /**
   * (MODIFICADO) Obtener horarios disponibles
   * Devuelve un array de strings ['09:00', '09:30']
   */
  getAvailableSlots: async (medicoId: number, date: string): Promise<string[]> => {
    try {
      const response = await http.get<AvailableSlotsResponse>(
        API_ENDPOINTS.APPOINTMENTS.AVAILABLE_SLOTS,
        { params: { medico_id: medicoId, fecha: date } }
      );
      
      // Manejo flexible de la respuesta
      // @ts-ignore
      if (response.data && Array.isArray(response.data.slots)) return response.data.slots;
      // @ts-ignore
      if (Array.isArray(response.data)) return response.data;

      return [];
    } catch (error) {
      console.error("Error al obtener horarios disponibles:", error);
      return [];
    }
  },
};