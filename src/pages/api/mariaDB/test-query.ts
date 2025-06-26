import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        console.log('🔍 Iniciando consulta de prueba...');
        
        const paginas = await query<{ id: number; titulo: string; url: string }>(
            'SELECT id, titulo, url FROM pagina WHERE titulo LIKE ? LIMIT 10', 
            ['Colon%']
        );
        
        console.log(`✅ Consulta exitosa. Resultados encontrados: ${paginas.length}`);
        
        paginas.forEach((pagina, index) => {
            console.log(`${index + 1}. ID: ${pagina.id}, Título: ${pagina.titulo}`);
        });

        res.status(200).json({
            success: true,
            message: 'Consulta con función query ejecutada correctamente',
            count: paginas.length,
            data: paginas.map(p => ({
                id: p.id,
                titulo: p.titulo,
                url: p.url
            }))
        });
        
    } catch (error) {
        console.error('❌ Error en la consulta:', error);
        res.status(500).json({
            success: false,
            error: 'Error al ejecutar la consulta con función query',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}
