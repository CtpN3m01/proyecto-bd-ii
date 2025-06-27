import { useState, useEffect } from 'react';

export interface DistribucionData {
  longitud: number;
  frecuencia_total: number;
}

interface UseDistribucionReturn {
  data: DistribucionData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDistribucion = (): UseDistribucionReturn => {
  const [data, setData] = useState<DistribucionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Obteniendo datos de distribución...');
      
      const response = await fetch('/api/distribucion-longitud');
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        console.log(`✅ ${result.total} registros de distribución cargados`);
      } else {
        throw new Error(result.error || 'Error en la respuesta de la API');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al obtener distribución: ${errorMessage}`);
      console.error('❌ Error en useDistribucion:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
};
