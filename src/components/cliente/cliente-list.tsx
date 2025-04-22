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
import { Search, Eye, Pencil, UserPlus } from "lucide-react";
import ClienteForm from "./cliente-form";
import RemoveClienteButton from "./remove-cliente-button";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClienteListProps {
  clientes: Cliente[];
}

export default function ClienteList({ clientes: clientesIniciais }: ClienteListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais);
  const router = useRouter();
  
  // Buscar detalhes do cliente para edição
  const buscarDetalhesCliente = async (clienteId: number) => {
    try {
      const response = await fetch(`/api/clientes/${clienteId}`);
      if (response.ok) {
        const clienteDetalhes = await response.json();
        setClienteSelecionado(clienteDetalhes);
      } else {
        console.error("Erro ao buscar detalhes do cliente");
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do cliente:", error);
    }
  };
  
  // Filtrar clientes com base no termo de busca
  const clientesFiltrados = clientes.filter((cliente) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      cliente.nome.toLowerCase().includes(searchTermLower) ||
      cliente.documento.toLowerCase().includes(searchTermLower) ||
      (cliente.email && cliente.email.toLowerCase().includes(searchTermLower))
    );
  });

  // Função para limpar a seleção de cliente
  const limparClienteSelecionado = () => {
    setClienteSelecionado(null);
  };

  // Função para atualizar a lista local após edição bem-sucedida
  const atualizarListaClientes = (clienteAtualizado: Cliente) => {
    // Verificamos se o cliente já existe na lista
    const clienteExisteNaLista = clientes.some(c => c.id === clienteAtualizado.id);
    
    if (clienteExisteNaLista) {
      // Se o cliente já existe, atualizamos ele na lista
      setClientes(clientesAtuais => 
        clientesAtuais.map(c => 
          c.id === clienteAtualizado.id ? clienteAtualizado : c
        )
      );
    } else {
      // Se o cliente não existe, adicionamos ele à lista
      setClientes(clientesAtuais => [clienteAtualizado, ...clientesAtuais]);
    }
    
    // Fechamos o modal após a edição
    limparClienteSelecionado();
  };
  
  // Função para remover cliente da lista local após remoção bem-sucedida
  const removerClienteDaLista = (clienteId: number) => {
    setClientes(clientesAtuais => 
      clientesAtuais.filter(c => c.id !== clienteId)
    );
  };

  return (
    <div className="space-y-4">
      {/* Modal de Edição de Cliente */}
      {clienteSelecionado && (
        <ClienteForm 
          cliente={clienteSelecionado}
          onClose={limparClienteSelecionado}
          onSuccess={atualizarListaClientes}
        />
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, documento ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        {/* Botão de novo cliente movido para a página principal */}
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
                    <div className="flex justify-end items-center gap-1">
                      <Link href={`/dashboard/clientes/${cliente.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only">Detalhes</span>
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => buscarDetalhesCliente(cliente.id)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only">Editar</span>
                      </Button>
                      <RemoveClienteButton 
                        id={cliente.id} 
                        nome={cliente.nome}
                        onSuccess={() => removerClienteDaLista(cliente.id)}
                      />
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
