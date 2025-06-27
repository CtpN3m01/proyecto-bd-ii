import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

interface TopBigrama {
  id: number;
  bigrama: string;
  frecuencia: number;
  pagina_id: number;
  titulo: string;
  url: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { bigrama } = req.query;

    if (!bigrama || typeof bigrama !== 'string') {
      return res.status(400).json({ 
        error: 'El parámetro "bigrama" es requerido' 
      });
    }

    console.log('🔍 Buscando bigramas para:', bigrama);

    const results = await query<TopBigrama>(
      `SELECT tb.*, p.titulo, p.url 
       FROM top_bigramas tb 
       JOIN pagina p ON tb.pagina_id = p.id 
       WHERE tb.bigrama LIKE ? 
       ORDER BY tb.frecuencia DESC 
       LIMIT 15`,
      [`${bigrama}%`]
    );

    console.log(`✅ Encontrados ${results.length} resultados para bigrama "${bigrama}"`);

    // Log de los primeros resultados para debug
    if (results.length > 0) {
      console.log('📊 Primer resultado:', results[0]);
    }

    // Transformar los datos al formato esperado por el frontend
    const formattedResults = results
      .filter(result => result && result.titulo && result.url && result.frecuencia !== undefined)
      .map((result, index) => {
        try {
          return {
            id: `bigrama-${index}`, // Generar un ID único
            titulo: result.titulo || 'Sin título',
            url: result.url || 'Sin URL',
            frecuencia: result.frecuencia || 0
          };
        } catch (error) {
          console.error('❌ Error al procesar resultado:', result, error);
          return null;
        }
      })
      .filter(result => result !== null);

    res.status(200).json({
      success: true,
      type: 'bigrama',
      query: bigrama,
      count: formattedResults.length,
      data: formattedResults
    });

  } catch (error) {
    console.error('❌ Error en API de bigramas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
