import { useEffect, useState } from "react";
import * as httpService from "../../services/http"; 
const api = (httpService as any).http || (httpService as any).default || (httpService as any).api || (httpService as any).axios;

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Loader2, User, Mail, Shield, Calendar, Camera, Lock, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner"; // Usamos Sonner para las notificaciones bonitas

interface UserProfile {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  role: string;
  created_at: string;
}

export function AdminProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para Edición de Perfil
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: "", apellidos: "", email: "" });
  const [saving, setSaving] = useState(false);

  // Estados para Cambio de Contraseña
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passForm, setPassForm] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });
  const [passLoading, setPassLoading] = useState(false);

  // --- CARGAR DATOS ---
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!api) return;
      const response = await api.get('/auth/profile');
      
      let userData = response.data?.user || response.data?.data || response.data;
      
      if (userData) {
        setProfile(userData);
        // Inicializamos el formulario de edición con los datos actuales
        setEditForm({
            nombre: userData.nombre || "",
            apellidos: userData.apellidos || "",
            email: userData.email || ""
        });
      }
    } catch (err) {
      console.error("Error cargando perfil:", err);
      toast.error("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  // --- GUARDAR DATOS PERSONALES ---
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
        const response = await api.put('/auth/profile', editForm);
        if (response.data.success) {
            toast.success("Perfil actualizado correctamente");
            setProfile({ ...profile!, ...editForm }); // Actualizamos vista local
            setIsEditing(false); // Salimos del modo edición
        }
    } catch (error: any) {
        console.error("Error actualizando:", error);
        toast.error(error.response?.data?.message || "Error al actualizar el perfil");
    } finally {
        setSaving(false);
    }
  };

  // --- CAMBIAR CONTRASEÑA ---
  const handleChangePassword = async () => {
    if (passForm.new_password !== passForm.new_password_confirmation) {
        toast.error("Las nuevas contraseñas no coinciden");
        return;
    }
    if (passForm.new_password.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres");
        return;
    }

    setPassLoading(true);
    try {
        await api.put('/auth/change-password', passForm);
        toast.success("Contraseña actualizada correctamente");
        setShowPasswordDialog(false);
        setPassForm({ current_password: "", new_password: "", new_password_confirmation: "" }); // Limpiar form
    } catch (error: any) {
        console.error("Error password:", error);
        toast.error(error.response?.data?.message || "Error al cambiar contraseña");
    } finally {
        setPassLoading(false);
    }
  };

  if (loading) return <div className="flex h-[50vh] justify-center items-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (!profile) return <div className="p-6">No hay datos.</div>;

  const iniciales = ((profile.nombre?.charAt(0) || "") + (profile.apellidos?.charAt(0) || "")).toUpperCase();

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mi Perfil</h1>
            <p className="text-gray-500 mt-1">Gestiona tu información personal y credenciales.</p>
        </div>
        {/* Botón flotante de edición rápida */}
        {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="hidden md:flex gap-2">
                <Edit2 className="h-4 w-4" /> Editar Datos
            </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TARJETA IZQUIERDA (FOTO) */}
        <Card className="md:col-span-1 shadow-sm border-gray-200">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-lg select-none">
                {iniciales}
              </div>
              <button className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full hover:bg-gray-700 transition-colors shadow-sm cursor-pointer">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900">{profile.nombre} {profile.apellidos}</h2>
            <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full capitalize">
              <Shield className="h-3.5 w-3.5" />
              {profile.role || "Admin"}
            </div>

            <div className="mt-6 w-full space-y-3 border-t pt-4 text-left">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Miembro desde {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TARJETA DERECHA (FORMULARIO) */}
        <Card className="md:col-span-2 shadow-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Visualiza y actualiza tus datos básicos.</CardDescription>
            </div>
            {isEditing && (
                 <BadgeEditMode />
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input 
                    id="nombre" 
                    value={isEditing ? editForm.nombre : profile.nombre} 
                    onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                    readOnly={!isEditing} 
                    className={`pl-10 ${isEditing ? 'bg-white border-blue-400 ring-2 ring-blue-100' : 'bg-gray-50 text-gray-600'}`} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input 
                    id="apellidos" 
                    value={isEditing ? editForm.apellidos : profile.apellidos} 
                    onChange={(e) => setEditForm({...editForm, apellidos: e.target.value})}
                    readOnly={!isEditing} 
                    className={`pl-10 ${isEditing ? 'bg-white border-blue-400 ring-2 ring-blue-100' : 'bg-gray-50 text-gray-600'}`} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <Input 
                    id="email" 
                    value={isEditing ? editForm.email : profile.email} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    readOnly={!isEditing} 
                    className={`pl-10 ${isEditing ? 'bg-white border-blue-400 ring-2 ring-blue-100' : 'bg-gray-50 text-gray-600'}`} 
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t mt-4">
               <Button variant="outline" onClick={() => setShowPasswordDialog(true)} className="gap-2">
                  <Lock className="h-4 w-4" /> Cambiar Contraseña
               </Button>

               {isEditing ? (
                   <div className="flex gap-2">
                       <Button variant="ghost" onClick={() => { setIsEditing(false); setEditForm({ nombre: profile.nombre, apellidos: profile.apellidos, email: profile.email }); }}>
                           Cancelar
                       </Button>
                       <Button onClick={handleSaveChanges} disabled={saving} className="bg-blue-600 hover:bg-blue-700 gap-2">
                           {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                           <Save className="h-4 w-4" /> Guardar Cambios
                       </Button>
                   </div>
               ) : (
                   <Button onClick={() => setIsEditing(true)} className="md:hidden">Editar</Button>
               )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- MODAL CAMBIO DE CONTRASEÑA --- */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Cambiar Contraseña</DialogTitle>
                <DialogDescription>Asegúrate de usar una contraseña segura.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label>Contraseña Actual</Label>
                    <Input type="password" value={passForm.current_password} onChange={(e) => setPassForm({...passForm, current_password: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Nueva Contraseña</Label>
                    <Input type="password" value={passForm.new_password} onChange={(e) => setPassForm({...passForm, new_password: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Confirmar Nueva Contraseña</Label>
                    <Input type="password" value={passForm.new_password_confirmation} onChange={(e) => setPassForm({...passForm, new_password_confirmation: e.target.value})} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancelar</Button>
                <Button onClick={handleChangePassword} disabled={passLoading} className="bg-blue-600 text-white">
                    {passLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Actualizar
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BadgeEditMode() {
    return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            Modo Edición
        </span>
    )
}