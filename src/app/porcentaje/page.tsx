'use client';

import { useEffect, useState } from 'react';

interface Pagina {
  id: number;
  titulo: string;
}

interface PalabraPorcentaje {
  palabra: string;
  porcentaje: number;
}

export default function PorcentajePage() {
  const [paginas, setPaginas] = useState<Pagina[]>([]);
  const [paginaId, setPaginaId] = useState<string | null>(null);
  const [palabras, setPalabras] = useState<PalabraPorcentaje[]>([]);

  useEffect(() => {
    // Obtener títulos de páginas disponibles
    fetch('/api/Database/pagina')
      .then(res => res.json())
      .then(setPaginas)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (paginaId) {
      fetch(`/api/Database/porcentaje-palabras/${paginaId}`)
        .then(res => res.json())
        .then(setPalabras)
        .catch(console.error);
    }
  }, [paginaId]);

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold text-purple-400 mb-4">Porcentaje de Palabras por Página</h1>

      <label className="block mb-2 text-sm text-gray-300">Seleccioná una página:</label>
      <select
        className="bg-white border p-2 rounded mb-4 w-full text-black"
        value={paginaId ?? ''}
        onChange={(e) => setPaginaId(e.target.value)}
      >
        <option value="" disabled>Seleccionar página...</option>
        {paginas.map((p) => (
          <option key={p.id} value={p.id}>{p.titulo}</option>
        ))}
      </select>

      {paginaId && (
        <table className="w-full border mt-2 text-sm">
          <thead className="bg-purple-200 text-black">
            <tr>
              <th className="p-2 text-left">Palabra</th>
              <th className="p-2 text-left">Porcentaje (%)</th>
            </tr>
          </thead>
          <tbody>
            {palabras.map((row, idx) => (
              <tr key={idx} className="border-t border-purple-100 text-white">
                <td className="p-2">{row.palabra}</td>
                <td className="p-2">{(row.porcentaje * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
