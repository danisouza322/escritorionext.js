import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tarefas, usuarios } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import TarefaList from "@/components/tarefa/tarefa-list";
import TarefaForm from "@/components/tarefa/tarefa-form";
import { ListTodo } from "lucide-react";

export default async function TarefasPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  const contabilidadeId = Number(session.user.contabilidadeId);
  
  // Buscar tarefas
  const tarefasList = await db.query.tarefas.findMany({
    where: eq(tarefas.contabilidadeId, contabilidadeId),
    orderBy: [desc(tarefas.dataCriacao)],
    with: {
      cliente: true,
      responsavel: true,
    },
  });
  
  // Buscar clientes e colaboradores para o form
  const clientes = await db.query.clientes.findMany({
    where: eq(tarefas.contabilidadeId, contabilidadeId),
  });
  
  const colaboradores = await db.query.usuarios.findMany({
    where: eq(usuarios.contabilidadeId, contabilidadeId),
  });
  
  // Contagem por status
  const statusTarefas = tarefasList.reduce((acc, tarefa) => {
    acc[tarefa.status] = (acc[tarefa.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie as tarefas e obrigações do escritório
          </p>
        </div>
        <TarefaForm 
          clientes={clientes} 
          colaboradores={colaboradores}
        >
          <Button className="gap-2">
            <ListTodo className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </TarefaForm>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Total</p>
          <p className="text-3xl font-bold">{tarefasList.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Pendentes</p>
          <p className="text-3xl font-bold">{statusTarefas.pendente || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Em Andamento</p>
          <p className="text-3xl font-bold">{statusTarefas.em_andamento || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Concluídas</p>
          <p className="text-3xl font-bold">{statusTarefas.concluida || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Atrasadas</p>
          <p className="text-3xl font-bold text-destructive">{statusTarefas.atrasada || 0}</p>
        </div>
      </div>
      
      <TarefaList tarefas={tarefasList} />
    </div>
  );
}
