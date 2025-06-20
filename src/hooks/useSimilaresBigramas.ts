export async function obtenerSimilaresBigramas(id: string | number) {
    const res = await fetch(`/api/Database/similares-bigramas/${id}`);
    if (!res.ok) throw new Error('Error al obtener similitudes por bigramas');
    return await res.json();
  }
  