import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formataData, getStatusTarefaLabel } from "@/lib/utils";
import { ArrowRight, Calendar } from "lucide-react";
import { Tarefa } from "@/types";

interface CalendarOverviewProps {
  tarefas: Tarefa[];
}

export default function CalendarOverview({ tarefas }: CalendarOverviewProps) {
  // Agrupar tarefas por data
  const tarefasPorData = tarefas.reduce((grupos, tarefa) => {
    if (!tarefa.dataVencimento) return grupos;
    
    const data = new Date(tarefa.dataVencimento).toISOString().split('T')[0];
    
    if (!grupos[data]) {
      grupos[data] = [];
    }
    
    grupos[data].push(tarefa);
    return grupos;
  }, {} as Record<string, Tarefa[]>);
  
  // Ordenar datas
  const datasOrdenadas = Object.keys(tarefasPorData).sort();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Minhas Próximas Obrigações
          </CardTitle>
          <CardDescription>
            Calendário de suas tarefas com vencimento nos próximos 30 dias
          </CardDescription>
        </div>
        <Link href="/dashboard/calendario">
          <Button variant="ghost" size="sm" className="gap-1">
            Ver calendário
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {datasOrdenadas.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">
            Nenhuma tarefa agendada para os próximos 30 dias
          </p>
        ) : (
          <div className="space-y-6">
            {datasOrdenadas.map((data) => (
              <div key={data}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <h3 className="font-semibold">{formataData(data)}</h3>
                </div>
                <div className="space-y-2 pl-4 border-l border-border">
                  {tarefasPorData[data].map((tarefa) => (
                    <div key={tarefa.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">{tarefa.titulo}</div>
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
                      <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                        {tarefa.cliente && <div>Cliente: {tarefa.cliente.nome}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
