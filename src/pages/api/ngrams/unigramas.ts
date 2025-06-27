import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

interface TopUnigrama {
  id: number;
  palabra: string;
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
    const { palabra } = req.query;

    if (!palabra || typeof palabra !== 'string') {
      return res.status(400).json({ 
        error: 'El parámetro "palabra" es requerido' 
      });
    }

    const results = await query<TopUnigrama>(
      `SELECT tu.*, p.titulo, p.url 
       FROM top_unigramas tu 
       JOIN pagina p ON tu.pagina_id = p.id 
       WHERE tu.palabra LIKE ? 
       ORDER BY tu.frecuencia DESC 
       LIMIT 15`,
      [`${palabra}%`]
    );

    // Transformar los datos al formato esperado por el frontend
    const formattedResults = results
      .filter(result => result && result.titulo && result.url && result.frecuencia !== undefined)
      .map((result, index) => {
        try {
          return {
            id: `unigrama-${index}`, // Generar un ID único
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
      type: 'unigrama',
      query: palabra,
      count: formattedResults.length,
      data: formattedResults
    });

  } catch (error) {
    console.error('❌ Error en API de unigramas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
