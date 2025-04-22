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

// DELETE para remover uma observação específica
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Extrair o ID de params de forma segura (assíncrona)
    const { id } = await Promise.resolve(context.params);
    const tarefaId = Number(id);
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Obter o ID da observação da URL de consulta
    const url = new URL(request.url);
    const observacaoId = url.searchParams.get("observacaoId");
    
    if (!observacaoId) {
      return new NextResponse("ID da observação não fornecido", { status: 400 });
    }

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

    // Buscar a observação para verificar se o usuário atual é o autor
    const [observacao] = await db
      .select()
      .from(observacoesTarefas)
      .where(
        and(
          eq(observacoesTarefas.id, parseInt(observacaoId, 10)),
          eq(observacoesTarefas.tarefaId, tarefaId)
        )
      );

    if (!observacao) {
      return new NextResponse("Observação não encontrada", { status: 404 });
    }

    // Verificar se o usuário atual é o autor da observação
    if (observacao.usuarioId !== usuarioId) {
      return new NextResponse("Você não tem permissão para excluir esta observação", { status: 403 });
    }

    // Excluir a observação (usando exclusão lógica, apenas marcando como inativo)
    await db
      .update(observacoesTarefas)
      .set({ 
        ativo: false,
        dataAtualizacao: new Date() 
      })
      .where(eq(observacoesTarefas.id, parseInt(observacaoId, 10)));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir observação:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Extrair o ID de params de forma segura (assíncrona)
    const { id } = await Promise.resolve(context.params);
    const tarefaId = Number(id);
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

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

    // Buscar as observações (apenas ativas)
    const observacoes = await db.query.observacoesTarefas.findMany({
      where: and(
        eq(observacoesTarefas.tarefaId, tarefaId),
        eq(observacoesTarefas.ativo, true)
      ),
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
    // Extrair o ID de params de forma segura (assíncrona)
    const { id } = await Promise.resolve(context.params);
    const tarefaId = Number(id);
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

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