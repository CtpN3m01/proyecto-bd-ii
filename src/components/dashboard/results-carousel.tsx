import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface ResultsCarouselProps {
  searchResults: any[];
}

export default function ResultsCarousel({ searchResults }: ResultsCarouselProps) {
  if (searchResults.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados</CardTitle>
        <CardDescription>
          {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel className="w-full">
          <CarouselContent>
            {searchResults.map((result, index) => (
              <CarouselItem key={result.id || index} className="basis-full">
                <Card className="h-full">
                  <CardContent className="p-60">
                    <div className="space-y-4 text-center">
                      <h3 className="text-2xl font-bold">{result.title}</h3>
                      <p className="text-muted-foreground text-lg">{result.description}</p>
                      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Resultado {index + 1} de {searchResults.length}
                        </p>
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
