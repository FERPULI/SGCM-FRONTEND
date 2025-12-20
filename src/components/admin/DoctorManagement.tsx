import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label"; // Importante para el diseño del form
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Plus, Search, Stethoscope, Users, Calendar, 
  Activity, Eye, Edit, Trash2, Loader2 
} from "lucide-react";
import { toast } from "sonner";

// Servicios
import { doctorsService } from "../../services/doctors.service"; 
import { especialidadService } from "../../services/especialidad.service"; 

export function DoctorManagement() {
  // Datos principales
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialtiesList, setSpecialtiesList] = useState<any[]>([]); // Lista para el Select
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // Control del Modal

  // Formulario
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    especialidad_id: "",
    licencia: ""
  });
  
  // Estadísticas
  const [stats, setStats] = useState({
    totalMedicos: 0,
    especialidades: 0,
    citasTotales: 0,
    pacientesAtendidos: 0
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [medicosRes, espRes] = await Promise.all([
        doctorsService.getAll(),
        especialidadService.getAll()
      ]);

      const listaMedicos = Array.isArray(medicosRes) ? medicosRes : [];
      const listaEspecialidades = Array.isArray(espRes) ? espRes : [];
      
      setDoctors(listaMedicos);
      setSpecialtiesList(listaEspecialidades); // Guardamos para el dropdown

      // Estadísticas simuladas
      setStats({
        totalMedicos: listaMedicos.length,
        especialidades: listaEspecialidades.length,
        citasTotales: listaMedicos.length * 12 + 5, 
        pacientesAtendidos: listaMedicos.length * 8 + 2
      });

    } catch (error) {
      console.error(error);
      toast.error("Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE CREACIÓN ---
  const handleOpenAddDialog = () => {
    setFormData({ nombre: "", email: "", telefono: "", especialidad_id: "", licencia: "" });
    setIsAddDialogOpen(true);
  };

  const handleCreateDoctor = async () => {
    // Validaciones básicas
    if (!formData.nombre || !formData.email || !formData.especialidad_id) {
        toast.error("Nombre, Email y Especialidad son obligatorios");
        return;
    }

    setIsSubmitting(true);
    try {
        await doctorsService.create({
            nombre: formData.nombre, // Tu backend puede esperar 'nombre' o 'name'
            nombre_completo: formData.nombre, // Enviamos ambos por seguridad
            email: formData.email,
            telefono: formData.telefono,
            especialidad_id: parseInt(formData.especialidad_id),
            licencia: formData.licencia,
            password: "password123", // Password por defecto o generada
            role: "doctor"
        });

        toast.success("Médico agregado exitosamente 🎉");
        setIsAddDialogOpen(false);
        loadData(); // Recargar lista
    } catch (error: any) {
        console.error(error);
        const msg = error.response?.data?.message || "Error al crear médico";
        toast.error(msg);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este médico?")) return;
    try {
       await doctorsService.delete(id);
       toast.success("Médico eliminado");
       loadData();
    } catch (e) {
      toast.error("No se pudo eliminar");
    }
  };

  // Filtros y Helpers
  const filteredDoctors = doctors.filter(d => {
    const nombre = (d.nombre_completo || d.nombre || d.name || "").toLowerCase();
    const esp = (d.especialidad?.nombre || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return nombre.includes(search) || esp.includes(search);
  });

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600"/></div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Médicos</h1>
          <p className="text-gray-500 mt-1">Administra el equipo médico del sistema</p>
        </div>
        <Button onClick={handleOpenAddDialog} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Agregar Médico
        </Button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<Stethoscope className="h-5 w-5 text-gray-600"/>} label="Total Médicos" value={stats.totalMedicos} sub="Médicos activos" />
        <StatsCard icon={<Activity className="h-5 w-5 text-gray-600"/>} label="Especialidades" value={stats.especialidades} sub="Diferentes especialidades" />
        <StatsCard icon={<Calendar className="h-5 w-5 text-gray-600"/>} label="Citas Totales" value={stats.citasTotales} sub="Todas las citas" />
        <StatsCard icon={<Users className="h-5 w-5 text-gray-600"/>} label="Pacientes Atendidos" value={stats.pacientesAtendidos} sub="Pacientes únicos" />
      </div>

      {/* SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
        <h2 className="text-xl font-semibold text-gray-700">Directorio de Médicos</h2>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar por nombre o especialidad..." 
            className="pl-10 bg-white border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* GRID DE MÉDICOS (3 Columnas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((medico) => {
          const nombre = medico.nombre_completo || medico.nombre || medico.name || "Dr. Sin Nombre";
          const especialidad = medico.especialidad?.nombre || "General";
          const email = medico.email || "correo@hospital.com";
          const telefono = medico.telefono || "+34 123 456 789";
          const licencia = medico.licencia || `MED-${1000 + medico.id}`;
          
          return (
            <Card key={medico.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 border border-gray-100 bg-white rounded-xl flex flex-col">
              <CardContent className="p-6 flex flex-col h-full">
                
                {/* Header Tarjeta */}
                <div className="flex gap-4 mb-6">
                  <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl flex-shrink-0">
                    {getInitials(nombre)}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight truncate" title={nombre}>{nombre}</h3>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 truncate max-w-full">
                      {especialidad}
                    </span>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 gap-y-2 text-sm mb-6">
                  <div className="flex justify-between pr-2">
                    <span className="text-gray-500 text-xs">Citas:</span>
                    <span className="font-medium text-gray-900">2</span>
                  </div>
                  <div className="flex justify-between pl-2 border-l border-gray-100"></div>
                  <div className="flex justify-between pr-2">
                    <span className="text-gray-500 text-xs">Completas:</span>
                    <span className="font-medium text-green-600">1</span>
                  </div>
                  <div className="flex justify-between pl-2 border-l border-gray-100"></div>
                  <div className="flex justify-between pr-2">
                    <span className="text-gray-500 text-xs">Pendientes:</span>
                    <span className="font-medium text-yellow-600">0</span>
                  </div>
                  <div className="flex justify-between pl-2 border-l border-gray-100"></div>
                  <div className="flex justify-between pr-2">
                    <span className="text-gray-500 text-xs">Pacientes:</span>
                    <span className="font-medium text-gray-900">1</span>
                  </div>
                  <div className="flex justify-between pl-2 border-l border-gray-100"></div>
                </div>

                {/* Contacto */}
                <div className="space-y-2 pt-4 border-t border-gray-100 mb-6 mt-auto">
                  <div className="flex items-center text-sm text-gray-500 truncate">
                    <span className="font-medium text-gray-700 mr-2 text-xs">Email:</span> <span className="truncate">{email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 truncate">
                    <span className="font-medium text-gray-700 mr-2 text-xs">Telf:</span> {telefono}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 truncate">
                    <span className="font-medium text-gray-700 mr-2 text-xs">Lic:</span> {licencia}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-8 text-xs border-gray-200 hover:bg-gray-50 text-gray-700 px-0">
                    <Eye className="h-3 w-3 mr-1" /> Ver
                  </Button>
                  <Button variant="outline" className="flex-1 h-8 text-xs border-gray-200 hover:bg-gray-50 text-gray-700 px-0">
                    <Edit className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 border-gray-200 text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
                    onClick={() => handleDelete(medico.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* --- MODAL AGREGAR MÉDICO (Funcional y Diseño Idéntico) --- */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Agregar Nuevo Médico</DialogTitle>
            <p className="text-sm text-gray-500">Ingresa los datos del médico para agregarlo al sistema</p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium">Nombre Completo</Label>
              <Input 
                id="nombre" 
                placeholder="Dr. Juan Pérez" 
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="doctor@hospital.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-sm font-medium">Teléfono</Label>
              <Input 
                id="telefono" 
                placeholder="+34 600 000 000" 
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              />
            </div>

            {/* Especialidad (Select) */}
            <div className="space-y-2">
              <Label htmlFor="especialidad" className="text-sm font-medium">Especialidad</Label>
              <Select onValueChange={(val) => setFormData({...formData, especialidad_id: val})}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {specialtiesList.map((esp) => (
                    <SelectItem key={esp.id} value={esp.id.toString()}>
                      {esp.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Licencia */}
            <div className="space-y-2">
              <Label htmlFor="licencia" className="text-sm font-medium">Número de Licencia</Label>
              <Input 
                id="licencia" 
                placeholder="MED-12345" 
                value={formData.licencia}
                onChange={(e) => setFormData({...formData, licencia: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateDoctor} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Agregar Médico"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function StatsCard({ icon, label, value, sub }: any) {
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">{label}</span>
          {icon}
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}