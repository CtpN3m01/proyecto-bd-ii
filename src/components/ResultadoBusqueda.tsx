interface Resultado {
    id: number;
    titulo: string;
    url: string;
    frecuencia: number;
  }
  
  interface Props {
    resultados: Resultado[];
    onSelect: (id: number) => void;
  }
  
  export default function ResultadoBusqueda({ resultados, onSelect }: Props) {
    if (!resultados.length) {
      return <p className="text-gray-500 text-sm mt-4">No se encontraron resultados.</p>;
    }
  
    return (
      <div className="bg-green space-y-3 mt-6">
        {resultados.map((res) => (
          <div
            key={res.id}
            className="p-4 bg-red rounded-lg shadow hover:shadow-md border border-gray-100 cursor-pointer transition-all hover:bg-blue-50"
            onClick={() => onSelect(res.id)}
          >
            <h3 className="text-lg font-semibold text-blue-800">{res.titulo}</h3>
            <p className="text-sm text-gray-500">{res.url}</p>
            <p className="text-sm text-gray-700">Aparece <strong>{res.frecuencia}</strong> veces</p>
          </div>
        ))}
      </div>
    );
  }
  