"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink } from "lucide-react";

interface PageResult {
  id: string;
  titulo: string;
  url: string;
  frecuencia: number;
}

interface NgramSearchProps {
  onPageSelect?: (page: PageResult) => void;
  selectedPage?: PageResult;
}

export default function NgramSearch({ onPageSelect, selectedPage }: NgramSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PageResult[]>([]);
  const [ngramType, setNgramType] = useState<"unigrama" | "bigrama" | "trigrama" | null>(null);

  // Función para detectar el tipo de n-grama
  const detectNgramType = (query: string): "unigrama" | "bigrama" | "trigrama" | null => {
    if (!query.trim()) return null;
    
    const words = query.trim().split(/\s+/);
    
    if (words.length === 1) return "unigrama";
    if (words.length === 2) return "bigrama";
    if (words.length === 3) return "trigrama";
    
    return null; // Más de 3 palabras no se procesa
  };

  // Datos de ejemplo - aquí conectarás con tu API
  const getMockResults = (query: string, type: "unigrama" | "bigrama" | "trigrama"): PageResult[] => {
    const mockData = {
      unigrama: [
        { id: "1", titulo: "Desarrollo Web Moderno con React", url: "https://example.com/react-dev", frecuencia: 45 },
        { id: "2", titulo: "Guía Completa de JavaScript", url: "https://example.com/js-guide", frecuencia: 38 },
        { id: "3", titulo: "Tutorial de Node.js", url: "https://example.com/nodejs", frecuencia: 32 },
        { id: "4", titulo: "Programación Frontend", url: "https://example.com/frontend", frecuencia: 28 },
        { id: "5", titulo: "Desarrollo Backend", url: "https://example.com/backend", frecuencia: 25 },
      ],
      bigrama: [
        { id: "1", titulo: "Desarrollo Web: Guía Completa", url: "https://example.com/web-dev-guide", frecuencia: 67 },
        { id: "2", titulo: "Curso de Desarrollo Web", url: "https://example.com/web-course", frecuencia: 54 },
        { id: "3", titulo: "Desarrollo Web con JavaScript", url: "https://example.com/js-web", frecuencia: 41 },
        { id: "4", titulo: "Desarrollo Web Frontend", url: "https://example.com/frontend-web", frecuencia: 35 },
        { id: "5", titulo: "Desarrollo Web Responsive", url: "https://example.com/responsive", frecuencia: 29 },
      ],
      trigrama: [
        { id: "1", titulo: "Full Stack Developer: Carrera Completa", url: "https://example.com/fullstack-career", frecuencia: 89 },
        { id: "2", titulo: "Cómo ser Full Stack Developer", url: "https://example.com/become-fullstack", frecuencia: 76 },
        { id: "3", titulo: "Full Stack Developer Roadmap", url: "https://example.com/fullstack-roadmap", frecuencia: 65 },
        { id: "4", titulo: "Full Stack Developer Skills", url: "https://example.com/fullstack-skills", frecuencia: 52 },
        { id: "5", titulo: "Full Stack Developer Jobs", url: "https://example.com/fullstack-jobs", frecuencia: 43 },
      ]
    };

    return mockData[type] || [];
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      setNgramType(null);
      return;
    }

    setIsLoading(true);
    
    try {
      const detectedType = detectNgramType(searchQuery);
      setNgramType(detectedType);
      
      if (detectedType) {
        // Aquí harías la llamada a tu API real
        // const response = await fetch(`/api/ngrams/${detectedType}?query=${encodeURIComponent(searchQuery)}`);
        // const data = await response.json();
        
        // Por ahora usamos datos mock
        const mockResults = getMockResults(searchQuery, detectedType);
        setResults(mockResults);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageClick = (page: PageResult) => {
    if (onPageSelect) {
      onPageSelect(page);
    }
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const getNgramTypeLabel = (type: "unigrama" | "bigrama" | "trigrama" | null) => {
    switch (type) {
      case "unigrama": return "Unigrama";
      case "bigrama": return "Bigrama";
      case "trigrama": return "Trigrama";
      default: return "";
    }
  };

  useEffect(() => {
    const type = detectNgramType(searchQuery);
    setNgramType(type);
  }, [searchQuery]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Búsqueda de N-Grams</CardTitle>
        <CardDescription>
          Busca palabras o frases. Se detectará automáticamente si es unigrama, bigrama o trigrama.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Buscador */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ej: hola, desarrollador web, full stack developer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
            className="px-4"
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">Buscar</span>
          </Button>
        </div>

        {/* Indicador de tipo detectado */}
        {ngramType && searchQuery.trim() && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tipo detectado:</span>
            <Badge variant="outline">{getNgramTypeLabel(ngramType)}</Badge>
          </div>
        )}

        {/* Tabla de resultados */}
        {results.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Top {getNgramTypeLabel(ngramType)} - "{searchQuery}"
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título de la Página</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-center">Frecuencia</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((page) => (
                  <TableRow 
                    key={page.id}
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedPage?.id === page.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => handlePageClick(page)}
                  >
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate" title={page.titulo}>
                        {page.titulo}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-muted-foreground" title={page.url}>
                        {page.url}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{page.frecuencia}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          openUrl(page.url);
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Estado vacío */}
        {!searchQuery.trim() && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Busca un N-Gram</h3>
            <p className="text-muted-foreground">
              Ingresa una palabra, frase de 2 palabras o frase de 3 palabras para comenzar
            </p>
          </div>
        )}

        {/* Sin resultados */}
        {searchQuery.trim() && results.length === 0 && !isLoading && ngramType && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron resultados</h3>
            <p className="text-muted-foreground">
              No hay páginas que contengan "{searchQuery}" como {getNgramTypeLabel(ngramType).toLowerCase()}
            </p>
          </div>
        )}

        {/* Tipo no soportado */}
        {searchQuery.trim() && !ngramType && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Tipo no soportado</h3>
            <p className="text-muted-foreground">
              Solo se admiten búsquedas de 1, 2 o 3 palabras (unigramas, bigramas o trigramas)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
