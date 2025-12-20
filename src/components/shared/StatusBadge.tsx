import { Badge } from "../ui/badge";
import { AppointmentStatus } from "../../types";
import { CheckCircle2, Clock, XCircle, Calendar } from "lucide-react";

interface StatusBadgeProps {
  status: AppointmentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<AppointmentStatus, { 
    label: string; 
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
    icon: React.ReactNode;
  }> = {
    programada: { 
      label: 'Programada', 
      variant: 'default',
      className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      icon: <Calendar className="w-3 h-3 mr-1" />
    },
    confirmada: { 
      label: 'Confirmada', 
      variant: 'default',
      className: 'bg-green-100 text-green-700 hover:bg-green-200',
      icon: <CheckCircle2 className="w-3 h-3 mr-1" />
    },
    pendiente: { 
      label: 'Pendiente', 
      variant: 'secondary',
      className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      icon: <Clock className="w-3 h-3 mr-1" />
    },
    cancelada: { 
      label: 'Cancelada', 
      variant: 'destructive',
      className: 'bg-red-100 text-red-700 hover:bg-red-200',
      icon: <XCircle className="w-3 h-3 mr-1" />
    },
    completada: { 
      label: 'Completada', 
      variant: 'outline',
      className: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      icon: <CheckCircle2 className="w-3 h-3 mr-1" />
    },
  };

  const config = variants[status] || variants.pendiente;

  return (
    <Badge variant={config.variant} className={`rounded-full flex items-center ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
