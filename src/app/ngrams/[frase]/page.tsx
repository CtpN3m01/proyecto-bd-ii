// src/app/ngrams/[frase]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { obtenerPaginasPorNgrama } from '@/hooks/usePaginasPorNgrama';
import Link from 'next/link';

export default function PaginasPorNgramaPage() {
  const params = useParams();
  const frase = decodeURIComponent(params?.frase?.toString() ?? '');
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (frase) {
      obtenerPaginasPorNgrama(frase)
        .then(setResultados)
        .catch(() => setError('Error al cargar los resultados.'));
    }
  }, [frase]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        Páginas con “{frase}”
      </h1>
      {error && <p className="text-red-500">{error}</p>}
      {!error && resultados.length === 0 && (
        <p className="text-gray-500 text-sm">No hay resultados disponibles para esta frase.</p>
      )}
      <ul className="mt-4 space-y-2 text-sm">
        {resultados.map((r: any, idx: number) => (
          <li key={idx} className="border-b pb-2">
            <Link href={`/pagina/${r.pagina_id}`} className="text-blue-600 font-semibold hover:underline">
              {r.titulo}
            </Link>{' '}
            — {r.frecuencia} apariciones
          </li>
        ))}
      </ul>
    </div>
  );
}
