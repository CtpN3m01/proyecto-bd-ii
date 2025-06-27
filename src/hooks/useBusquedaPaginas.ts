import { useState, useCallback } from 'react';

export interface PaginaDetalle {
  id: number;
  titulo: string;
  url: string;
  num_palabras: number;
  num_palabras_unicas: number;
  enlaces_salientes: number;
  enlaces_entrantes: number;
  pagerank: number;
  longitud_promedio: number;
}

export interface CoincidenciaBigrama {
  pagina_id: number;
  titulo: string;
  url: string;
  cantidad_bigramas_comunes: number;
}

export interface CoincidenciaTrigrama {
  pagina_id: number;
  titulo: string;
  url: string;
  cantidad_trigramas_comunes: number;
}

export interface PalabraPorcentaje {
  palabra: string;
  frecuencia: number;
  porcentaje: number;
}

export interface PaginaCompleta extends PaginaDetalle {
  coincidencias_bigramas: CoincidenciaBigrama[];
  coincidencias_trigramas: CoincidenciaTrigrama[];
  palabras_porcentajes: PalabraPorcentaje[];
}

interface UseBusquedaPaginasReturn {
  resultados: PaginaCompleta[];
  isLoading: boolean;
  error: string | null;
  buscarPaginas: (titulo: string) => Promise<void>;
  clearResultados: () => void;
}

export const useBusquedaPaginas = (): UseBusquedaPaginasReturn => {
  const [resultados, setResultados] = useState<PaginaCompleta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerDetallesCompletos = async (pagina: PaginaDetalle): Promise<PaginaCompleta> => {
    try {
      // Obtener coincidencias de bigramas
      const bigramasResponse = await fetch(`/api/coincidencias-bigramas?pagina_id=${pagina.id}`);
      const bigramasData = await bigramasResponse.json();

      // Obtener coincidencias de trigramas
      const trigramasResponse = await fetch(`/api/coincidencias-trigramas?pagina_id=${pagina.id}`);
      const trigramasData = await trigramasResponse.json();

      // Obtener palabras y porcentajes
      const palabrasResponse = await fetch(`/api/palabras-porcentajes?pagina_id=${pagina.id}`);
      const palabrasData = await palabrasResponse.json();

      return {
        ...pagina,
        coincidencias_bigramas: bigramasData.success ? bigramasData.data : [],
        coincidencias_trigramas: trigramasData.success ? trigramasData.data : [],
        palabras_porcentajes: palabrasData.success ? palabrasData.data : []
      };
    } catch (err) {
      console.error('Error obteniendo detalles para página:', pagina.id, err);
      return {
        ...pagina,
        coincidencias_bigramas: [],
        coincidencias_trigramas: [],
        palabras_porcentajes: []
      };
    }
  };

  const buscarPaginas = useCallback(async (titulo: string): Promise<void> => {
    setError(null);
    setResultados([]);
    
    if (!titulo.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔍 Buscando páginas con título:', titulo);
      
      const response = await fetch(`/api/buscar-paginas?titulo=${encodeURIComponent(titulo)}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data.length > 0) {
        console.log(`✅ ${data.total} páginas encontradas, obteniendo detalles...`);
        
        // Obtener detalles completos para cada página
        const paginasCompletas = await Promise.all(
          data.data.map((pagina: PaginaDetalle) => obtenerDetallesCompletos(pagina))
        );

        setResultados(paginasCompletas);
        console.log(`📦 ${paginasCompletas.length} páginas con detalles completos cargadas`);
      } else {
        setResultados([]);
        console.log('📭 No se encontraron páginas');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al buscar páginas: ${errorMessage}`);
      console.error('❌ Error en useBusquedaPaginas:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResultados = useCallback(() => {
    setResultados([]);
    setError(null);
  }, []);

  return {
    resultados,
    isLoading,
    error,
    buscarPaginas,
    clearResultados
  };
};
