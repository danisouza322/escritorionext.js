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
import { useState, useCallback, useMemo } from "react";
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
import Link from "next/link";

// Função para obter cor da badge baseado no status da tarefa
const getStatusColor = (status: string): string => {
  switch (status) {
    case "pendente":
      return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/30";
    case "em_andamento":
      return "bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-500/30";
    case "concluida":
      return "bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30";
    case "atrasada":
      return "bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-500/30";
    case "cancelada":
      return "bg-gray-500/20 text-gray-700 dark:text-gray-400 hover:bg-gray-500/30";
    default:
      return "";
  }
};

interface TarefaListProps {
  tarefas: Tarefa[];
}

export default function TarefaList({ tarefas: tarefasIniciais }: TarefaListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState<Tarefa | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  
  // Filtrar tarefas memoizado para melhor performance
  const tarefasFiltradas = useMemo(() => {
    return tarefasIniciais.filter(tarefa => {
      // Aplicar filtro de status, se estiver definido
      if (statusFilter && tarefa.status !== statusFilter) {
        return false;
      }
      
      // Se não há termo de busca, retornar resultado do filtro de status
      if (!searchTerm) return true;
      
      // Aplicar filtro de busca
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (tarefa.titulo.toLowerCase().includes(searchTermLower)) ||
        (tarefa.descricao?.toLowerCase().includes(searchTermLower)) ||
        (tarefa.cliente?.nome.toLowerCase().includes(searchTermLower))
      );
    });
  }, [tarefasIniciais, searchTerm, statusFilter]);
  
  // Handler de alteração da busca otimizado
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);
  
  // Handler de alteração do filtro otimizado
  const handleStatusFilter = useCallback((status: string | null) => {
    setStatusFilter(prev => prev === status ? null : status);
  }, []);

  // Verifica se o usuário é o criador da tarefa
  const podeExcluirTarefa = useCallback((tarefa: Tarefa) => {
    return session?.user && String(tarefa.criadorId) === String(session.user.id);
  }, [session]);

  // Handler de exclusão de tarefa otimizado
  const handleExcluirTarefa = useCallback(async () => {
    if (!tarefaParaExcluir) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/tarefas/${tarefaParaExcluir.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao excluir tarefa');
      }
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso",
      });
      
      // Atualizar a página
      router.refresh();
      
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a tarefa",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setTarefaParaExcluir(null);
    }
  }, [tarefaParaExcluir, router, toast]);
  
  // Modal de exclusão memoizado
  const exclusionDialog = useMemo(() => (
    <AlertDialog open={!!tarefaParaExcluir} onOpenChange={(open) => !open && setTarefaParaExcluir(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a tarefa "{tarefaParaExcluir?.titulo}"? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleExcluirTarefa} 
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ), [tarefaParaExcluir, isDeleting, handleExcluirTarefa]);
  
  // Botões de filtro memoizados
  const filterButtons = useMemo(() => (
    <div className="flex flex-wrap gap-2 my-4">
      <Button
        variant="outline"
        size="sm"
        className={`gap-2 ${statusFilter === "pendente" ? "bg-primary/10" : ""}`}
        onClick={() => handleStatusFilter("pendente")}
      >
        <Clock className="h-4 w-4" />
        Pendentes
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={`gap-2 ${statusFilter === "em_andamento" ? "bg-primary/10" : ""}`}
        onClick={() => handleStatusFilter("em_andamento")}
      >
        <Users className="h-4 w-4" />
        Em Andamento
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={`gap-2 ${statusFilter === "concluida" ? "bg-primary/10" : ""}`}
        onClick={() => handleStatusFilter("concluida")}
      >
        <CheckCircle className="h-4 w-4" />
        Concluídas
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={`gap-2 ${statusFilter === "atrasada" ? "bg-primary/10" : ""}`}
        onClick={() => handleStatusFilter("atrasada")}
      >
        <AlertCircle className="h-4 w-4" />
        Atrasadas
      </Button>
    </div>
  ), [statusFilter, handleStatusFilter]);

  return (
    <div className="space-y-4">
      {exclusionDialog}
      
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, descrição ou cliente..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
      </div>
      
      {filterButtons}
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Responsáveis</TableHead>
              <TableHead className="hidden md:table-cell">Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Vencimento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tarefasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhuma tarefa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              tarefasFiltradas.map((tarefa) => (
                <TableRow key={tarefa.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <Link 
                        href={`/dashboard/tarefas/${tarefa.id}`}
                        className="font-medium hover:underline hover:text-primary transition-colors"
                        prefetch={false}
                      >
                        {tarefa.titulo}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {getTipoTarefaLabel(tarefa.tipo)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(tarefa.status)}
                    >
                      {getStatusTarefaLabel(tarefa.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex -space-x-2">
                      {tarefa.responsaveis && tarefa.responsaveis.length > 0 ? (
                        tarefa.responsaveis.slice(0, 3).map((resp, index) => (
                          <div 
                            key={index}
                            className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-xs font-medium ring-2 ring-background"
                            title={resp.usuario?.nome || "Responsável"}
                          >
                            {resp.usuario?.nome?.charAt(0) || "U"}
                          </div>
                        ))
                      ) : tarefa.responsavel ? (
                        <div 
                          className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-xs font-medium ring-2 ring-background"
                          title={tarefa.responsavel?.nome || "Responsável"}
                        >
                          {tarefa.responsavel?.nome?.charAt(0) || "U"}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sem responsável</span>
                      )}
                      
                      {/* Mostrar +X se houver mais que 3 responsáveis */}
                      {tarefa.responsaveis && tarefa.responsaveis.length > 3 && (
                        <div 
                          className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-xs font-medium ring-2 ring-background text-primary-foreground"
                          title="Mais responsáveis"
                        >
                          +{tarefa.responsaveis.length - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {tarefa.cliente ? tarefa.cliente.nome : "--"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {tarefa.dataVencimento ? formataData(tarefa.dataVencimento) : "--"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Link 
                        href={`/dashboard/tarefas/${tarefa.id}`}
                        prefetch={false}
                      >
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Detalhes</span>
                        </Button>
                      </Link>
                      
                      {/* Exibir botão de exclusão apenas para o criador */}
                      {podeExcluirTarefa(tarefa) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setTarefaParaExcluir(tarefa)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      )}
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