import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentTasks from "@/components/dashboard/recent-tasks";
import ClientOverview from "@/components/dashboard/client-overview";
import CalendarOverview from "@/components/dashboard/calendar-overview";
import { db } from "@/lib/db";
import { tarefas, clientes, documentos } from "@/db/schema";
import { eq, desc, and, lte, gte } from "drizzle-orm";
import { Suspense } from "react";
import { CardSkeleton, LoadingSkeleton, TableSkeleton } from "@/components/ui/loading-skeleton";

// Revalidar a cada 30 segundos
export const revalidate = 30;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  const contabilidadeId = Number(session.user.contabilidadeId);
  const usuarioId = Number(session.user.id);
  
  // Buscar estatísticas (apenas clientes ativos)
  const totalClientes = await db.query.clientes.findMany({
    where: and(
      eq(clientes.contabilidadeId, contabilidadeId),
      eq(clientes.ativo, true)
    ),
  }).then(res => res.length);
  
  const totalDocumentos = await db.query.documentos.findMany({
    where: eq(documentos.contabilidadeId, contabilidadeId),
  }).then(res => res.length);
  
  // Buscar tarefas pendentes onde o usuário é responsável
  const tarefasEmAberto = await db.query.tarefas.findMany({
    where: and(
      eq(tarefas.contabilidadeId, contabilidadeId),
      eq(tarefas.status, "pendente"),
      eq(tarefas.responsavelId, usuarioId)
    ),
  }).then(res => res.length);
  
  // Buscar tarefas atrasadas onde o usuário é responsável
  const tarefasAtrasadas = await db.query.tarefas.findMany({
    where: and(
      eq(tarefas.contabilidadeId, contabilidadeId),
      eq(tarefas.status, "atrasada"),
      eq(tarefas.responsavelId, usuarioId)
    ),
  }).then(res => res.length);
  
  // Obter tarefas recentes onde o usuário é responsável
  const tarefasRecentes = await db.query.tarefas.findMany({
    where: and(
      eq(tarefas.contabilidadeId, contabilidadeId),
      eq(tarefas.responsavelId, usuarioId)
    ),
    orderBy: [desc(tarefas.dataCriacao)],
    limit: 5,
    with: {
      cliente: true,
      responsavel: true,
    },
  });
  
  // Clientes recentes (apenas ativos)
  const clientesRecentes = await db.query.clientes.findMany({
    where: and(
      eq(clientes.contabilidadeId, contabilidadeId),
      eq(clientes.ativo, true)
    ),
    orderBy: [desc(clientes.dataCriacao)],
    limit: 5,
  });
  
  // Tarefas para o calendário (próximos 30 dias) onde o usuário é responsável
  const hoje = new Date();
  const trintaDiasAFrente = new Date(hoje);
  trintaDiasAFrente.setDate(hoje.getDate() + 30);
  
  const proximasTarefas = await db.query.tarefas.findMany({
    where: and(
      eq(tarefas.contabilidadeId, contabilidadeId),
      eq(tarefas.responsavelId, usuarioId),
      gte(tarefas.dataVencimento, hoje),
      lte(tarefas.dataVencimento, trintaDiasAFrente)
    ),
    orderBy: [tarefas.dataVencimento],
    with: {
      cliente: true,
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <Suspense fallback={<CardSkeleton />}>
        <StatsCards 
          totalClientes={totalClientes}
          totalDocumentos={totalDocumentos}
          tarefasEmAberto={tarefasEmAberto}
          tarefasAtrasadas={tarefasAtrasadas}
        />
      </Suspense>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<LoadingSkeleton height="h-80" />}>
          <RecentTasks tarefas={tarefasRecentes} />
        </Suspense>
        <Suspense fallback={<LoadingSkeleton height="h-80" />}>
          <ClientOverview clientes={clientesRecentes} />
        </Suspense>
      </div>
      
      <Suspense fallback={<LoadingSkeleton height="h-96" />}>
        <CalendarOverview tarefas={proximasTarefas} />
      </Suspense>
    </div>
  );
}
