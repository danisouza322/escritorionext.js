import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tarefas } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// GET - Obter detalhes de uma tarefa específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contabilidadeId = Number(session.user.contabilidadeId);
    const tarefaId = Number(params.id);

    if (isNaN(tarefaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    
    // Buscar tarefa no banco de dados
    const [tarefa] = await db.query.tarefas.findMany({
      where: and(
        eq(tarefas.id, tarefaId),
        eq(tarefas.contabilidadeId, contabilidadeId)
      ),
      with: {
        cliente: true,
        responsavel: true,
      },
    });

    if (!tarefa) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    }

    return NextResponse.json(tarefa);
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Esquema de validação para atualização de status
const atualizarStatusSchema = z.object({
  status: z.enum(["pendente", "em_andamento", "concluida", "atrasada", "cancelada"]),
});

// PATCH - Atualizar o status de uma tarefa
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contabilidadeId = Number(session.user.contabilidadeId);
    const tarefaId = Number(params.id);

    if (isNaN(tarefaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se a tarefa existe e pertence a esta contabilidade
    const [tarefaExistente] = await db
      .select({ id: tarefas.id })
      .from(tarefas)
      .where(
        and(
          eq(tarefas.id, tarefaId),
          eq(tarefas.contabilidadeId, contabilidadeId)
        )
      );

    if (!tarefaExistente) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    }

    // Obter dados da requisição
    const body = await request.json();
    
    // Validar os dados
    const validacao = atualizarStatusSchema.safeParse(body);
    
    if (!validacao.success) {
      return NextResponse.json(
        { error: "Dados inválidos", detalhes: validacao.error.format() },
        { status: 400 }
      );
    }

    // Atualizar status da tarefa
    const [tarefaAtualizada] = await db
      .update(tarefas)
      .set({
        status: validacao.data.status,
        dataConclusao: validacao.data.status === "concluida" ? new Date() : null,
        dataAtualizacao: new Date(),
      })
      .where(eq(tarefas.id, tarefaId))
      .returning();

    return NextResponse.json(tarefaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar status da tarefa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar uma tarefa existente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contabilidadeId = Number(session.user.contabilidadeId);
    const tarefaId = Number(params.id);

    if (isNaN(tarefaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se a tarefa existe e pertence a esta contabilidade
    const [tarefaExistente] = await db
      .select({ id: tarefas.id })
      .from(tarefas)
      .where(
        and(
          eq(tarefas.id, tarefaId),
          eq(tarefas.contabilidadeId, contabilidadeId)
        )
      );

    if (!tarefaExistente) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    }

    // Obter dados da requisição
    const tarefaData = await request.json();

    // Converter IDs de string para número
    if (tarefaData.clienteId && tarefaData.clienteId !== "0") {
      tarefaData.clienteId = Number(tarefaData.clienteId);
    } else {
      tarefaData.clienteId = null;
    }
    
    if (tarefaData.responsavelId && tarefaData.responsavelId !== "0") {
      tarefaData.responsavelId = Number(tarefaData.responsavelId);
    } else {
      tarefaData.responsavelId = null;
    }

    // Atualizar tarefa
    const [tarefaAtualizada] = await db
      .update(tarefas)
      .set({
        ...tarefaData,
        dataConclusao: tarefaData.status === "concluida" ? new Date() : null,
        dataAtualizacao: new Date(),
      })
      .where(eq(tarefas.id, tarefaId))
      .returning();

    return NextResponse.json(tarefaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Remover tarefa (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contabilidadeId = Number(session.user.contabilidadeId);
    const tarefaId = Number(params.id);

    if (isNaN(tarefaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se a tarefa existe e pertence a esta contabilidade
    const [tarefaExistente] = await db
      .select({ id: tarefas.id })
      .from(tarefas)
      .where(
        and(
          eq(tarefas.id, tarefaId),
          eq(tarefas.contabilidadeId, contabilidadeId)
        )
      );

    if (!tarefaExistente) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    }

    // Soft delete (apenas marcamos como inativo)
    await db
      .update(tarefas)
      .set({
        ativo: false,
        dataAtualizacao: new Date(),
      })
      .where(eq(tarefas.id, tarefaId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover tarefa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}