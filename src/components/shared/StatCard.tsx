// src/components/shared/StatCard.tsx

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  // CAMBIO: Aceptamos ReactNode (un elemento ya renderizado como <Icon />)
  // en lugar de LucideIcon (que obliga a pasar la función del componente)
  icon: ReactNode; 
  description?: string;
  trend?: string;
}

export function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {/* CAMBIO: Renderizamos el icono directamente entre llaves */}
        <div className="text-gray-500">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        {trend && (
          <p className="text-xs text-green-600 mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}