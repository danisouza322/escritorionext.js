import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tarefas } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import TarefaDetalhes from "@/components/tarefa/tarefa-detalhes";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detalhes da Tarefa - Contabilidade App",
  description: "Visualização detalhada de uma tarefa",
};

type PageProps = {
  params: {
    id: string;
  };
};

export default async function TarefaPage(props: PageProps) {
  // Verificar autenticação
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth");
  }

  const contabilidadeId = Number(session.user.contabilidadeId);
  
  // Extrair o ID de params de forma assíncrona
  const { id } = await Promise.resolve(props.params);
  const tarefaId = parseInt(id, 10); // parsing com parseInt é mais seguro

  // Buscar tarefa no banco de dados
  const [tarefa] = await db.query.tarefas.findMany({
    where: and(
      eq(tarefas.id, tarefaId),
      eq(tarefas.contabilidadeId, contabilidadeId)
    ),
    with: {
      cliente: true,
      responsavel: true,
      responsaveis: {
        with: {
          usuario: true,
        },
      },
    },
  });

  if (!tarefa) {
    redirect("/dashboard/tarefas");
  }

  // Buscar colaboradores para o dropdown de responsável
  const colaboradores = await db.query.usuarios.findMany({
    where: eq(tarefas.contabilidadeId, contabilidadeId),
    orderBy: (usuarios, { asc }) => [asc(usuarios.nome)],
  });

  return (
    <main className="container mx-auto py-6">
      <TarefaDetalhes tarefa={tarefa} colaboradores={colaboradores} />
    </main>
  );
}