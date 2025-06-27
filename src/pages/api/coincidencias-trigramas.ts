import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

interface CoincidenciaTrigrama {
  pagina_id: number;
  titulo: string;
  url: string;
  cantidad_trigramas_comunes: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { pagina_id } = req.query;

    if (!pagina_id || typeof pagina_id !== 'string') {
      return res.status(400).json({ 
        error: 'El parámetro "pagina_id" es requerido' 
      });
    }

    const paginaIdNum = parseInt(pagina_id);
    
    console.log('🔍 Obteniendo coincidencias de trigramas para página ID:', paginaIdNum);

    const results = await query<CoincidenciaTrigrama>(
      `SELECT
        t.otro_id        AS pagina_id,
        p.titulo,
        p.url,
        t.cantidad_trigramas_comunes
      FROM (
        SELECT
          pagina_id_coincidente AS otro_id,
          cantidad_trigramas_comunes
        FROM coincidencia_trigramas
        WHERE pagina_id_base = ?

        UNION ALL

        SELECT
          pagina_id_base        AS otro_id,
          cantidad_trigramas_comunes
        FROM coincidencia_trigramas
        WHERE pagina_id_coincidente = ?
      ) AS t
      JOIN pagina p ON p.id = t.otro_id
      ORDER BY t.cantidad_trigramas_comunes DESC
      LIMIT 5`,
      [paginaIdNum, paginaIdNum]
    );

    console.log(`✅ Encontradas ${results.length} coincidencias de trigramas`);

    return res.status(200).json({
      success: true,
      data: results,
      total: results.length,
      pagina_id: paginaIdNum
    });

  } catch (error) {
    console.error('❌ Error en API de coincidencias trigramas:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
