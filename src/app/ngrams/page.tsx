// src/app/ngrams/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { obtenerNgramas } from '@/hooks/useNgramas';
import Link from 'next/link';

export default function NgramPage() {
  const [ngrams, setNgrams] = useState([]);

  useEffect(() => {
    obtenerNgramas().then(setNgrams).catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Frases más frecuentes (N-gramas)</h1>
      <ul className="space-y-2 text-sm">
        {ngrams.map((ng: any, idx: number) => (
          <li key={idx} className="border-b pb-2">
            <Link
              href={`/ngrams/${encodeURIComponent(ng.frase)}`}
              className="text-blue-600 hover:underline font-semibold"
            >
              {ng.frase}
            </Link>{' '}
            — {ng.frecuencia} apariciones ({ng.longitud}-grama)
          </li>
        ))}
      </ul>
    </div>
  );
}
