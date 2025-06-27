import { useState, useCallback } from 'react';

export interface PageResult {
  id: string;
  titulo: string;
  url: string;
  frecuencia: number;
}

export type NgramType = 'unigrama' | 'bigrama' | 'trigrama';

interface ApiResponse {
  success: boolean;
  type: NgramType;
  query: string;
  count: number;
  data: PageResult[];
  error?: string;
}

interface UseNgramSearchReturn {
  results: PageResult[];
  isLoading: boolean;
  error: string | null;
  ngramType: NgramType | null;
  searchNgrams: (query: string) => Promise<void>;
  clearResults: () => void;
}

export const useNgramSearch = (): UseNgramSearchReturn => {
  const [results, setResults] = useState<PageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ngramType, setNgramType] = useState<NgramType | null>(null);

  // Función para detectar el tipo de n-grama
  const detectNgramType = (query: string): NgramType | null => {
    if (!query.trim()) return null;
    
    const words = query.trim().split(/\s+/);
    
    if (words.length === 1) return 'unigrama';
    if (words.length === 2) return 'bigrama';
    if (words.length === 3) return 'trigrama';
    
    return null; // Más de 3 palabras no se procesa
  };

  // Función para obtener la URL de la API según el tipo
  const getApiUrl = (type: NgramType): string => {
    switch (type) {
      case 'unigrama':
        return '/api/ngrams/unigramas';
      case 'bigrama':
        return '/api/ngrams/bigramas';
      case 'trigrama':
        return '/api/ngrams/trigramas';
      default:
        throw new Error(`Tipo de n-grama no soportado: ${type}`);
    }
  };

  // Función principal de búsqueda
  const searchNgrams = useCallback(async (query: string): Promise<void> => {
    // Limpiar estado anterior
    setError(null);
    setResults([]);
    
    if (!query.trim()) {
      setNgramType(null);
      return;
    }

    // Detectar tipo de n-grama
    const detectedType = detectNgramType(query);
    setNgramType(detectedType);

    if (!detectedType) {
      setError('Solo se admiten búsquedas de 1, 2 o 3 palabras');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = getApiUrl(detectedType);
      const paramName = detectedType === 'unigrama' ? 'palabra' : 
                       detectedType === 'bigrama' ? 'bigrama' : 'trigrama';
      
      const response = await fetch(`${apiUrl}?${paramName}=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setResults(data.data);
        console.log(`✅ ${data.count} resultados encontrados para ${detectedType}: "${query}"`);
      } else {
        throw new Error(data.error || 'Error en la respuesta de la API');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al buscar ${detectedType}s: ${errorMessage}`);
      console.error('❌ Error en useNgramSearch:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para limpiar resultados
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setNgramType(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    ngramType,
    searchNgrams,
    clearResults
  };
};
