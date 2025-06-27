import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

interface TopTrigrama {
  id: number;
  trigrama: string;
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
    const { trigrama } = req.query;

    if (!trigrama || typeof trigrama !== 'string') {
      return res.status(400).json({ 
        error: 'El parámetro "trigrama" es requerido' 
      });
    }

    const results = await query<TopTrigrama>(
      `SELECT tt.*, p.titulo, p.url 
       FROM top_trigramas tt 
       JOIN pagina p ON tt.pagina_id = p.id 
       WHERE tt.trigrama LIKE ? 
       ORDER BY tt.frecuencia DESC 
       LIMIT 15`,
      [`${trigrama}%`]
    );

    // Transformar los datos al formato esperado por el frontend
    const formattedResults = results
      .filter(result => result && result.titulo && result.url && result.frecuencia !== undefined)
      .map((result, index) => {
        try {
          return {
            id: `trigrama-${index}`, // Generar un ID único
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
      type: 'trigrama',
      query: trigrama,
      count: formattedResults.length,
      data: formattedResults
    });

  } catch (error) {
    console.error('❌ Error en API de trigramas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
