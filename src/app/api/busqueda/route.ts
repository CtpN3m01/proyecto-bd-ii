
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db'; // ← Cambia esto, usa destructuración

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query') ?? '';
  if (!query) return NextResponse.json([], { status: 200 });

  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        p.id, p.titulo, p.url, 
        p.num_palabras, p.num_palabras_unicas, 
        p.enlaces_salientes, p.enlaces_entrantes, 
        p.edits_por_dia, p.pagerank, p.longitud_promedio, 
        pp.frecuencia
      FROM palabra_pagina pp
      JOIN pagina p ON pp.pagina_id = p.id
      WHERE pp.palabra = ?
      ORDER BY pp.frecuencia DESC
      `,
      [query]
    );
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error en la consulta' }, { status: 500 });
  }
}
