interface DashboardHeaderProps {
  title?: string;
  description?: string;
}

export default function DashboardHeader({ 
  title = "Dashboard de Búsqueda",
  description = "Busca y explora la información de tu base de datos"
}: DashboardHeaderProps) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
