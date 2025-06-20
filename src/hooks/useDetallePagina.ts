export async function obtenerDetallePagina(id: string | number) {
    const res = await fetch(`/api/Database/pagina/${id}`);
    if (!res.ok) throw new Error('Error al obtener detalle');
    return await res.json();
  }
  