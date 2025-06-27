import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

interface DistribucionLongitud {
  longitud: number;
  frecuencia_total: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const results = await query<DistribucionLongitud>(
      'SELECT * FROM distribucion_longitud_palabra ORDER BY longitud ASC'
    );

    return res.status(200).json({
      success: true,
      data: results,
      total: results.length
    });

  } catch (error) {
    console.error('❌ Error en API de distribución de longitud:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
