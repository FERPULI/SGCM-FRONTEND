/**
 * Servicio de Configuración del Sistema (Admin)
 * 
 * Maneja todas las operaciones relacionadas con configuración
 */

import { http, ApiResponse } from './http';
import { API_ENDPOINTS } from '../config/api';

export interface SystemSettings {
  general: GeneralSettings;
  email: EmailSettings;
  appointments: AppointmentSettings;
}

export interface GeneralSettings {
  site_name: string;
  site_description?: string;
  timezone: string;
  locale: string;
  date_format: string;
  time_format: string;
}

export interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password?: string;
  smtp_encryption: 'tls' | 'ssl' | null;
  from_email: string;
  from_name: string;
}

export interface AppointmentSettings {
  appointment_duration: number; // en minutos
  cancellation_deadline: number; // horas antes de la cita
  advance_booking_days: number; // días máximos de anticipación
  max_appointments_per_day: number;
  send_reminders: boolean;
  reminder_hours_before: number;
  allow_patient_cancellation: boolean;
}

export const settingsService = {
  /**
   * Obtener todas las configuraciones
   */
  getSettings: async (): Promise<SystemSettings> => {
    const response = await http.get<ApiResponse<SystemSettings>>(
      API_ENDPOINTS.SETTINGS.GET
    );
    
    return response.data.data!;
  },

  /**
   * Actualizar configuraciones generales
   */
  updateGeneralSettings: async (data: Partial<GeneralSettings>): Promise<GeneralSettings> => {
    const response = await http.put<ApiResponse<GeneralSettings>>(
      API_ENDPOINTS.SETTINGS.GENERAL,
      data
    );
    
    return response.data.data!;
  },

  /**
   * Actualizar configuraciones de email
   */
  updateEmailSettings: async (data: Partial<EmailSettings>): Promise<EmailSettings> => {
    const response = await http.put<ApiResponse<EmailSettings>>(
      API_ENDPOINTS.SETTINGS.EMAIL,
      data
    );
    
    return response.data.data!;
  },

  /**
   * Actualizar configuraciones de citas
   */
  updateAppointmentSettings: async (
    data: Partial<AppointmentSettings>
  ): Promise<AppointmentSettings> => {
    const response = await http.put<ApiResponse<AppointmentSettings>>(
      API_ENDPOINTS.SETTINGS.APPOINTMENTS,
      data
    );
    
    return response.data.data!;
  },

  /**
   * Actualizar todas las configuraciones
   */
  updateSettings: async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
    const response = await http.put<ApiResponse<SystemSettings>>(
      API_ENDPOINTS.SETTINGS.UPDATE,
      data
    );
    
    return response.data.data!;
  },
};
