export async function obtenerSimilaresTrigramas(id: string | number) {
    const res = await fetch(`/api/Database/similares-trigramas/${id}`);
    if (!res.ok) throw new Error('Error al obtener similitudes por trigramas');
    return await res.json();
  }
  