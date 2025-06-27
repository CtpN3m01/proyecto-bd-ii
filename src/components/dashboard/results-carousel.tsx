import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, BarChart3, Link2, Target } from "lucide-react";
import { PaginaCompleta } from "@/hooks/useBusquedaPaginas";
import { useState, useCallback, memo } from "react";
import PalabrasSection from "./palabras-section";

interface ResultsCarouselProps {
  searchResults: PaginaCompleta[];
}

const ResultsCarousel = memo(({ searchResults }: ResultsCarouselProps) => {
  const [filtrosPalabras, setFiltrosPalabras] = useState<{[key: number]: string}>({});
  const [busquedasActivas, setBusquedasActivas] = useState<{[key: number]: string}>({});
  
  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  }, []);

  const ejecutarBusqueda = useCallback((paginaId: number) => {
    const filtro = filtrosPalabras[paginaId] || '';
    setBusquedasActivas(prev => ({
      ...prev,
      [paginaId]: filtro
    }));
  }, [filtrosPalabras]);

  const handleInputChange = useCallback((paginaId: number, value: string) => {
    setFiltrosPalabras(prev => ({
      ...prev,
      [paginaId]: value
    }));
  }, []);

  if (searchResults.length === 0) return null;

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
                                  <a 
                                    href={coincidencia.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline truncate block"
                                    title={coincidencia.url}
                                  >
                                    {coincidencia.url}
                                  </a>
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
                                  <a 
                                    href={coincidencia.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline truncate block"
                                    title={coincidencia.url}
                                  >
                                    {coincidencia.url}
                                  </a>
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
                      <PalabrasSection
                        paginaId={pagina.id}
                        palabras={pagina.palabras_porcentajes}
                        filtro={filtrosPalabras[pagina.id] || ''}
                        busquedaActiva={busquedasActivas[pagina.id] || ''}
                        onFiltroChange={handleInputChange}
                        onBuscar={ejecutarBusqueda}
                      />
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
});

ResultsCarousel.displayName = 'ResultsCarousel';

export default ResultsCarousel;
