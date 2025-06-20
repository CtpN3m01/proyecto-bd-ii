'use client';

import { useEffect, useState } from 'react';
import { obtenerSimilaresBigramas } from '@/hooks/useSimilaresBigramas';
import { obtenerSimilaresTrigramas } from '@/hooks/useSimilaresTrigramas';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false
  });
  
interface Props {
  data: {
    pagina: any;
    top_palabras: { palabra: string; frecuencia: number }[];
  };
}

interface Similar {
  titulo: string;
  cantidad_bigramas_comunes?: number;
  cantidad_trigramas_comunes?: number;
}

interface GraphNode {
  id: string;
  group: number;
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export default function DetallePagina({ data }: Props) {
  const p = data.pagina;
  const [bigramas, setBigramas] = useState<Similar[]>([]);
  const [trigramas, setTrigramas] = useState<Similar[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

  useEffect(() => {
    obtenerSimilaresBigramas(p.id).then(setBigramas);
    obtenerSimilaresTrigramas(p.id).then(setTrigramas);
  }, [p.id]);

  useEffect(() => {
    const nodes = [
      { id: p.titulo, group: 1 },
      ...bigramas.map((b: any) => ({ id: b.titulo, group: 2 })),
      ...trigramas.map((t: any) => ({ id: t.titulo, group: 3 }))
    ];
    const links = [
      ...bigramas.map((b: any) => ({ source: p.titulo, target: b.titulo })),
      ...trigramas.map((t: any) => ({ source: p.titulo, target: t.titulo }))
    ];
    setGraphData({ nodes, links });
  }, [bigramas, trigramas, p.titulo]);

  return (
    <div className="mt-10 bg-black p-6 rounded-lg shadow border">
      {/* Botón de regreso */}
      <Link
        href="/dashboard"
        className="inline-block mb-4 text-sm text-blue-600 hover:underline"
      >
        ← Volver al buscador
      </Link>

      <h2 className="text-2xl font-bold mb-2">{p.titulo}</h2>
      <a className="text-blue-500 text-sm underline" href={p.url} target="_blank">Ver en Wikipedia</a>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
        <div>
          <p><strong>Total palabras:</strong> {p.num_palabras}</p>
          <p><strong>Únicas:</strong> {p.num_palabras_unicas}</p>
          <p><strong>Links salientes:</strong> {p.enlaces_salientes}</p>
          <p><strong>Links entrantes:</strong> {p.enlaces_entrantes}</p>
        </div>
        <div>
          <p><strong>Edits/día:</strong> {p.edits_por_dia}</p>
          <p><strong>PageRank:</strong> {p.pagerank}</p>
          <p><strong>Longitud prom. palabra:</strong> {p.longitud_promedio}</p>
        </div>
      </div>

      {/* Top palabras */}
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">Top palabras</h3>
        <ul className="list-disc ml-5">
          {data.top_palabras.map((tp, i) => (
            <li key={i}>{tp.palabra} ({tp.frecuencia})</li>
          ))}
        </ul>
      </div>

      {/* Similitud por bigramas */}
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">Páginas similares (Bigramas)</h3>
        <ul className="list-disc ml-5 text-sm">
          {bigramas.map((b, i) => (
            <li key={i}>{b.titulo} — {b.cantidad_bigramas_comunes} bigramas en común</li>
          ))}
        </ul>
      </div>

      {/* Similitud por trigramas */}
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">Páginas similares (Trigramas)</h3>
        <ul className="list-disc ml-5 text-sm">
          {trigramas.map((t, i) => (
            <li key={i}>{t.titulo} — {t.cantidad_trigramas_comunes} trigramas en común</li>
          ))}
        </ul>
      </div>

      {/* Grafo visual */}
      <div className="mt-8">
        <h3 className="font-semibold text-lg mb-2">Conexiones similares</h3>
        <div className="w-full h-[400px] bg-gray-50 border rounded shadow-inner">
          <ForceGraph2D
            graphData={graphData}
            nodeAutoColorBy="group"
            nodeLabel="id"
            linkDirectionalParticles={2}
            linkDirectionalArrowLength={4}
          />
        </div>
      </div>
    </div>
  );
}
