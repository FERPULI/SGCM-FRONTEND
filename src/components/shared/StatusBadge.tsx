import { Badge } from "../ui/badge";
// Usamos string en lugar de AppointmentStatus estricto para evitar crasheos si la API cambia
interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Mapeo seguro: Incluye los estados viejos (activa/pendiente) y los NUEVOS del backend (programada/confirmada)
  const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
    // --- ESTADOS BACKEND (Lo que llega realmente) ---
    programada: { 
      label: 'Programada', 
      variant: 'outline',
      className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
    },
    confirmada: { 
      label: 'Confirmada', 
      variant: 'default',
      className: "bg-green-600 hover:bg-green-700" 
    },
    
    // --- ESTADOS LEGACY (Por si acaso quedan en la BD) ---
    activa: { label: 'Activa', variant: 'default' },
    pendiente: { label: 'Pendiente', variant: 'secondary' },
    
    // --- ESTADOS COMUNES ---
    cancelada: { label: 'Cancelada', variant: 'destructive' },
    completada: { label: 'Completada', variant: 'secondary', className: "bg-gray-200 text-gray-800" },
  };

  // Normalizamos a minúsculas para evitar errores de tipeo (Ej: "Programada" vs "programada")
  const normalizedStatus = status?.toLowerCase() || "";
  const config = variants[normalizedStatus];

  // PROTECCIÓN CONTRA PANTALLA BLANCA 🛡️
  // Si llega un estado que no conocemos, mostramos uno genérico en lugar de romper la app
  if (!config) {
    return (
      <Badge variant="outline" className="rounded-full bg-gray-100 text-gray-500">
        {status || "Desconocido"}
      </Badge>
    );
  }

  return (
    <Badge 
      variant={config.variant} 
      className={`rounded-full ${config.className || ''}`}
    >
      {config.label}
    </Badge>
  );
}