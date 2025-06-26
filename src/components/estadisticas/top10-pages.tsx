"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe } from "lucide-react";

interface PageData {
  id: string;
  url: string;
  title: string;
  copies: number;
  domain: string;
}

interface NGramData {
  id: string;
  ngram: string;
  frequency: number;
  pages: number;
}

interface Top10PagesProps {
  selectedNgram?: NGramData;
  onPageSelect: (page: PageData) => void;
  selectedPage?: PageData;
}

export default function Top10Pages({ selectedNgram, onPageSelect, selectedPage }: Top10PagesProps) {
  // Datos de ejemplo - aquí conectarás con tu API
  const mockPages: PageData[] = [
    {
      id: "1",
      url: "https://developer.mozilla.org/web-development",
      title: "Desarrollo Web - MDN Web Docs",
      copies: 45,
      domain: "developer.mozilla.org"
    },
    {
      id: "2",
      url: "https://reactjs.org/docs/getting-started",
      title: "Getting Started – React",
      copies: 38,
      domain: "reactjs.org"
    },
    {
      id: "3",
      url: "https://javascript.info/intro",
      title: "JavaScript.info - The Modern Tutorial",
      copies: 32,
      domain: "javascript.info"
    },
    {
      id: "4",
      url: "https://www.w3schools.com/js/",
      title: "JavaScript Tutorial - W3Schools",
      copies: 28,
      domain: "w3schools.com"
    },
    {
      id: "5",
      url: "https://nodejs.org/en/docs/",
      title: "Node.js Documentation",
      copies: 25,
      domain: "nodejs.org"
    },
    {
      id: "6",
      url: "https://angular.io/guide/setup-local",
      title: "Setting up Angular - Angular",
      copies: 22,
      domain: "angular.io"
    },
    {
      id: "7",
      url: "https://vuejs.org/guide/introduction.html",
      title: "Introduction — Vue.js",
      copies: 19,
      domain: "vuejs.org"
    },
    {
      id: "8",
      url: "https://expressjs.com/en/starter/installing.html",
      title: "Installing Express.js",
      copies: 17,
      domain: "expressjs.com"
    },
    {
      id: "9",
      url: "https://webpack.js.org/concepts/",
      title: "Concepts | webpack",
      copies: 15,
      domain: "webpack.js.org"
    },
    {
      id: "10",
      url: "https://babeljs.io/docs/en/",
      title: "Babel · The compiler for next generation JavaScript",
      copies: 12,
      domain: "babeljs.io"
    }
  ];

  if (!selectedNgram) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Selecciona un N-Gram</h3>
              <p className="text-muted-foreground">
                Haz clic en cualquier N-Gram de la tabla para ver las páginas que más lo contienen
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handlePageClick = (page: PageData) => {
    onPageSelect(page);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top 10 Páginas</CardTitle>
        <CardDescription>
          Páginas con más copias de "{selectedNgram.ngram}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockPages.map((page, index) => (
            <div
              key={page.id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedPage?.id === page.id ? 'bg-accent border-accent-foreground/20' : ''
              }`}
              onClick={() => handlePageClick(page)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{page.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{page.domain}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{page.copies} copias</Badge>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
