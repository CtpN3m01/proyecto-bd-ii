'use client';

import { useState } from 'react';

export default function Buscador({ onBuscar }: { onBuscar: (query: string) => void }) {
  const [query, setQuery] = useState('');

  return (
    <div className=" max-w-xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-4 text-center">Buscador de Wikipedia</h1>
      <div className="flex items-center gap-2">
        <input
          className="w-full px-4 py-2 border rounded shadow"
          type="text"
          placeholder="Buscar palabra clave..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          onClick={() => onBuscar(query)}
        >
          Buscar
        </button>
      </div>
    </div>
  );
}
