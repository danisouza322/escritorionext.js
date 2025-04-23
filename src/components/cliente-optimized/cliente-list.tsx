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
import { useState, useCallback, useMemo, useEffect } from "react";
import { Cliente } from "@/types";
import { formataDocumento, getTipoClienteLabel } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Pencil } from "lucide-react";
import RemoveClienteButton from "../cliente/remove-cliente-button";
import { useRouter } from "next/navigation";
import ClienteForm from "./cliente-form";

interface ClienteListProps {
  clientes: Cliente[];
}

export default function ClienteList({ clientes: clientesIniciais }: ClienteListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Otimização: Pré-carregar alguns detalhes de clientes para navegação mais rápida
  useEffect(() => {
    const prefetchClientesDetalhes = async () => {
      // Pegamos os primeiros 2 clientes para fazer prefetch
      const clientesParaPrefetch = clientes.slice(0, 2);
      
      for (const cliente of clientesParaPrefetch) {
        try {
          // Fazemos prefetch das URLs em paralelo (sem await)
          fetch(`/api/clientes/${cliente.id}`).catch(() => {});
        } catch (error) {
          // Ignoramos erros silenciosamente no prefetch
        }
      }
    };
    
    prefetchClientesDetalhes();
  }, [clientes]);
  
  // Buscar detalhes do cliente para edição (com otimização)
  const buscarDetalhesCliente = useCallback(async (clienteId: number) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Filtrar clientes com base no termo de busca e mostrar apenas ativos (memoizado)
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      // Primeiro filtramos apenas clientes ativos
      if (!cliente.ativo) return false;
      
      // Se não há termo de busca, retornar todos
      if (!searchTerm) return true;
      
      // Depois aplicamos o filtro de busca
      const searchTermLower = searchTerm.toLowerCase();
      return (
        cliente.nome.toLowerCase().includes(searchTermLower) ||
        cliente.documento.toLowerCase().includes(searchTermLower) ||
        (cliente.email && cliente.email.toLowerCase().includes(searchTermLower))
      );
    });
  }, [clientes, searchTerm]);

  // Função para limpar a seleção de cliente (memoizada)
  const limparClienteSelecionado = useCallback(() => {
    setClienteSelecionado(null);
  }, []);

  // Função para atualizar a lista local após edição bem-sucedida (memoizada)
  const atualizarListaClientes = useCallback((clienteAtualizado: Cliente) => {
    setClientes(clientesAtuais => {
      // Verificamos se o cliente já existe na lista
      const clienteExisteNaLista = clientesAtuais.some(c => c.id === clienteAtualizado.id);
      
      if (clienteExisteNaLista) {
        // Se o cliente já existe, atualizamos ele na lista
        return clientesAtuais.map(c => 
          c.id === clienteAtualizado.id ? clienteAtualizado : c
        );
      } else {
        // Se o cliente não existe, adicionamos ele à lista
        return [clienteAtualizado, ...clientesAtuais];
      }
    });
    
    // Fechamos o modal após a edição
    limparClienteSelecionado();
  }, [limparClienteSelecionado]);
  
  // Função para marcar cliente como inativo na lista local após remoção bem-sucedida (memoizada)
  const removerClienteDaLista = useCallback((clienteId: number) => {
    setClientes(clientesAtuais => 
      clientesAtuais.map(c => 
        c.id === clienteId ? { ...c, ativo: false } : c
      )
    );
  }, []);

  // Otimização: Manipulador de mudança de busca
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

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
            onChange={handleSearchChange}
            className="max-w-sm"
          />
        </div>
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
                      <Link href={`/dashboard/clientes/${cliente.id}`} prefetch={false}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Detalhes</span>
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => buscarDetalhesCliente(cliente.id)}
                        disabled={isLoading}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
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