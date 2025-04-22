"use client";

import { useEffect, useState } from "react";
import { CalendarSimple } from "@/components/ui/calendar-simple";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tarefa } from "@/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formataData, getStatusTarefaLabel, getTipoTarefaLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Eye } from "lucide-react";

export default function CalendarioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState<Tarefa[]>([]);
  const [data, setData] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticação
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  // Carregar tarefas
  useEffect(() => {
    if (status === "authenticated") {
      const fetchTarefas = async () => {
        setIsLoading(true);
        try {
          const response = await fetch("/api/tarefas");
          if (!response.ok) {
            throw new Error("Erro ao carregar tarefas");
          }
          const data = await response.json();
          setTarefas(data);
          
          // Selecionar tarefas da data atual
          const hoje = new Date();
          filtrarTarefasPorData(hoje, data);
        } catch (error) {
          toast({
            title: "Erro",
            description: "Não foi possível carregar as tarefas",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchTarefas();
    }
  }, [status, toast]);

  // Função para filtrar tarefas por data
  const filtrarTarefasPorData = (data: Date, tarefasLista: Tarefa[] = tarefas) => {
    if (!data) return;
    
    const tarefasDodia = tarefasLista.filter(tarefa => {
      if (!tarefa.dataVencimento) return false;
      
      const dataVencimento = new Date(tarefa.dataVencimento);
      return (
        dataVencimento.getDate() === data.getDate() &&
        dataVencimento.getMonth() === data.getMonth() &&
        dataVencimento.getFullYear() === data.getFullYear()
      );
    });
    
    setTarefasSelecionadas(tarefasDodia);
  };

  // Função para obter datas com tarefas para destacar no calendário
  const datasComTarefas = tarefas.reduce((dates, tarefa) => {
    if (tarefa.dataVencimento) {
      const dataVencimento = new Date(tarefa.dataVencimento);
      dates.push(dataVencimento);
    }
    return dates;
  }, [] as Date[]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calendário de Obrigações</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>Selecione uma data para ver as tarefas</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarSimple
              mode="single"
              selected={data}
              onSelect={(date) => {
                setData(date);
                if (date) {
                  filtrarTarefasPorData(date);
                }
              }}
              className="rounded-md border"
              modifiers={{
                hasTask: datasComTarefas,
              }}
              modifiersStyles={{
                hasTask: {
                  fontWeight: 'bold',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: '50%',
                },
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Tarefas para {data ? formataData(data) : "Hoje"}
            </CardTitle>
            <CardDescription>
              {tarefasSelecionadas.length} 
              {tarefasSelecionadas.length === 1 ? " tarefa encontrada" : " tarefas encontradas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : tarefasSelecionadas.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Não há tarefas para esta data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tarefasSelecionadas.map((tarefa) => (
                  <div key={tarefa.id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{tarefa.titulo}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
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
                      <Link href={`/dashboard/tarefas/${tarefa.id}`}>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Detalhes
                        </Button>
                      </Link>
                    </div>
                    {tarefa.cliente && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Cliente: {tarefa.cliente.nome}
                      </p>
                    )}
                    {tarefa.responsavel && (
                      <p className="text-sm text-muted-foreground">
                        Responsável: {tarefa.responsavel.nome}
                      </p>
                    )}
                    {tarefa.descricao && (
                      <p className="mt-2 text-sm">{tarefa.descricao}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
