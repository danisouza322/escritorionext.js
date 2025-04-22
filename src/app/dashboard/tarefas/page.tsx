import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tarefas, usuarios, clientes } from "@/db/schema";
import { eq, desc, and, or } from "drizzle-orm";
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
  const usuarioId = Number(session.user.id);
  
  // Buscar tarefas onde o usuário é responsável OU é o criador
  const tarefasList = await db.query.tarefas.findMany({
    where: and(
      eq(tarefas.contabilidadeId, contabilidadeId),
      or(
        eq(tarefas.responsavelId, usuarioId),
        eq(tarefas.criadorId, usuarioId)
      )
    ),
    orderBy: [desc(tarefas.dataCriacao)],
    with: {
      cliente: true,
      responsavel: true,
      criador: true,
    },
  });
  
  // Buscar clientes ativos e colaboradores para o form
  const clientesList = await db.query.clientes.findMany({
    where: (fields, { eq, and }) => 
      and(
        eq(fields.contabilidadeId, contabilidadeId),
        eq(fields.ativo, true)
      ),
  });
  
  const colaboradores = await db.query.usuarios.findMany({
    where: eq(usuarios.contabilidadeId, contabilidadeId),
  });
  
  // Contagem por status
  const statusTarefas = tarefasList.reduce((acc, tarefa) => {
    // Garantir que status nunca seja null ao acessar
    const status = tarefa.status || 'pendente';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <span className="text-muted-foreground block">
            Gerencie as tarefas e obrigações do escritório
          </span>
        </div>
        <TarefaForm 
          clientes={clientesList as any} 
          colaboradores={colaboradores as any}
        >
          <Button className="gap-2">
            <ListTodo className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </TarefaForm>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center">
          <span className="text-muted-foreground text-sm block">Total</span>
          <span className="text-3xl font-bold block">{tarefasList.length}</span>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <span className="text-muted-foreground text-sm block">Pendentes</span>
          <span className="text-3xl font-bold block">{statusTarefas.pendente || 0}</span>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <span className="text-muted-foreground text-sm block">Em Andamento</span>
          <span className="text-3xl font-bold block">{statusTarefas.em_andamento || 0}</span>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <span className="text-muted-foreground text-sm block">Concluídas</span>
          <span className="text-3xl font-bold block">{statusTarefas.concluida || 0}</span>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <span className="text-muted-foreground text-sm block">Atrasadas</span>
          <span className="text-3xl font-bold text-destructive block">{statusTarefas.atrasada || 0}</span>
        </div>
      </div>
      
      <TarefaList tarefas={tarefasList as any} />
    </div>
  );
}
