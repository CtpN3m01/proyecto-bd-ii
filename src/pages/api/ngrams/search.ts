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

  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ 
        error: 'El parámetro "q" (query) es requerido' 
      });
    }

    const searchQuery = q.trim();
    const words = searchQuery.split(/\s+/);
    
    let ngramType: 'unigrama' | 'bigrama' | 'trigrama' | null = null;
    let sqlQuery = '';
    let tableName = '';
    let columnName = '';

    // Detectar tipo y construir query correspondiente
    if (words.length === 1) {
      ngramType = 'unigrama';
      tableName = 'top_unigramas';
      columnName = 'palabra';
    } else if (words.length === 2) {
      ngramType = 'bigrama';
      tableName = 'top_bigramas';
      columnName = 'bigrama';
    } else if (words.length === 3) {
      ngramType = 'trigrama';
      tableName = 'top_trigramas';
      columnName = 'trigrama';
    } else {
      return res.status(400).json({
        success: false,
        error: 'Solo se admiten búsquedas de 1, 2 o 3 palabras',
        type: null
      });
    }

    console.log(`🔍 Buscando ${ngramType} para:`, searchQuery);

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

    console.log(`✅ Encontrados ${results.length} resultados para ${ngramType} "${searchQuery}"`);

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
    console.error('❌ Error en API de búsqueda de n-gramas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
