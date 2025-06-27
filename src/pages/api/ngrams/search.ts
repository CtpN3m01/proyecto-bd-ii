import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

interface PageResult {
  id: string;
  titulo: string;
  url: string;
  frecuencia: number;
}

interface NgramResult {
  id: number;
  frecuencia: number;
  pagina_id: number;
  titulo: string;
  url: string;
  palabra?: string;
  bigrama?: string;
  trigrama?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  let sqlQuery = '';

  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ 
        error: 'El parámetro "q" es requerido' 
      });
    }

    const searchQuery = q.trim();
    const words = searchQuery.split(/\s+/);
    
    let tableName = '';
    let columnName = '';
    let ngramType = '';

    // Determinar qué tipo de n-grama buscar
    if (words.length === 1) {
      tableName = 'unigrama';
      columnName = 'palabra';
      ngramType = 'unigrama';
    } else if (words.length === 2) {
      tableName = 'bigrama';
      columnName = 'bigrama';
      ngramType = 'bigrama';
    } else if (words.length === 3) {
      tableName = 'trigrama';
      columnName = 'trigrama';
      ngramType = 'trigrama';
    } else {
      return res.status(400).json({
        error: 'Solo se admiten búsquedas de 1, 2 o 3 palabras',
        type: null
      });
    }

    // Construir la query SQL
    sqlQuery = `
      SELECT t.*, p.titulo, p.url 
      FROM ${tableName} t 
      JOIN pagina p ON t.pagina_id = p.id 
      WHERE t.${columnName} LIKE ? 
      ORDER BY t.frecuencia DESC 
      LIMIT 15
    `;

    const results = await query<NgramResult>(sqlQuery, [`${searchQuery}%`]);

    // Transformar los datos al formato esperado por el frontend
    const formattedResults: PageResult[] = results.map(result => ({
      id: result.id.toString(),
      titulo: result.titulo,
      url: result.url,
      frecuencia: result.frecuencia
    }));

    res.status(200).json({
      success: true,
      type: ngramType,
      query: searchQuery,
      count: formattedResults.length,
      data: formattedResults
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
