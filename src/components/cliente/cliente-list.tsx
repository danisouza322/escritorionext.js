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
import { Cliente } from "@/types";
import { formataDocumento, getTipoClienteLabel } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Search, Eye } from "lucide-react";

interface ClienteListProps {
  clientes: Cliente[];
}

export default function ClienteList({ clientes }: ClienteListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filtrar clientes com base no termo de busca
  const clientesFiltrados = clientes.filter((cliente) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      cliente.nome.toLowerCase().includes(searchTermLower) ||
      cliente.documento.toLowerCase().includes(searchTermLower) ||
      (cliente.email && cliente.email.toLowerCase().includes(searchTermLower))
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, documento ou email..."
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
              <TableHead className="hidden md:table-cell">Documento</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientesFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getTipoClienteLabel(cliente.tipo)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formataDocumento(cliente.documento, cliente.tipo)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {cliente.email || "--"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/clientes/${cliente.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only">Detalhes</span>
                      </Button>
                    </Link>
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
