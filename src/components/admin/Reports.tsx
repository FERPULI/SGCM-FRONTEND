import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Appointment } from "../../types";
import { Download, TrendingUp, Users, Calendar, Activity } from "lucide-react";
import { Badge } from "../ui/badge";

interface ReportsProps {
  // Hacemos que sea opcional en la interfaz para evitar conflictos de TS
  appointments?: Appointment[]; 
}

// CORRECCIÓN AQUÍ: Asignamos " = [] " para evitar que sea undefined
export function Reports({ appointments = [] }: ReportsProps) {
  
  // Seguridad extra: Si por alguna razón sigue siendo null/undefined, forzamos array vacío
  const safeAppointments = appointments || [];

  // --- Lógica de Estadísticas ---
  const totalAppointments = safeAppointments.length;

  const monthlyAppointments = safeAppointments.filter(a => {
    const date = new Date(a.fecha);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const completedCount = safeAppointments.filter(a => a.estado === 'completada').length;
  const completionRate = totalAppointments > 0
    ? ((completedCount / totalAppointments) * 100).toFixed(1)
    : "0.0";

  const canceledCount = safeAppointments.filter(a => a.estado === 'cancelada').length;
  const cancelRate = totalAppointments > 0
    ? ((canceledCount / totalAppointments) * 100).toFixed(1)
    : "0.0";

  const uniquePatients = new Set(safeAppointments.map(a => a.pacienteId)).size;

  // --- Renderizado de filas de estado (Helper) ---
  const renderStatusRow = (label: string, count: number, colorDot: string) => {
    const percentage = totalAppointments > 0 ? ((count / totalAppointments) * 100).toFixed(0) : "0";
    return (
      <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-white hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${colorDot}`} />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900">{count}</span>
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
            {percentage}%
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reportes y Estadísticas</h1>
          <p className="text-gray-500 text-sm mt-1">Analítica y reportes del sistema</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="mes">
            <SelectTrigger className="w-[160px] bg-white border-gray-200">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mes</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="ano">Año</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* --- TARJETAS DE RESUMEN (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Citas */}
        <Card className="shadow-sm border-gray-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Citas</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalAppointments}</div>
            <p className="text-xs text-gray-500 mt-1">{monthlyAppointments} este mes</p>
          </CardContent>
        </Card>

        {/* Tasa de Completación */}
        <Card className="shadow-sm border-gray-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tasa de Completación</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${completionRate}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Tasa de Cancelación */}
        <Card className="shadow-sm border-gray-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tasa de Cancelación</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{cancelRate}%</div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div 
                className="bg-red-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${cancelRate}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Pacientes Únicos */}
        <Card className="shadow-sm border-gray-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pacientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{uniquePatients}</div>
            <p className="text-xs text-gray-500 mt-1">Este período</p>
          </CardContent>
        </Card>
      </div>

      {/* --- SECCIÓN DE REPORTES DETALLADOS (TABS) --- */}
      <Card className="shadow-sm border-gray-100 bg-white">
        <CardHeader className="border-b border-gray-50 pb-4">
          <CardTitle className="text-lg text-gray-900">Reportes Detallados</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="citas" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px] lg:grid-cols-4 mb-8 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="citas" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Citas</TabsTrigger>
              <TabsTrigger value="medicos" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Médicos</TabsTrigger>
              <TabsTrigger value="pacientes" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Pacientes</TabsTrigger>
              <TabsTrigger value="financiero" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Financiero</TabsTrigger>
            </TabsList>

            {/* --- TAB: CITAS --- */}
            <TabsContent value="citas" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Columna Izquierda: Estados */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider text-xs">Distribución por Estado</h4>
                  <div className="space-y-3">
                    {renderStatusRow('Activas', safeAppointments.filter(a => a.estado === 'activa').length, 'bg-blue-500')}
                    {renderStatusRow('Pendientes', safeAppointments.filter(a => a.estado === 'pendiente').length, 'bg-yellow-500')}
                    {renderStatusRow('Completadas', safeAppointments.filter(a => a.estado === 'completada').length, 'bg-green-500')}
                    {renderStatusRow('Canceladas', safeAppointments.filter(a => a.estado === 'cancelada').length, 'bg-red-500')}
                  </div>
                </div>

                {/* Columna Derecha: Especialidades */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider text-xs">Citas por Especialidad</h4>
                  <div className="space-y-5">
                    {[...new Set(safeAppointments.map(a => a.especialidad))].map((especialidad) => {
                      const count = safeAppointments.filter(a => a.especialidad === especialidad).length;
                      const percentage = totalAppointments > 0 ? ((count / totalAppointments) * 100).toFixed(0) : "0";
                      
                      return (
                        <div key={especialidad} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">{especialidad}</span>
                            <span className="text-gray-500">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
                              style={{ width: `${percentage}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* --- TAB: MÉDICOS --- */}
            <TabsContent value="medicos" className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[...new Set(safeAppointments.map(a => a.medicoNombre))].map((medico) => {
                  const medicoAppointments = safeAppointments.filter(a => a.medicoNombre === medico);
                  const completed = medicoAppointments.filter(a => a.estado === 'completada').length;
                  const rate = medicoAppointments.length > 0 
                    ? ((completed / medicoAppointments.length) * 100).toFixed(0)
                    : "0";
                  
                  return (
                    <div key={medico} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-gray-800">{medico}</h4>
                                <p className="text-xs text-blue-500">{safeAppointments.find(a => a.medicoNombre === medico)?.especialidad}</p>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">{medicoAppointments.length} citas</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            <div className="bg-gray-50 p-2 rounded">
                                <span className="block font-bold text-gray-900">{completed}</span>
                                <span className="text-xs text-gray-500">Ok</span>
                            </div>
                             <div className="bg-gray-50 p-2 rounded">
                                <span className="block font-bold text-gray-900">{medicoAppointments.filter(a => a.estado === 'activa').length}</span>
                                <span className="text-xs text-gray-500">Activas</span>
                            </div>
                             <div className="bg-gray-50 p-2 rounded">
                                <span className="block font-bold text-gray-900">{rate}%</span>
                                <span className="text-xs text-gray-500">Efic.</span>
                            </div>
                        </div>
                    </div>
                  );
                 })}
              </div>
            </TabsContent>

            {/* --- TAB: PACIENTES --- */}
            <TabsContent value="pacientes" className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                    <p className="text-2xl font-bold text-blue-700">{uniquePatients}</p>
                    <p className="text-xs text-blue-600">Pacientes Únicos</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
                    <p className="text-2xl font-bold text-green-700">
                         {uniquePatients > 0 ? (totalAppointments / uniquePatients).toFixed(1) : "0"}
                    </p>
                    <p className="text-xs text-green-600">Citas por Paciente</p>
                </div>
                 <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-100">
                    <p className="text-2xl font-bold text-purple-700">24</p>
                    <p className="text-xs text-purple-600">Nuevos (Demo)</p>
                </div>
              </div>
            </TabsContent>

            {/* --- TAB: FINANCIERO (Demo estático) --- */}
            <TabsContent value="financiero" className="pt-2">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                        <p className="text-xl font-bold text-gray-800">€12,450</p>
                        <p className="text-xs text-gray-500">Este Mes</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                        <p className="text-xl font-bold text-gray-800">€145k</p>
                        <p className="text-xs text-gray-500">Anual</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                        <p className="text-xl font-bold text-gray-800">€85</p>
                        <p className="text-xs text-gray-500">Ticket Medio</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center bg-green-50 border-green-100">
                        <p className="text-xl font-bold text-green-600">+15%</p>
                        <p className="text-xs text-green-600">Crecimiento</p>
                    </div>
                 </div>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}