'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { obtenerDetallePagina } from '@/hooks/useDetallePagina';
import DetallePagina from '@/components/DetallePagina';

export default function PaginaDetalle() {
  const params = useParams() as { id: string };
  const id = params.id;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      obtenerDetallePagina(id)
        .then((res) => {
          if (!res?.pagina) {
            setError('Página no encontrada.');
          } else {
            setData(res);
          }
        })
        .catch(() => setError('Error al cargar detalles.'));
    }
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!data && !error && <p className="text-center text-gray-500">Cargando detalles...</p>}
      {data && <DetallePagina data={data} />}
    </div>
  );
}
