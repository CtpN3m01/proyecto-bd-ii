import { memo, useCallback, useMemo, useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search } from "lucide-react";

interface PalabrasPorcentajes {
  palabra: string;
  frecuencia: number;
  porcentaje: number;
}

interface PalabrasSectionProps {
  paginaId: number;
  palabras: PalabrasPorcentajes[];
  filtro: string;
  busquedaActiva: string;
  onFiltroChange: (paginaId: number, value: string) => void;
  onBuscar: (paginaId: number) => void;
}

// Componente optimizado para una sola palabra
const PalabraItem = memo(({ palabra, formatNumber, formatPercentage }: {
  palabra: PalabrasPorcentajes;
  formatNumber: (num: number) => string;
  formatPercentage: (num: number) => string;
}) => (
  <div className="flex justify-between items-center border-b pb-1 last:border-b-0">
    <div className="flex-1 min-w-0">
      <div className="font-medium text-sm truncate">{palabra.palabra}</div>
      <div className="text-xs text-muted-foreground">
        {formatNumber(palabra.frecuencia)} veces
      </div>
    </div>
    <Badge variant="outline" className="ml-2">
      {formatPercentage(palabra.porcentaje)}
    </Badge>
  </div>
));

PalabraItem.displayName = 'PalabraItem';

const PalabrasSection = memo(({ 
  paginaId, 
  palabras, 
  filtro, 
  busquedaActiva, 
  onFiltroChange, 
  onBuscar 
}: PalabrasSectionProps) => {
  // Usar un estado local para evitar re-renders del padre durante la escritura
  const [inputValue, setInputValue] = useState(filtro);

  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  }, []);

  const formatPercentage = useCallback((num: number) => {
    return `${num.toFixed(2)}%`;
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onFiltroChange(paginaId, inputValue);
      onBuscar(paginaId);
    }
  }, [onBuscar, onFiltroChange, paginaId, inputValue]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleSearch = useCallback(() => {
    onFiltroChange(paginaId, inputValue);
    onBuscar(paginaId);
  }, [onBuscar, onFiltroChange, paginaId, inputValue]);

  // Memoizar la lista filtrada solo cuando cambia busquedaActiva
  const palabrasFiltradas = useMemo(() => {
    if (!busquedaActiva.trim()) return palabras;
    
    const searchTerm = busquedaActiva.toLowerCase();
    return palabras.filter(palabra => 
      palabra.palabra.toLowerCase().includes(searchTerm)
    );
  }, [palabras, busquedaActiva]);

  // Sincronizar el input local con el filtro externo solo cuando cambia externamente
  useEffect(() => {
    if (filtro !== inputValue) {
      setInputValue(filtro);
    }
  }, [filtro]);

  return (
    <div>
      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Users className="h-5 w-5" />
        Palabras y Porcentajes
      </h4>
      {palabras.length > 0 ? (
        <div className="space-y-3">
          {/* Buscador local */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar palabra... (presiona Enter)"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              title="Buscar"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
          
          {/* Lista con scroll */}
          <ScrollArea className="h-[250px] border rounded-md p-3">
            {palabrasFiltradas.length > 0 ? (
              <div className="space-y-2">
                {palabrasFiltradas.map((palabra, idx) => (
                  <PalabraItem
                    key={`${palabra.palabra}-${idx}`}
                    palabra={palabra}
                    formatNumber={formatNumber}
                    formatPercentage={formatPercentage}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-8">
                {busquedaActiva 
                  ? `No se encontraron palabras que contengan "${busquedaActiva}"` 
                  : "No hay datos de palabras"
                }
              </div>
            )}
          </ScrollArea>
          
          {/* Contador de resultados */}
          {busquedaActiva && (
            <div className="text-center text-xs text-muted-foreground">
              {palabrasFiltradas.length} de {palabras.length} palabras
              <span className="ml-2 text-primary">
                (filtrado por: "{busquedaActiva}")
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-md p-3">
          <div className="text-center text-muted-foreground text-sm py-8">
            No hay datos de palabras
          </div>
        </div>
      )}
    </div>
  );
});

PalabrasSection.displayName = 'PalabrasSection';

export default PalabrasSection;
