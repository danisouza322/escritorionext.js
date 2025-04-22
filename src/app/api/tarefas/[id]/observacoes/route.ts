import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { tarefas, observacoesTarefas } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const observacaoSchema = z.object({
  texto: z.string().min(1, "O texto da observação é obrigatório"),
});

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const tarefaId = Number(context.params.id);
    const contabilidadeId = Number(session.user.contabilidadeId);

    // Verificar se a tarefa pertence à contabilidade do usuário
    const [tarefa] = await db
      .select()
      .from(tarefas)
      .where(
        and(
          eq(tarefas.id, tarefaId),
          eq(tarefas.contabilidadeId, contabilidadeId)
        )
      );

    if (!tarefa) {
      return new NextResponse("Tarefa não encontrada", { status: 404 });
    }

    // Buscar as observações
    const observacoes = await db.query.observacoesTarefas.findMany({
      where: eq(observacoesTarefas.tarefaId, tarefaId),
      with: {
        usuario: true,
      },
      orderBy: (observacoesTarefas, { desc }) => [desc(observacoesTarefas.dataCriacao)],
    });

    return NextResponse.json(observacoes);
  } catch (error) {
    console.error("Erro ao buscar observações:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const tarefaId = Number(context.params.id);
    const contabilidadeId = Number(session.user.contabilidadeId);
    const usuarioId = Number(session.user.id);

    // Verificar se a tarefa pertence à contabilidade do usuário
    const [tarefa] = await db
      .select()
      .from(tarefas)
      .where(
        and(
          eq(tarefas.id, tarefaId),
          eq(tarefas.contabilidadeId, contabilidadeId)
        )
      );

    if (!tarefa) {
      return new NextResponse("Tarefa não encontrada", { status: 404 });
    }

    const body = await request.json();
    const validatedData = observacaoSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Inserir a observação
    const [novaObservacao] = await db
      .insert(observacoesTarefas)
      .values({
        tarefaId,
        usuarioId,
        texto: validatedData.data.texto,
        ativo: true,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      })
      .returning();

    // Buscar a observação com dados do usuário
    const observacaoCompleta = await db.query.observacoesTarefas.findFirst({
      where: eq(observacoesTarefas.id, novaObservacao.id),
      with: {
        usuario: true,
      },
    });

    return NextResponse.json(observacaoCompleta, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar observação:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}