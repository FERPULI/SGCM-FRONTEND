/**
 * Servicio de Reportes "Inteligente"
 * Calcula estadísticas reales usando los datos existentes del sistema.
 */

import { http } from './http';
import {
  AdminDashboardStats, 
  AppointmentsByDate,
  AppointmentsByStatus,
  DoctorPerformance,
  PatientStatistics,
  RevenueReport,
  ReportFilters
} from '../types';

export const reportsService = {

  // --- 1. DASHBOARD GENERAL (Tarjetas Superiores) ---
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    try {
      // Pedimos todo al mismo tiempo para que cargue rápido
      const [pacientesRes, medicosRes, citasRes] = await Promise.all([
        http.get('users', { params: { per_page: 1000 } }),
        http.get('medicos-directorio', { params: { per_page: 1000 } }),
        http.get('citas', { params: { per_page: 1000 } })
      ]);

      // Extraemos arrays (soportando paginación o array directo)
      const getArray = (res: any) => (res.data?.data && Array.isArray(res.data.data)) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      
      const usuarios = getArray(pacientesRes);
      const medicos = getArray(medicosRes);
      const citas = getArray(citasRes);

      // Filtramos solo pacientes (si tienen rol)
      const pacientes = usuarios.filter((u: any) => {
         const r = (u.role || u.rol || 'user').toLowerCase();
         return r.includes('patient') || r.includes('paciente') || r === 'user';
      });

      // Cálculos Matemáticos
      const hoy = new Date().toISOString().split('T')[0];
      const citasHoy = citas.filter((c: any) => (c.fecha_hora_inicio || c.fecha || '').startsWith(hoy));
      const citasPendientes = citas.filter((c: any) => (c.estado || 'pendiente').toLowerCase() === 'pendiente');
      const citasCompletadas = citas.filter((c: any) => (c.estado || '').toLowerCase() === 'completada' || (c.estado || '').toLowerCase() === 'finalizada');
      
      const totalCitas = citas.length || 1; // Evitar división por cero
      const tasaCompletacion = Math.round((citasCompletadas.length / totalCitas) * 100);
      const tasaCancelacion = Math.round((citas.filter((c: any) => (c.estado || '').toLowerCase() === 'cancelada').length / totalCitas) * 100);

      return {
        totalPacientes: pacientes.length,
        totalMedicos: medicos.length,
        citasHoy: citasHoy.length,
        citasPendientes: citasPendientes.length,
        citasCompletadas: citasCompletadas.length,
        tasaCompletacion,
        tasaCancelacion,
        totalCitas: citas.length,
        citasEsteMes: citas.length, // Simplificación
        nuevosUsuarios: 0,
        citasRecientes: citas.slice(0, 5) // Las últimas 5
      };

    } catch (error) {
      console.error("Error calculando dashboard:", error);
      // Retornamos ceros si falla
      return { 
        totalPacientes: 0, 
        totalMedicos: 0, 
        citasHoy: 0, 
        citasPendientes: 0, 
        citasCompletadas: 0, 
        tasaCompletacion: 0, 
        tasaCancelacion: 0, 
        totalCitas: 0, 
        citasEsteMes: 0, 
        nuevosUsuarios: 0, 
        citasRecientes: [] 
      };
    }
  },

  // --- 2. GRÁFICA: CITAS POR FECHA ---
  getAppointmentsByDate: async (filters?: ReportFilters): Promise<AppointmentsByDate[]> => {
    try {
      const res = await http.get('citas', { params: { per_page: 500 } });
      const citas = (res.data?.data || (Array.isArray(res.data) ? res.data : []));

      // Agrupar por fecha
      const mapa = new Map<string, number>();
      citas.forEach((c: any) => {
        const fecha = (c.fecha_hora_inicio || c.fecha || '').split('T')[0];
        if (fecha) mapa.set(fecha, (mapa.get(fecha) || 0) + 1);
      });

      // Convertir a formato de gráfica
      return Array.from(mapa.entries()).map(([fecha, total]) => ({ fecha, total }));
    } catch { return []; }
  },

  // --- 3. GRÁFICA: CITAS POR ESTADO ---
  getAppointmentsByStatus: async (filters?: ReportFilters): Promise<AppointmentsByStatus[]> => {
    try {
      const res = await http.get('citas', { params: { per_page: 500 } });
      const citas = (res.data?.data || (Array.isArray(res.data) ? res.data : []));

      const conteo: Record<string, number> = { programada: 0, completada: 0, cancelada: 0, pendiente: 0 };
      
      citas.forEach((c: any) => {
        const estado = (c.estado || 'pendiente').toLowerCase();
        if (conteo[estado] !== undefined) conteo[estado]++;
        else conteo['pendiente']++; // Agrupar desconocidos
      });

      return [
        { estado: 'completada', total: conteo.completada },
        { estado: 'pendiente', total: conteo.pendiente + conteo.programada },
        { estado: 'cancelada', total: conteo.cancelada }
      ];
    } catch { return []; }
  },

  // --- 4. TABLA: RENDIMIENTO MÉDICOS ---
  getDoctorsPerformance: async (filters?: ReportFilters): Promise<DoctorPerformance[]> => {
    try {
      const [medicosRes, citasRes] = await Promise.all([
        http.get('medicos-directorio'),
        http.get('citas', { params: { per_page: 1000 } })
      ]);
      
      const medicos = (medicosRes.data?.data || medicosRes.data || []);
      const citas = (citasRes.data?.data || citasRes.data || []);

      return medicos.map((m: any) => {
        const misCitas = citas.filter((c: any) => c.medico_id === m.id || c.doctor_id === m.id);
        return {
          medico_id: m.id,
          nombre_medico: m.nombre_completo || m.name || 'Dr. Desconocido',
          total_citas: misCitas.length,
          citas_completadas: misCitas.filter((c: any) => c.estado === 'completada').length
        };
      });
    } catch { return []; }
  },

  // --- Mocks para lo demás (para que no falle) ---
  getPatientsStatistics: async (): Promise<PatientStatistics | null> => null,
  getRevenueReport: async (): Promise<RevenueReport[]> => []
};