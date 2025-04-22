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
import { Usuario } from "@/types";
import { getTipoUsuarioLabel } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColaboradorListProps {
  colaboradores: Usuario[];
}

export default function ColaboradorList({ colaboradores }: ColaboradorListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  
  // Filtrar colaboradores com base no termo de busca
  const colaboradoresFiltrados = colaboradores.filter((colaborador) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      colaborador.nome.toLowerCase().includes(searchTermLower) ||
      colaborador.email.toLowerCase().includes(searchTermLower) ||
      getTipoUsuarioLabel(colaborador.tipo).toLowerCase().includes(searchTermLower)
    );
  });

  const handleAlterarStatus = async (id: number, ativo: boolean) => {
    try {
      const response = await fetch(`/api/colaboradores/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ativo: !ativo }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao ${ativo ? 'desativar' : 'ativar'} colaborador`);
      }

      toast({
        title: `Colaborador ${ativo ? 'desativado' : 'ativado'}`,
        description: `O usuário foi ${ativo ? 'desativado' : 'ativado'} com sucesso`,
      });
      
      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do colaborador",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou função..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colaboradoresFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum colaborador encontrado.
                </TableCell>
              </TableRow>
            ) : (
              colaboradoresFiltrados.map((colaborador) => (
                <TableRow key={colaborador.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={colaborador.fotoPerfil || ""} alt={colaborador.nome} />
                        <AvatarFallback>
                          {colaborador.nome.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{colaborador.nome}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getTipoUsuarioLabel(colaborador.tipo)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {colaborador.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {colaborador.ativo ? (
                      <Badge variant="default" className="bg-green-500">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleAlterarStatus(colaborador.id, colaborador.ativo)}
                        >
                          {colaborador.ativo ? "Desativar usuário" : "Ativar usuário"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
