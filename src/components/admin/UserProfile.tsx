import { useState, useEffect } from "react";
import { Camera, Shield, Loader2, Save, Clock, PenSquare } from "lucide-react"; // Agregué iconos nuevos
import { toast } from "sonner";
import { storage } from "../../utils/storage";
import { usersService } from "../../services/users.service";

export function UserProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    biografia: "",
    licencia: "",
    especialidad: "",
    // Nuevos campos para la pestaña Profesionales
    universidad: "",
    experiencia: "",
  });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const storageData = storage.getUser();
      const userData = storageData?.user || storageData;

      if (userData) {
        if (userData.id) setCurrentUserId(userData.id);
        updateFormState(userData);

        if (userData.id) {
          try {
            const serverData = await usersService.getUserById(userData.id);
            const realServerUser = serverData.user || serverData;
            if (realServerUser) updateFormState(realServerUser);
          } catch (e) { console.warn("Usando datos locales."); }
        }
      }
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  const updateFormState = (user: any) => {
    if (!user) return;

    let nombreFinal = user.nombre || "";
    let apellidosFinal = user.apellidos || "";

    if (!nombreFinal && user.name) {
        const parts = user.name.split(" ");
        nombreFinal = parts[0];
        apellidosFinal = parts.slice(1).join(" ");
    }

    setFormData({
        nombre: nombreFinal,
        apellidos: apellidosFinal,
        email: user.email || user.correo || "",
        telefono: user.telefono || user.phone || "",
        direccion: user.direccion || user.address || "",
        biografia: user.biografia || user.bio || "",
        licencia: user.licencia || user.license || user.rol || "",
        especialidad: user.especialidad?.nombre || user.specialty || "",
        // Mapeamos los nuevos campos (si no existen en BD, quedarán vacíos)
        universidad: user.universidad || user.university || "",
        experiencia: user.experiencia || user.experience || "",
    });
  };

  const handleSave = async () => {
    if (!currentUserId) return;
    setIsSaving(true);
    try {
        const fullName = `${formData.nombre} ${formData.apellidos}`.trim();
        
        const payload = {
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            name: fullName, 
            telefono: formData.telefono,
            direccion: formData.direccion,
            biografia: formData.biografia,
            // Enviamos también los nuevos datos
            universidad: formData.universidad,
            experiencia: formData.experiencia,
            licencia: formData.licencia,
            especialidad: formData.especialidad
        };

        const updatedUser = await usersService.updateProfile(currentUserId, payload);
        
        const currentStorage = storage.getUser();
        if (currentStorage.user) {
            currentStorage.user = { ...currentStorage.user, ...updatedUser, ...payload };
            storage.setUser(currentStorage);
        } else {
            storage.setUser({ ...currentStorage, ...updatedUser, ...payload });
        }

        toast.success("Perfil actualizado");
        setIsEditing(false);
    } catch (error) {
        console.error(error);
        toast.error("Error al guardar cambios");
    } finally {
        setIsSaving(false);
    }
  };

  const getInitials = () => {
    const n = formData.nombre ? formData.nombre[0] : "";
    const a = formData.apellidos ? formData.apellidos[0] : "";
    return (n + a).toUpperCase() || "US";
  };

  if (isLoading) return <div style={{ display: 'flex', height: '300px', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin h-8 w-8 text-blue-600"/></div>;

  return (
    <div style={{ padding: '32px', backgroundColor: '#F9FAFB', minHeight: '100vh', width: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Mi Perfil Profesional</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>Gestiona tu información y disponibilidad</p>
        </div>

        {/* LAYOUT BLINDADO */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* === COLUMNA IZQUIERDA === */}
          <div style={{ width: '350px', minWidth: '350px', flex: '0 0 350px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* AVATAR */}
                <div style={{ position: 'relative', marginBottom: '20px', width: '128px', height: '128px' }}>
                  <div style={{ width: '128px', height: '128px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', color: 'white', border: '4px solid white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                    {getInitials()}
                  </div>
                  <button style={{ position: 'absolute', bottom: '0', right: '0', padding: '8px', backgroundColor: '#2563EB', color: 'white', borderRadius: '50%', border: '2px solid white', cursor: 'pointer' }}>
                    <Camera size={16} />
                  </button>
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', textAlign: 'center', margin: '0' }}>
                    {formData.nombre} {formData.apellidos}
                </h2>
                
                <div style={{ marginTop: '8px', marginBottom: '32px', padding: '4px 12px', backgroundColor: '#FFFBEB', color: '#B45309', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Shield size={12} /> {formData.licencia || "Admin"}
                </div>

                <div style={{ width: '100%', borderTop: '1px solid #F3F4F6', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#9CA3AF' }}>Email:</span>
                    <span style={{ fontWeight: '600', color: '#374151', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={formData.email}>
                      {formData.email}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#9CA3AF' }}>Teléfono:</span>
                    <span style={{ fontWeight: '600', color: '#374151' }}>{formData.telefono || "-"}</span>
                  </div>
                </div>
            </div>
          </div>

          {/* === COLUMNA DERECHA === */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '32px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>Información Profesional</h3>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  style={{ padding: '8px 20px', fontSize: '14px', fontWeight: '500', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', color: '#4B5563' }}
                >
                  {isEditing ? "Cancelar" : "Editar"}
                </button>
              </div>

              {/* TABS DE NAVEGACIÓN */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
                 <TabButton active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} label="Datos Personales" />
                 <TabButton active={activeTab === 'profesional'} onClick={() => setActiveTab('profesional')} label="Datos Profesionales" />
                 <TabButton active={activeTab === 'disponibilidad'} onClick={() => setActiveTab('disponibilidad')} label="Disponibilidad" />
              </div>

              {/* === CONTENIDO DE LAS TABS === */}

              {/* 1. DATOS PERSONALES */}
              {activeTab === 'personal' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombres</label>
                     <input disabled={!isEditing} value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} style={inputStyle(isEditing)} />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Apellidos</label>
                     <input disabled={!isEditing} value={formData.apellidos} onChange={(e) => setFormData({...formData, apellidos: e.target.value})} style={inputStyle(isEditing)} />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Correo Electrónico</label>
                     <input disabled value={formData.email} style={{ ...inputStyle(false), backgroundColor: '#F3F4F6', cursor: 'not-allowed' }} />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teléfono</label>
                     <input disabled={!isEditing} value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} style={inputStyle(isEditing)} />
                   </div>
                   <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dirección Consultorio</label>
                     <input disabled={!isEditing} value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} style={inputStyle(isEditing)} />
                   </div>
                   <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Biografía Profesional</label>
                     <textarea disabled={!isEditing} value={formData.biografia} onChange={(e) => setFormData({...formData, biografia: e.target.value})} rows={4} style={{ ...inputStyle(isEditing), resize: 'none' }} />
                   </div>
                </div>
              )}

              {/* 2. DATOS PROFESIONALES */}
              {activeTab === 'profesional' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Especialidad</label>
                     <input disabled={!isEditing} value={formData.especialidad} onChange={(e) => setFormData({...formData, especialidad: e.target.value})} style={inputStyle(isEditing)} placeholder="Ej: Cardiología" />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Número de Licencia</label>
                     <input disabled={!isEditing} value={formData.licencia} onChange={(e) => setFormData({...formData, licencia: e.target.value})} style={inputStyle(isEditing)} placeholder="Ej: CMP-12345" />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Universidad</label>
                     <input disabled={!isEditing} value={formData.universidad} onChange={(e) => setFormData({...formData, universidad: e.target.value})} style={inputStyle(isEditing)} placeholder="Nombre de la universidad" />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Años de Experiencia</label>
                     <input disabled={!isEditing} value={formData.experiencia} onChange={(e) => setFormData({...formData, experiencia: e.target.value})} style={inputStyle(isEditing)} placeholder="Ej: 10" />
                   </div>
                </div>
              )}

              {/* 3. DISPONIBILIDAD (Diseño de Lista como tu imagen) */}
              {activeTab === 'disponibilidad' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Lista de Días */}
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((day) => (
                        <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '12px', backgroundColor: 'white' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#1F2937' }}>{day}</h4>
                                <span style={{ fontSize: '12px', color: '#6B7280' }}>09:00 - 17:00</span>
                            </div>
                            <button disabled={!isEditing} style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: 'white', cursor: isEditing ? 'pointer' : 'default', opacity: isEditing ? 1 : 0.5 }}>
                                Editar
                            </button>
                        </div>
                    ))}
                    <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#9CA3AF' }}>
                       <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> 
                       Configuración de horarios sujeta a aprobación
                    </div>
                </div>
              )}

              {/* BOTÓN GUARDAR */}
              {isEditing && (
                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ backgroundColor: '#2563EB', color: 'white', padding: '12px 32px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={16} />}
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Estilos auxiliares para limpiar el JSX
const inputStyle = (isEditing: boolean) => ({
    width: '100%',
    backgroundColor: isEditing ? 'white' : '#F9FAFB',
    border: isEditing ? '1px solid #2563EB' : 'none',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    transition: 'all 0.2s'
});

function TabButton({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 20px',
        borderRadius: '9999px',
        fontSize: '14px',
        fontWeight: '600',
        border: active ? '1px solid #111827' : '1px solid #E5E7EB',
        backgroundColor: active ? '#111827' : 'white',
        color: active ? 'white' : '#6B7280',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      {label}
    </button>
  );
}