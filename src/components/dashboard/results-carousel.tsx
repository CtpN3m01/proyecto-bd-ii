import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, BarChart3, Users, Link2, Target, Search } from "lucide-react";
import { PaginaCompleta } from "@/hooks/useBusquedaPaginas";
import { useState } from "react";

interface ResultsCarouselProps {
  searchResults: PaginaCompleta[];
}

export default function ResultsCarousel({ searchResults }: ResultsCarouselProps) {
  const [filtrosPalabras, setFiltrosPalabras] = useState<{[key: number]: string}>({});
  const [busquedasActivas, setBusquedasActivas] = useState<{[key: number]: string}>({});
  
  if (searchResults.length === 0) return null;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  const handleFiltroChange = (paginaId: number, filtro: string) => {
    setFiltrosPalabras(prev => ({
      ...prev,
      [paginaId]: filtro
    }));
  };

  const ejecutarBusqueda = (paginaId: number) => {
    const filtro = filtrosPalabras[paginaId] || '';
    setBusquedasActivas(prev => ({
      ...prev,
      [paginaId]: filtro
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, paginaId: number) => {
    if (e.key === "Enter") {
      ejecutarBusqueda(paginaId);
    }
  };

  const filtrarPalabras = (palabras: any[], paginaId: number) => {
    const filtro = busquedasActivas[paginaId] || '';
    if (!filtro.trim()) return palabras;
    
    return palabras.filter(palabra => 
      palabra.palabra.toLowerCase().includes(filtro.toLowerCase())
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Páginas Encontradas</CardTitle>
        <CardDescription>
          {searchResults.length} página{searchResults.length !== 1 ? 's' : ''} encontrada{searchResults.length !== 1 ? 's' : ''} con estadísticas completas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel className="w-full">
          <CarouselContent>
            {searchResults.map((pagina, index) => (
              <CarouselItem key={pagina.id} className="basis-full">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{pagina.titulo}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ExternalLink className="h-4 w-4" />
                          <a 
                            href={pagina.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline truncate"
                          >
                            {pagina.url}
                          </a>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {index + 1} de {searchResults.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Estadísticas Generales */}
                    <div>
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Estadísticas Generales
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{formatNumber(pagina.num_palabras)}</div>
                          <div className="text-xs text-muted-foreground">Total palabras</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{formatNumber(pagina.num_palabras_unicas)}</div>
                          <div className="text-xs text-muted-foreground">Palabras únicas</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{pagina.longitud_promedio.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">Long. promedio</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{pagina.pagerank.toFixed(4)}</div>
                          <div className="text-xs text-muted-foreground">PageRank</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{formatNumber(pagina.enlaces_entrantes)}</div>
                          <div className="text-xs text-muted-foreground">Enlaces entrantes</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{formatNumber(pagina.enlaces_salientes)}</div>
                          <div className="text-xs text-muted-foreground">Enlaces salientes</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Grid de secciones */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Coincidencias Bigramas */}
                      <div>
                        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Link2 className="h-5 w-5" />
                          Similares por Bigramas
                        </h4>
                        <ScrollArea className="h-[300px] border rounded-md p-3">
                          {pagina.coincidencias_bigramas.length > 0 ? (
                            <div className="space-y-3">
                              {pagina.coincidencias_bigramas.map((coincidencia, idx) => (
                                <div key={idx} className="border-b pb-2 last:border-b-0">
                                  <div className="font-medium text-sm truncate" title={coincidencia.titulo}>
                                    {coincidencia.titulo}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate" title={coincidencia.url}>
                                    {coincidencia.url}
                                  </div>
                                  <Badge variant="secondary" className="mt-1">
                                    {coincidencia.cantidad_bigramas_comunes} bigramas
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground text-sm py-8">
                              No hay coincidencias de bigramas
                            </div>
                          )}
                        </ScrollArea>
                      </div>

                      {/* Coincidencias Trigramas */}
                      <div>
                        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Similares por Trigramas
                        </h4>
                        <ScrollArea className="h-[300px] border rounded-md p-3">
                          {pagina.coincidencias_trigramas.length > 0 ? (
                            <div className="space-y-3">
                              {pagina.coincidencias_trigramas.map((coincidencia, idx) => (
                                <div key={idx} className="border-b pb-2 last:border-b-0">
                                  <div className="font-medium text-sm truncate" title={coincidencia.titulo}>
                                    {coincidencia.titulo}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate" title={coincidencia.url}>
                                    {coincidencia.url}
                                  </div>
                                  <Badge variant="secondary" className="mt-1">
                                    {coincidencia.cantidad_trigramas_comunes} trigramas
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground text-sm py-8">
                              No hay coincidencias de trigramas
                            </div>
                          )}
                        </ScrollArea>
                      </div>

                      {/* Palabras y Porcentajes */}
                      <div>
                        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Palabras y Porcentajes
                        </h4>
                        {pagina.palabras_porcentajes.length > 0 ? (
                          <div className="space-y-3">
                            {/* Buscador local */}
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Input
                                  type="text"
                                  placeholder="Buscar palabra..."
                                  value={filtrosPalabras[pagina.id] || ''}
                                  onChange={(e) => handleFiltroChange(pagina.id, e.target.value)}
                                  onKeyPress={(e) => handleKeyPress(e, pagina.id)}
                                  className="text-sm"
                                />
                              </div>
                              <button
                                onClick={() => ejecutarBusqueda(pagina.id)}
                                className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                title="Buscar"
                              >
                                <Search className="h-4 w-4" />
                              </button>
                            </div>
                            
                            {/* Lista con scroll */}
                            <ScrollArea className="h-[250px] border rounded-md p-3">
                              {(() => {
                                const palabrasFiltradas = filtrarPalabras(pagina.palabras_porcentajes, pagina.id);
                                return palabrasFiltradas.length > 0 ? (
                                  <div className="space-y-2">
                                    {palabrasFiltradas.map((palabra, idx) => (
                                      <div key={`${palabra.palabra}-${idx}`} className="flex justify-between items-center border-b pb-1 last:border-b-0">
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-sm truncate">{palabra.palabra}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {formatNumber(palabra.frecuencia)} veces
                                          </div>
                                        </div>
                                        <Badge variant="outline" className="ml-2">
                                          {formatPercentage(palabra.porcentaje)}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center text-muted-foreground text-sm py-8">
                                    {busquedasActivas[pagina.id] 
                                      ? `No se encontraron palabras que contengan "${busquedasActivas[pagina.id]}"` 
                                      : "No hay datos de palabras"
                                    }
                                  </div>
                                );
                              })()}
                            </ScrollArea>
                            
                            {/* Contador de resultados */}
                            {busquedasActivas[pagina.id] && (
                              <div className="text-center text-xs text-muted-foreground">
                                {filtrarPalabras(pagina.palabras_porcentajes, pagina.id).length} de {pagina.palabras_porcentajes.length} palabras
                                {busquedasActivas[pagina.id] && (
                                  <span className="ml-2 text-primary">
                                    (filtrado por: "{busquedasActivas[pagina.id]}")
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="border rounded-md p-3">
                            <div className="text-center text-muted-foreground text-sm py-8">
                              No hay datos de palabras
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
}
