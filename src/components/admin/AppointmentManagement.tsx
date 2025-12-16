import { useState, useEffect } from "react"; // 1. Importante: useEffect
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { StatusBadge } from "../shared/StatusBadge";
import { Appointment, AppointmentStatus } from "../../types";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

export function AppointmentManagement() {
  // 2. Estado para guardar las citas que traigamos de la BD
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true); // Para mostrar "Cargando..."

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<AppointmentStatus | "todas">("todas");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // 3. AQUÍ ESTÁ LA SOLUCIÓN: Conectamos con Laravel al cargar la página
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        console.log("Intentando conectar con el backend...");
        const response = await fetch('http://localhost:8000/api/citas'); 
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Datos recibidos:", data); // Mira la consola (F12) para ver esto

        // Transformamos los datos para que React los entienda
        const citasFormateadas = data.map((cita: any) => ({
            id: cita.id,
            pacienteId: cita.pacienteId || cita.paciente_id,
            pacienteNombre: cita.pacienteNombre, 
            medicoId: cita.medicoId || cita.medico_id,
            medicoNombre: cita.medicoNombre,
            especialidad: cita.especialidad,
            fecha: cita.fecha,
            hora: cita.hora,
            // Convertimos 'programada' de la DB a 'pendiente' para el Frontend
            estado: cita.estado === 'programada' ? 'pendiente' : cita.estado,
            motivo: cita.motivo
        }));

        setAppointments(citasFormateadas);
      } catch (error) {
        console.error("Error cargando citas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, []);

  // Filtros (igual que antes)
  const filteredAppointments = appointments.filter(appointment => {
    const pNombre = appointment.pacienteNombre || "";
    const mNombre = appointment.medicoNombre || "";
    const matchesSearch = pNombre.toLowerCase().includes(searchTerm.toLowerCase()) || mNombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "todas" || appointment.estado === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Citas</h1>
          <p className="text-gray-500">Administra todas las citas del sistema</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Nueva Cita
        </Button>
      </div>

      {/* Tarjetas de Resumen (Con datos reales) */}
      <div className="grid grid-cols-5 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold">{appointments.length}</p><p className="text-sm text-gray-500">Total</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-blue-600">{appointments.filter(a => a.estado === 'activa' || a.estado === 'pendiente').length}</p><p className="text-sm text-gray-500">Activas</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-yellow-600">{appointments.filter(a => a.estado === 'pendiente').length}</p><p className="text-sm text-gray-500">Pendientes</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-green-600">{appointments.filter(a => a.estado === 'completada').length}</p><p className="text-sm text-gray-500">Completadas</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-red-600">{appointments.filter(a => a.estado === 'cancelada').length}</p><p className="text-sm text-gray-500">Canceladas</p></CardContent></Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader><CardTitle>Lista de Citas</CardTitle></CardHeader>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center">Cargando...</TableCell></TableRow>
                ) : filteredAppointments.map((cita) => (
                    <TableRow key={cita.id}>
                        <TableCell>{cita.pacienteNombre}</TableCell>
                        <TableCell>{cita.medicoNombre}</TableCell>
                        <TableCell>{cita.fecha}</TableCell>
                        <TableCell><StatusBadge status={cita.estado} /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </Card>
      
      {/* Diálogo mantenido igual... */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent><DialogHeader><DialogTitle>Nueva Cita</DialogTitle></DialogHeader></DialogContent>
      </Dialog>
    </div>
  );
}