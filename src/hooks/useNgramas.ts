// src/hooks/useNgramas.ts
export async function obtenerNgramas() {
    const res = await fetch('/api/Database/ngrams');
    if (!res.ok) throw new Error('Error al obtener ngramas');
    return await res.json();
  }
  