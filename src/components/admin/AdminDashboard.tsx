import { useEffect, useState } from "react";
// Importación universal del servicio HTTP
import * as httpService from "../../services/http"; 
const api = (httpService as any).http || (httpService as any).default || (httpService as any).api || (httpService as any).axios;

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, Stethoscope, Calendar, Clock, Activity, TrendingUp, UserPlus, CheckCircle2, AlertCircle, FileText, Loader2 } from "lucide-react";

// --- INTERFACES ---
interface DashboardStats {
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
}

// Mantenemos las props originales para evitar conflictos con tu router
interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
}

// --- COMPONENTE PRINCIPAL ---
export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      console.log("🔄 Iniciando carga del Dashboard...");
      try {
        if (!api) {
            console.error("❌ No se encontró la instancia de API (httpService)");
            return;
        }

        const response = await api.get('/dashboard-stats');
        console.log("✅ Datos recibidos del Dashboard:", response.data);
        
        // Asignamos directamente la respuesta del JSON
        setStats(response.data);

      } catch (error) {
        console.error("❌ Error cargando estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-gray-500 text-sm">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  // Valores por defecto seguros (evita pantalla blanca si stats es null)
  const data = stats || {
    totalPacientes: 0, totalMedicos: 0, citasHoy: 0, citasPendientes: 0,
    citasCompletadas: 0, citasCanceladas: 0, tasaCompletacion: 0, tasaCancelacion: 0,
    totalCitas: 0, citasEsteMes: 0, nuevosUsuarios: 0
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Panel de Administración</h1>
        <p className="text-gray-500 mt-1">Vista general del sistema de gestión de citas</p>
      </div>

      {/* KPI CARDS (FILA 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Pacientes" 
          value={data.totalPacientes} 
          icon={Users} 
          subtext="Pacientes registrados"
          colorIcon="text-blue-600"
          bgIcon="bg-blue-100"
        />
        <StatCard 
          title="Total Médicos" 
          value={data.totalMedicos} 
          icon={Stethoscope} 
          subtext="Médicos activos"
          colorIcon="text-indigo-600"
          bgIcon="bg-indigo-100"
        />
        <StatCard 
          title="Citas Hoy" 
          value={data.citasHoy} 
          icon={Calendar} 
          subtext="Programadas para hoy"
          colorIcon="text-emerald-600"
          bgIcon="bg-emerald-100"
        />
        <StatCard 
          title="Pendientes" 
          value={data.citasPendientes} 
          icon={Clock} 
          subtext="Requieren atención"
          colorIcon="text-orange-600"
          bgIcon="bg-orange-100"
        />
      </div>

      {/* PANELES DETALLE (FILA 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PANEL IZQUIERDO: ACTIVIDAD */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Actividad del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-500">Citas Completadas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{data.citasCompletadas}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>

            <div className="space-y-5">
              {/* Tasa Completación */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Tasa de Completación</span>
                    </div>
                    <span className="font-bold text-gray-900">{data.tasaCompletacion}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                    className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${data.tasaCompletacion}%` }}
                    ></div>
                </div>
              </div>

              {/* Tasa Cancelación */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Tasa de Cancelación</span>
                    </div>
                    <span className="font-bold text-gray-900">{data.tasaCancelacion}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                    className="bg-red-500 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${data.tasaCancelacion}%` }}
                    ></div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* PANEL DERECHO: ESTADÍSTICAS RÁPIDAS */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Estadísticas Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <QuickStatItem 
              icon={FileText} 
              label="Total Histórico de Citas" 
              value={data.totalCitas} 
              color="text-blue-600"
              bg="bg-blue-100"
            />
            <QuickStatItem 
              icon={TrendingUp} 
              label="Citas este Mes" 
              value={data.citasEsteMes} 
              color="text-purple-600"
              bg="bg-purple-100"
            />
            <QuickStatItem 
              icon={UserPlus} 
              label="Nuevos Usuarios (Mes)" 
              value={data.nuevosUsuarios} 
              color="text-orange-600"
              bg="bg-orange-100"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTES ---

function StatCard({ title, value, icon: Icon, subtext, colorIcon, bgIcon }: any) {
  return (
    <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${bgIcon}`}>
            <Icon className={`h-5 w-5 ${colorIcon}`} />
          </div>
        </div>
        <div className="mt-4 flex items-center">
            {/* Pequeño indicador visual */}
           <div className="h-2 w-2 rounded-full bg-gray-300 mr-2"></div>
           <span className="text-xs text-gray-400">{subtext}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStatItem({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-default">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-4 ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}