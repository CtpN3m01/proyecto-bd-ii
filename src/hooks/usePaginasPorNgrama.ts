// src/hooks/usePaginasPorNgrama.ts
export async function obtenerPaginasPorNgrama(frase: string) {
  const encoded = encodeURIComponent(frase);
  const res = await fetch(`/api/Database/ngrams/${encoded}`);
  if (!res.ok) throw new Error('Error al obtener páginas');
  return await res.json();
}
