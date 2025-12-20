import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge"; // Asegúrate de tener este componente o usa un span con clases
import { 
  Plus, Search, Users, User, Stethoscope, Shield, 
  Mail, Phone, Edit, Trash2, Loader2, RefreshCw 
} from "lucide-react";
import { toast } from "sonner";
import { usersService } from "../../services/users.service";

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("todos"); // todos, paciente, medico, admin

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await usersService.deleteUser(id);
      toast.success("Usuario eliminado");
      loadData();
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  // --- CÁLCULO DE ESTADÍSTICAS ---
  const stats = {
    total: users.length,
    pacientes: users.filter(u => u.role === 'patient' || u.role === 'paciente').length,
    medicos: users.filter(u => u.role === 'doctor' || u.role === 'medico').length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'administrador').length,
  };

  // --- FILTRADO ---
  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterRole === "todos") return matchesSearch;
    
    const role = (user.role || "").toLowerCase();
    if (filterRole === "paciente") return matchesSearch && (role === 'patient' || role === 'paciente');
    if (filterRole === "medico") return matchesSearch && (role === 'doctor' || role === 'medico');
    if (filterRole === "admin") return matchesSearch && (role === 'admin' || role === 'administrador');
    
    return matchesSearch;
  });

  // --- HELPERS VISUALES ---
  const getInitials = (name: string) => name ? name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "U";

  const getRoleBadge = (role: string) => {
    const r = (role || "").toLowerCase();
    if (r === 'admin' || r === 'administrador') return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Administrador</span>;
    if (r === 'doctor' || r === 'medico') return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white">Médico</span>;
    if (r === 'patient' || r === 'paciente') return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Paciente</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{role}</span>;
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600"/></div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 mt-1">Administra pacientes, médicos y administradores</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Usuario
        </Button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Total Usuarios" value={stats.total} />
        <StatsCard label="Pacientes" value={stats.pacientes} />
        <StatsCard label="Médicos" value={stats.medicos} />
        <StatsCard label="Administradores" value={stats.admins} />
      </div>

      {/* MAIN CONTENT CARD */}
      <Card className="border border-gray-100 shadow-sm bg-white">
        <CardContent className="p-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-700">Lista de Usuarios</h2>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar usuarios..." 
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* TABS FILTROS (Estilo Botones como imagen) */}
          <div className="flex flex-wrap gap-2 mb-6">
            <FilterTab active={filterRole === 'todos'} onClick={() => setFilterRole('todos')}>Todos</FilterTab>
            <FilterTab active={filterRole === 'paciente'} onClick={() => setFilterRole('paciente')}>Pacientes</FilterTab>
            <FilterTab active={filterRole === 'medico'} onClick={() => setFilterRole('medico')}>Médicos</FilterTab>
            <FilterTab active={filterRole === 'admin'} onClick={() => setFilterRole('admin')}>Administradores</FilterTab>
          </div>

          {/* TABLA */}
          <div className="rounded-md border border-gray-100">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-600">Usuario</TableHead>
                  <TableHead className="font-semibold text-gray-600">Contacto</TableHead>
                  <TableHead className="font-semibold text-gray-600">Rol</TableHead>
                  <TableHead className="font-semibold text-gray-600">Especialidad</TableHead>
                  <TableHead className="text-right font-semibold text-gray-600">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No se encontraron usuarios</TableCell></TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50/50">
                      {/* COLUMNA USUARIO */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold 
                            ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 
                              user.role === 'doctor' ? 'bg-blue-100 text-blue-600' : 'bg-blue-50 text-blue-600'}`}>
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* COLUMNA CONTACTO */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <Mail className="h-3 w-3 mr-1.5" /> {user.email}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Phone className="h-3 w-3 mr-1.5" /> {user.telefono || "+34 600 000 000"}
                          </div>
                        </div>
                      </TableCell>

                      {/* COLUMNA ROL */}
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>

                      {/* COLUMNA ESPECIALIDAD (Solo médicos) */}
                      <TableCell>
                        {(user.role === 'doctor' || user.role === 'medico') ? (
                          <span className="text-sm text-gray-700">
                            {user.especialidad?.nombre || "Cardiología"} {/* Mock si no viene */}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </TableCell>

                      {/* ACCIONES */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Subcomponente para tarjetas de estadísticas
function StatsCard({ label, value }: any) {
  return (
    <Card className="border border-gray-100 shadow-sm bg-white">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold text-gray-900 mb-1">{value}</span>
        <span className="text-sm text-gray-500">{label}</span>
      </CardContent>
    </Card>
  );
}

// Subcomponente para los botones de filtro
function FilterTab({ active, children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
        ${active 
          ? 'bg-gray-800 text-white shadow-sm' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
    >
      {children}
    </button>
  );
}