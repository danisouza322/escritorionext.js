"use client";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Documento } from "@/types";
import { formataData, getTipoDocumentoLabel } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Download, 
  Share2,
  Eye
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DocumentoListProps {
  documentos: Documento[];
}

export default function DocumentoList({ documentos }: DocumentoListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // Filtrar documentos com base no termo de busca
  const documentosFiltrados = documentos.filter((documento) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      documento.nome.toLowerCase().includes(searchTermLower) ||
      (documento.descricao && documento.descricao.toLowerCase().includes(searchTermLower)) ||
      (documento.cliente && documento.cliente.nome.toLowerCase().includes(searchTermLower))
    );
  });

  const handleShare = async (documento: Documento) => {
    try {
      // Simular a cópia do link de compartilhamento
      await navigator.clipboard.writeText(
        `${window.location.origin}/compartilhado/${documento.linkCompartilhamento}`
      );
      
      toast({
        title: "Link copiado!",
        description: "O link de compartilhamento foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, descrição ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum documento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              documentosFiltrados.map((documento) => (
                <TableRow key={documento.id}>
                  <TableCell className="font-medium">{documento.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getTipoDocumentoLabel(documento.tipo)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {documento.cliente ? documento.cliente.nome : "--"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formataData(documento.dataCriacao)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleShare(documento)}>
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">Compartilhar</span>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={documento.caminho} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Visualizar</span>
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={documento.caminho} download>
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
