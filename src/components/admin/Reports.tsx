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
  appointments: Appointment[];
}

export function Reports({ appointments }: ReportsProps) {
  const monthlyAppointments = appointments.filter(a => {
    const date = new Date(a.fecha);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const completionRate = appointments.length > 0
    ? ((appointments.filter(a => a.estado === 'completada').length / appointments.length) * 100).toFixed(1)
    : 0;

  const cancelRate = appointments.length > 0
    ? ((appointments.filter(a => a.estado === 'cancelada').length / appointments.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Reportes y Estadísticas</h1>
          <p className="text-gray-500 mt-1">Analítica y reportes del sistema</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="mes">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mes</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="ano">Año</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Citas</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{appointments.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {monthlyAppointments} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Tasa de Completación</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{completionRate}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${completionRate}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Tasa de Cancelación</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{cancelRate}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-red-600 h-2 rounded-full" 
                style={{ width: `${cancelRate}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pacientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {new Set(appointments.map(a => a.pacienteId)).size}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Este período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Detallados</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="citas">
            <TabsList>
              <TabsTrigger value="citas">Citas</TabsTrigger>
              <TabsTrigger value="medicos">Médicos</TabsTrigger>
              <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
              <TabsTrigger value="financiero">Financiero</TabsTrigger>
            </TabsList>

            <TabsContent value="citas" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm mb-4">Distribución por Estado</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-600 rounded-full" />
                        <span className="text-sm">Activas</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{appointments.filter(a => a.estado === 'activa').length}</span>
                        <Badge variant="secondary">
                          {((appointments.filter(a => a.estado === 'activa').length / appointments.length) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-yellow-600 rounded-full" />
                        <span className="text-sm">Pendientes</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{appointments.filter(a => a.estado === 'pendiente').length}</span>
                        <Badge variant="secondary">
                          {((appointments.filter(a => a.estado === 'pendiente').length / appointments.length) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-600 rounded-full" />
                        <span className="text-sm">Completadas</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{appointments.filter(a => a.estado === 'completada').length}</span>
                        <Badge variant="secondary">
                          {((appointments.filter(a => a.estado === 'completada').length / appointments.length) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-600 rounded-full" />
                        <span className="text-sm">Canceladas</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{appointments.filter(a => a.estado === 'cancelada').length}</span>
                        <Badge variant="secondary">
                          {((appointments.filter(a => a.estado === 'cancelada').length / appointments.length) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm mb-4">Citas por Especialidad</h4>
                  <div className="space-y-3">
                    {[...new Set(appointments.map(a => a.especialidad))].map((especialidad) => {
                      const count = appointments.filter(a => a.especialidad === especialidad).length;
                      const percentage = ((count / appointments.length) * 100).toFixed(0);
                      
                      return (
                        <div key={especialidad} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{especialidad}</span>
                            <span>{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
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

            <TabsContent value="medicos" className="space-y-4 pt-4">
              <div className="space-y-3">
                {[...new Set(appointments.map(a => a.medicoNombre))].map((medico) => {
                  const medicoAppointments = appointments.filter(a => a.medicoNombre === medico);
                  const completed = medicoAppointments.filter(a => a.estado === 'completada').length;
                  const completionRate = medicoAppointments.length > 0 
                    ? ((completed / medicoAppointments.length) * 100).toFixed(0)
                    : 0;
                  
                  return (
                    <Card key={medico}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm">{medico}</h4>
                            <p className="text-xs text-gray-500">
                              {appointments.find(a => a.medicoNombre === medico)?.especialidad}
                            </p>
                          </div>
                          <Badge variant="outline">{medicoAppointments.length} citas</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xl">{completed}</p>
                            <p className="text-xs text-gray-500">Completadas</p>
                          </div>
                          <div>
                            <p className="text-xl">{medicoAppointments.filter(a => a.estado === 'activa').length}</p>
                            <p className="text-xs text-gray-500">Activas</p>
                          </div>
                          <div>
                            <p className="text-xl">{completionRate}%</p>
                            <p className="text-xs text-gray-500">Efectividad</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="pacientes" className="space-y-4 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl">{new Set(appointments.map(a => a.pacienteId)).size}</p>
                    <p className="text-sm text-gray-500 mt-1">Pacientes Únicos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl">
                      {(appointments.length / new Set(appointments.map(a => a.pacienteId)).size).toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Promedio Citas/Paciente</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl">24</p>
                    <p className="text-sm text-gray-500 mt-1">Nuevos Este Mes</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Pacientes Más Frecuentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[...new Set(appointments.map(a => a.pacienteNombre))]
                      .map(nombre => ({
                        nombre,
                        count: appointments.filter(a => a.pacienteNombre === nombre).length
                      }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)
                      .map(({ nombre, count }) => (
                        <div key={nombre} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">{nombre}</span>
                          <Badge variant="secondary">{count} citas</Badge>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financiero" className="space-y-4 pt-4">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl">€12,450</p>
                    <p className="text-sm text-gray-500 mt-1">Ingresos Este Mes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl">€145,200</p>
                    <p className="text-sm text-gray-500 mt-1">Ingresos Este Año</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl">€85</p>
                    <p className="text-sm text-gray-500 mt-1">Precio Promedio</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl text-green-600">+15%</p>
                    <p className="text-sm text-gray-500 mt-1">vs Mes Anterior</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
