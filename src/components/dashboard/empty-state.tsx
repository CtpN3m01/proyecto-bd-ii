import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

interface EmptyStateProps {
  isVisible: boolean;
}

export default function EmptyState({ isVisible }: EmptyStateProps) {
  if (!isVisible) return null;

  return (
    <Card>
      <CardContent className="p-12">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">No hay resultados</h3>
            <p className="text-muted-foreground">
              Realiza una búsqueda para ver los resultados aquí
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
