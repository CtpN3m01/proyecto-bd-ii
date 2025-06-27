import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

interface PaginaResult {
  id: number;
  titulo: string;
  url: string;
  num_palabras: number;
  num_palabras_unicas: number;
  enlaces_salientes: number;
  enlaces_entrantes: number;
  pagerank: number;
  longitud_promedio: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { titulo } = req.query;

    if (!titulo || typeof titulo !== 'string') {
      return res.status(400).json({ 
        error: 'El parámetro "titulo" es requerido' 
      });
    }

    const results = await query<PaginaResult>(
      `SELECT id, titulo, url, num_palabras, num_palabras_unicas, 
              enlaces_salientes, enlaces_entrantes, pagerank, longitud_promedio 
       FROM pagina 
       WHERE titulo LIKE ? 
       ORDER BY titulo ASC
       LIMIT 5`,
      [`%${titulo}%`]
    );

    return res.status(200).json({
      success: true,
      data: results,
      total: results.length,
      query: titulo
    });

  } catch (error) {
    console.error('❌ Error en API de búsqueda de páginas:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
