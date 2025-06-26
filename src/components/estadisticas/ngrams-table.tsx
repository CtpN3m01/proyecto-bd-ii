"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface NGramData {
  id: string;
  ngram: string;
  frequency: number;
  pages: number;
}

interface NgramsTableProps {
  onNgramSelect: (ngram: NGramData) => void;
  selectedNgram?: NGramData;
}

export default function NgramsTable({ onNgramSelect, selectedNgram }: NgramsTableProps) {
  const [activeTab, setActiveTab] = useState("unigramas");

  // Datos de ejemplo - aquí conectarás con tu API
  const mockData = {
    unigramas: [
      { id: "1", ngram: "web", frequency: 1250, pages: 450 },
      { id: "2", ngram: "desarrollo", frequency: 980, pages: 320 },
      { id: "3", ngram: "javascript", frequency: 875, pages: 290 },
      { id: "4", ngram: "react", frequency: 720, pages: 245 },
      { id: "5", ngram: "programación", frequency: 680, pages: 220 },
      { id: "6", ngram: "tecnología", frequency: 620, pages: 180 },
      { id: "7", ngram: "software", frequency: 580, pages: 165 },
      { id: "8", ngram: "código", frequency: 540, pages: 150 },
    ],
    bigramas: [
      { id: "1", ngram: "desarrollo web", frequency: 650, pages: 280 },
      { id: "2", ngram: "javascript react", frequency: 420, pages: 160 },
      { id: "3", ngram: "programación web", frequency: 380, pages: 140 },
      { id: "4", ngram: "tecnología moderna", frequency: 350, pages: 120 },
      { id: "5", ngram: "software libre", frequency: 320, pages: 110 },
      { id: "6", ngram: "código fuente", frequency: 290, pages: 95 },
      { id: "7", ngram: "base datos", frequency: 270, pages: 85 },
      { id: "8", ngram: "inteligencia artificial", frequency: 250, pages: 80 },
    ],
    trigramas: [
      { id: "1", ngram: "desarrollo web moderno", frequency: 280, pages: 95 },
      { id: "2", ngram: "javascript react native", frequency: 210, pages: 70 },
      { id: "3", ngram: "programación orientada objetos", frequency: 180, pages: 60 },
      { id: "4", ngram: "base de datos", frequency: 160, pages: 55 },
      { id: "5", ngram: "inteligencia artificial machine", frequency: 140, pages: 45 },
      { id: "6", ngram: "software libre código", frequency: 120, pages: 40 },
      { id: "7", ngram: "tecnología web moderna", frequency: 110, pages: 35 },
      { id: "8", ngram: "desarrollo frontend backend", frequency: 95, pages: 30 },
    ]
  };

  const handleRowClick = (ngram: NGramData) => {
    onNgramSelect(ngram);
  };

  const renderTable = (data: NGramData[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>N-Gram</TableHead>
          <TableHead className="text-center">Frecuencia</TableHead>
          <TableHead className="text-center">Páginas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow 
            key={item.id}
            className={`cursor-pointer hover:bg-muted/50 transition-colors ${
              selectedNgram?.id === item.id ? 'bg-accent' : ''
            }`}
            onClick={() => handleRowClick(item)}
          >
            <TableCell className="font-medium">{item.ngram}</TableCell>
            <TableCell className="text-center">
              <Badge variant="secondary">{item.frequency.toLocaleString()}</Badge>
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="outline">{item.pages}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>N-Grams</CardTitle>
        <CardDescription>
          Análisis de frecuencia de palabras y frases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unigramas">Unigramas</TabsTrigger>
            <TabsTrigger value="bigramas">Bigramas</TabsTrigger>
            <TabsTrigger value="trigramas">Trigramas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="unigramas" className="mt-4">
            {renderTable(mockData.unigramas)}
          </TabsContent>
          
          <TabsContent value="bigramas" className="mt-4">
            {renderTable(mockData.bigramas)}
          </TabsContent>
          
          <TabsContent value="trigramas" className="mt-4">
            {renderTable(mockData.trigramas)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
