'use client';

import { useState } from 'react';

export interface ResultadoBusqueda {
  id: number;
  titulo: string;
  url: string;
  frecuencia: number;
  num_palabras: number;
  num_palabras_unicas: number;
  enlaces_salientes: number;
  enlaces_entrantes: number;
  edits_por_dia: number;
  pagerank: number;
  longitud_promedio: number;
}

export function useBusqueda() {
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/busqueda?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResultados(data);
    } catch (err) {
      setError('Error al buscar.');
    } finally {
      setLoading(false);
    }
  };

  return { resultados, loading, error, buscar };
}
