"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle } from "lucide-react";
import { useNgramSearch, PageResult, NgramType } from "@/hooks/useNgramSearch";

interface NgramSearchProps {
  onPageSelect?: (page: PageResult) => void;
  selectedPage?: PageResult;
}

export default function NgramSearch({ onPageSelect, selectedPage }: NgramSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    results, 
    isLoading, 
    error, 
    ngramType, 
    searchNgrams, 
    clearResults 
  } = useNgramSearch();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      clearResults();
      return;
    }

    await searchNgrams(searchQuery);
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

  const getNgramTypeLabel = (type: NgramType | null) => {
    switch (type) {
      case "unigrama": return "Unigrama";
      case "bigrama": return "Bigrama";
      case "trigrama": return "Trigrama";
      default: return "";
    }
  };

  return (
    <Card className="h-full ">
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

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Tabla de resultados */}
        {results.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Top {getNgramTypeLabel(ngramType)} - "{searchQuery}"
            </h3>
            <ScrollArea className="h-[400px] border rounded-md">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[45%]">Título de la Página</TableHead>
                    <TableHead className="w-[40%]">URL</TableHead>
                    <TableHead className="w-[15%] text-center">Frecuencia</TableHead>
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
                      <TableCell className="font-medium w-[45%] max-w-0">
                        <div className="truncate pr-2" title={page.titulo}>
                          {page.titulo}
                        </div>
                      </TableCell>
                      <TableCell className="w-[40%] max-w-0">
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline truncate block pr-2 max-w-full"
                          title={page.url}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {page.url}
                        </a>
                      </TableCell>
                      <TableCell className="w-[15%] text-center min-w-0">
                        <Badge variant="secondary">{page.frecuencia}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}

        {/* Estado vacío */}
        {!searchQuery.trim() && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Busca un N-Gram</h3>
            <p className="text-muted-foreground">
              Ingresa una palabra, frase de 2 palabras o frase de 3 palabras para comenzar
            </p>
          </div>
        )}

        {/* Sin resultados */}
        {searchQuery.trim() && results.length === 0 && !isLoading && !error && ngramType && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron resultados</h3>
            <p className="text-muted-foreground">
              No hay páginas que contengan "{searchQuery}" como {getNgramTypeLabel(ngramType).toLowerCase()}
            </p>
          </div>
        )}

        {/* Tipo no soportado */}
        {searchQuery.trim() && !ngramType && !isLoading && !error && (
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
