// src/app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { useBusqueda } from '@/hooks/useBusqueda';
import Link from 'next/link';

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const { resultados, loading, error, buscar } = useBusqueda();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) buscar(query);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Buscador de Wikipedia Analizada</h1>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-center mb-8">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-4 py-2 shadow-sm"
          placeholder="Buscar palabra clave (ej. universidad)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Buscar
        </button>
      </form>

      {loading && <p className="text-center">Buscando...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && resultados.length === 0 && query && (
        <p className="text-center text-gray-500">No se encontraron resultados.</p>
      )}

      <div className="grid gap-6">
        {resultados.map((r) => (
          <div key={r.id} className="bg-black rounded shadow p-4 border">
            <h2 className="text-xl font-semibold">{r.titulo}</h2>
            <a href={r.url} className="text-blue-500 text-sm" target="_blank">Ver en Wikipedia</a>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mt-2">
              <p><strong>Frecuencia:</strong> {r.frecuencia}</p>
              <p><strong>Palabras:</strong> {r.num_palabras}</p>
              <p><strong>Únicas:</strong> {r.num_palabras_unicas}</p>
              <p><strong>Links out:</strong> {r.enlaces_salientes}</p>
              <p><strong>Links in:</strong> {r.enlaces_entrantes}</p>
              <p><strong>Edits/día:</strong> {r.edits_por_dia}</p>
              <p><strong>PageRank:</strong> {r.pagerank.toFixed(4)}</p>
              <p><strong>Prom. longitud:</strong> {r.longitud_promedio.toFixed(2)}</p>
            </div>

            <Link
              href={`/pagina/${r.id}`}
              className="inline-block mt-4 text-blue-600 hover:underline"
            >
              Ver detalles →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
