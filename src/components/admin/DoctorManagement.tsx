import { useState } from 'react';
import { 
  Card, 
  CardContent 
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Stethoscope, 
  Users, 
  Calendar, 
  UserCheck
} from "lucide-react";

// --- Interfaces ---
interface DoctorStats {
  citasTotales: number;
  completadas: number;
  pendientes: number;
  pacientes: number;
}

interface Doctor {
  id: number;
  nombre: string;
  especialidad: string;
  email: string;
  telefono: string;
  licencia: string;
  stats: DoctorStats;
}

// --- Datos Mock ---
const MOCK_DOCTORS: Doctor[] = [
  {
    id: 1,
    nombre: "Dr. Carlos Ramírez",
    especialidad: "Cardiología",
    email: "carlos@hospital.com",
    telefono: "+34 623 456 789",
    licencia: "MED-12345",
    stats: { citasTotales: 2, completadas: 1, pendientes: 0, pacientes: 1 }
  },
  {
    id: 2,
    nombre: "Dra. Ana Martínez",
    especialidad: "Pediatría",
    email: "ana@hospital.com",
    telefono: "+34 634 567 890",
    licencia: "MED-12346",
    stats: { citasTotales: 1, completadas: 0, pendientes: 1, pacientes: 1 }
  }
];

export function DoctorManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const filteredDoctors = MOCK_DOCTORS.filter(doc => 
    doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleOpenModal = (doctor?: Doctor) => {
    if (doctor) setEditingDoctor(doctor);
    else setEditingDoctor(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Médicos</h1>
          <p className="text-gray-500 text-sm mt-1">Administra el equipo médico del sistema</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Médico
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Médicos" 
          value="2" 
          subtitle="Médicos activos" 
          icon={<Stethoscope className="h-5 w-5 text-gray-400" />} 
        />
        <StatCard 
          title="Especialidades" 
          value="2" 
          subtitle="Diferentes especialidades" 
          icon={<UserCheck className="h-5 w-5 text-gray-400" />} 
        />
        <StatCard 
          title="Citas Totales" 
          value="3" 
          subtitle="Todas las citas" 
          icon={<Calendar className="h-5 w-5 text-gray-400" />} 
        />
        <StatCard 
          title="Pacientes Atendidos" 
          value="1" 
          subtitle="Pacientes únicos" 
          icon={<Users className="h-5 w-5 text-gray-400" />} 
        />
      </div>

      {/* Directorio */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Directorio de Médicos</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        {/* Grid de Tarjetas - DISEÑO CORREGIDO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.map((medico) => (
            <Card key={medico.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 bg-white border-gray-200">
              <CardContent className="p-6">
                
                {/* 1. Header de la Tarjeta (Avatar + Nombre/Badge) */}
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="h-12 w-12 border border-blue-100 bg-blue-50">
                    <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-sm">
                      {getInitials(medico.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-gray-900 text-base">{medico.nombre}</h3>
                    <Badge variant="secondary" className="w-fit mt-1 bg-gray-100 text-gray-600 hover:bg-gray-200 font-normal text-xs px-2 py-0.5">
                      {medico.especialidad}
                    </Badge>
                  </div>
                </div>

                {/* 2. Estadísticas Verticales (Lista limpia) */}
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Citas totales:</span>
                    <span className="font-medium text-gray-900">{medico.stats.citasTotales}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Completadas:</span>
                    <span className="font-medium text-green-600">{medico.stats.completadas}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Pendientes:</span>
                    <span className="font-medium text-orange-500">{medico.stats.pendientes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Pacientes:</span>
                    <span className="font-medium text-gray-900">{medico.stats.pacientes}</span>
                  </div>
                </div>

                {/* Separador */}
                <div className="border-t border-gray-100 my-4"></div>

                {/* 3. Información de Contacto */}
                <div className="space-y-2 mb-6">
                  <div className="text-xs text-gray-500 truncate">
                    <span className="font-medium text-gray-700">Email: </span> 
                    {medico.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">Teléfono: </span> 
                    {medico.telefono}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">Licencia: </span> 
                    {medico.licencia}
                  </div>
                </div>

                {/* 4. Botones de Acción */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-9 text-xs border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => {}}>
                    <Eye className="h-3.5 w-3.5 mr-2" />
                    Ver
                  </Button>
                  <Button variant="outline" className="flex-1 h-9 text-xs border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => handleOpenModal(medico)}>
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" className="h-9 w-10 p-0 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDoctor ? 'Editar Médico' : 'Agregar Nuevo Médico'}</DialogTitle>
            <DialogDescription>
              Complete la información profesional y de acceso del médico.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" defaultValue={editingDoctor?.nombre?.split(' ')[1] || ''} placeholder="Ej. Carlos" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input id="apellidos" defaultValue={editingDoctor?.nombre?.split(' ')[2] || ''} placeholder="Ej. Ramírez" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" defaultValue={editingDoctor?.email} placeholder="correo@hospital.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad</Label>
              <Select defaultValue={editingDoctor ? "1" : ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Cardiología</SelectItem>
                  <SelectItem value="2">Pediatría</SelectItem>
                  <SelectItem value="3">Medicina General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="licencia">Licencia Médica</Label>
              <Input id="licencia" defaultValue={editingDoctor?.licencia} placeholder="CMP-XXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono Consultorio</Label>
              <Input id="telefono" defaultValue={editingDoctor?.telefono} placeholder="+XX XXX XXX XXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Biografía Corta</Label>
              <Input id="bio" placeholder="Resumen profesional..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente para KPIs (Cards de arriba)
function StatCard({ title, value, subtitle, icon }: { title: string, value: string, subtitle: string, icon: React.ReactNode }) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}