export async function obtenerDistribucionLongitud() {
    const res = await fetch('/api/Database/distribucion-longitud');
    if (!res.ok) throw new Error('Error al obtener distribución');
    return await res.json();
  }
  