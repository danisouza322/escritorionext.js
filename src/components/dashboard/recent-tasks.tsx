import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formataData, getStatusTarefaLabel, getTipoTarefaLabel } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Tarefa } from "@/types";

interface RecentTasksProps {
  tarefas: Tarefa[];
}

export default function RecentTasks({ tarefas }: RecentTasksProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Tarefas Recentes</CardTitle>
          <CardDescription>
            Últimas tarefas adicionadas ao sistema
          </CardDescription>
        </div>
        <Link href="/dashboard/tarefas">
          <Button variant="ghost" size="sm" className="gap-1">
            Ver mais
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {tarefas.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">
            Nenhuma tarefa encontrada
          </p>
        ) : (
          <div className="space-y-4">
            {tarefas.map((tarefa) => (
              <div key={tarefa.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium">{tarefa.titulo}</div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{getTipoTarefaLabel(tarefa.tipo)}</Badge>
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
                  </div>
                </div>
                <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                  {tarefa.cliente && <div>Cliente: {tarefa.cliente.nome}</div>}
                  {tarefa.responsavel && <div>Responsável: {tarefa.responsavel.nome}</div>}
                  {tarefa.dataVencimento && (
                    <div>Vencimento: {formataData(tarefa.dataVencimento)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
