/**
 * Servicio de Notificaciones
 * 
 * Maneja todas las operaciones relacionadas con notificaciones
 */

import { http, ApiResponse, PaginatedResponse } from './http';
import { API_ENDPOINTS } from '../config/api';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  read_at: string | null;
  created_at: string;
}

export interface NotificationFilters {
  page?: number;
  per_page?: number;
  unread_only?: boolean;
}

export const notificationsService = {
  /**
   * Obtener lista de notificaciones
   */
  getNotifications: async (filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> => {
    const response = await http.get<ApiResponse<PaginatedResponse<Notification>>>(
      API_ENDPOINTS.NOTIFICATIONS.LIST,
      { params: filters }
    );
    
    return response.data.data!;
  },

  /**
   * Marcar notificación como leída
   */
  markAsRead: async (id: number): Promise<void> => {
    await http.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead: async (): Promise<void> => {
    await http.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  /**
   * Eliminar notificación
   */
  deleteNotification: async (id: number): Promise<void> => {
    await http.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
  },

  /**
   * Obtener conteo de notificaciones no leídas
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await http.get<ApiResponse<{ count: number }>>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    
    return response.data.data!.count;
  },
};
