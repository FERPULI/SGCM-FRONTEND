import { Badge } from "../ui/badge";
import { AppointmentStatus } from "../../types";

interface StatusBadgeProps {
  status: AppointmentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<AppointmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    activa: { label: 'Activa', variant: 'default' },
    pendiente: { label: 'Pendiente', variant: 'secondary' },
    cancelada: { label: 'Cancelada', variant: 'destructive' },
    completada: { label: 'Completada', variant: 'outline' },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className="rounded-full">
      {config.label}
    </Badge>
  );
}
