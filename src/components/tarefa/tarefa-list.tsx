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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tarefa } from "@/types";
import { 
  formataData, 
  getStatusTarefaLabel, 
  getTipoTarefaLabel 
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Users,
  Calendar,
  Trash2,
  Info
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Session } from "@/types";

interface TarefaListProps {
  tarefas: Tarefa[];
}

export default function TarefaList({ tarefas }: TarefaListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  
  // Filtrar tarefas com base no termo de busca
  const tarefasFiltradas = tarefas.filter((tarefa) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      tarefa.titulo.toLowerCase().includes(searchTermLower) ||
      (tarefa.descricao && tarefa.descricao.toLowerCase().includes(searchTermLower)) ||
      (tarefa.cliente && tarefa.cliente.nome.toLowerCase().includes(searchTermLower)) ||
      (tarefa.responsavel && tarefa.responsavel.nome.toLowerCase().includes(searchTermLower))
    );
  });

  const handleStatusChange = async (tarefaId: number, novoStatus: string) => {
    try {
      const response = await fetch(`/api/tarefas/${tarefaId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar tarefa");
      }

      toast({
        title: "Status atualizado",
        description: `Tarefa marcada como ${getStatusTarefaLabel(novoStatus as any)}`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (tarefaId: number) => {
    try {
      const response = await fetch(`/api/tarefas/${tarefaId}`, {
        method: "DELETE",
      });

      if (response.status === 403) {
        toast({
          title: "Acesso negado",
          description: "Apenas o criador da tarefa pode excluí-la",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Erro ao excluir tarefa");
      }

      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tarefa",
        variant: "destructive",
      });
    }
  };

  // Função para renderizar o ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluida":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "em_andamento":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "atrasada":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  // Botão de ação rápida com base no status
  const renderActionButton = (tarefa: Tarefa) => {
    // Verificar se o usuário é o criador da tarefa
    const isCreator = session?.user?.id && Number(session.user.id) === tarefa.criadorId;
    
    return (
      <div className="flex space-x-2 justify-end">
        <Button 
          variant="default" 
          size="sm"
          onClick={() => router.push(`/dashboard/tarefas/${tarefa.id}`)}
        >
          Ver
        </Button>
        
        {tarefa.status === "pendente" && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleStatusChange(tarefa.id, "em_andamento")}
          >
            Iniciar
          </Button>
        )}
        
        {tarefa.status === "em_andamento" && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleStatusChange(tarefa.id, "concluida")}
          >
            Concluir
          </Button>
        )}
        
        {/* Mostrar botão de exclusão apenas se o usuário for o criador */}
        {isCreator && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta tarefa?<br/>
                  <span className="font-medium">{tarefa.titulo}</span><br/>
                  <span className="text-xs text-muted-foreground mt-1">
                    <Info className="h-3 w-3 inline-block mr-1" />
                    Somente o criador da tarefa pode excluí-la.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => handleDelete(tarefa.id)}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, descrição, cliente ou responsável..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Responsável</TableHead>
              <TableHead className="hidden md:table-cell">Vencimento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tarefasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhuma tarefa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              tarefasFiltradas.map((tarefa) => (
                <TableRow key={tarefa.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tarefa.status)}
                      {tarefa.titulo}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        tarefa.status === "concluida" 
                          ? "default" 
                          : tarefa.status === "atrasada" 
                          ? "destructive" 
                          : "outline"
                      }
                    >
                      {getStatusTarefaLabel(tarefa.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">
                      {getTipoTarefaLabel(tarefa.tipo)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {tarefa.cliente ? (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{tarefa.cliente.nome}</span>
                      </div>
                    ) : (
                      "--"
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {tarefa.responsaveis && tarefa.responsaveis.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tarefa.responsaveis.slice(0, 3).map((resp) => (
                          <div key={resp.id} className="flex items-center">
                            <span className="truncate max-w-[100px]" title={resp.usuario?.nome}>
                              {resp.usuario?.nome?.split(" ")[0]}
                            </span>
                            {tarefa.responsaveis && tarefa.responsaveis.length > 3 && 
                             resp === tarefa.responsaveis[2] && 
                             <span title={`+${tarefa.responsaveis.length - 3} responsáveis`}>...</span>}
                          </div>
                        ))}
                      </div>
                    ) : tarefa.responsavel?.nome ? (
                      tarefa.responsavel.nome
                    ) : (
                      "--"
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {tarefa.dataVencimento ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formataData(tarefa.dataVencimento)}</span>
                      </div>
                    ) : (
                      "--"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {renderActionButton(tarefa)}
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
