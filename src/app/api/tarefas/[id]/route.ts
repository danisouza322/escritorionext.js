import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { tarefas } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const tarefaStatusSchema = z.object({
  status: z.enum(["pendente", "em_andamento", "concluida", "atrasada", "cancelada"]),
});

const tarefaUpdateSchema = z.object({
  responsavelId: z.string().nullable().optional(),
  clienteId: z.string().nullable().optional(),
  titulo: z.string().min(3).optional(),
  descricao: z.string().nullable().optional(),
  dataVencimento: z.string().nullable().optional(),
  prioridade: z.number().min(1).max(3).optional(),
});

// GET para obter uma tarefa específica
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
      return new NextResponse("Tarefa não encontrada", { status: 404 });
    }

    return NextResponse.json(tarefa);
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

// PATCH para atualizar apenas o status da tarefa
export async function PATCH(
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

    // Verificar se a tarefa existe e pertence à contabilidade do usuário
    const [tarefaExistente] = await db
      .select()
      .from(tarefas)
      .where(
        and(
          eq(tarefas.id, tarefaId),
          eq(tarefas.contabilidadeId, contabilidadeId)
        )
      );

    if (!tarefaExistente) {
      return new NextResponse("Tarefa não encontrada", { status: 404 });
    }

    const body = await request.json();
    const validatedData = tarefaStatusSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status } = validatedData.data;
    
    // Se estiver marcando como concluída, adicionar a data de conclusão
    const updateData: any = {
      status,
      dataAtualizacao: new Date(),
    };
    
    if (status === "concluida" && tarefaExistente.status !== "concluida") {
      updateData.dataConclusao = new Date();
    } else if (status !== "concluida" && tarefaExistente.status === "concluida") {
      // Se estiver mudando de concluída para outro status, remover a data de conclusão
      updateData.dataConclusao = null;
    }

    // Atualizar a tarefa
    const [tarefaAtualizada] = await db
      .update(tarefas)
      .set(updateData)
      .where(
        and(
          eq(tarefas.id, tarefaId),
          eq(tarefas.contabilidadeId, contabilidadeId)
        )
      )
      .returning();

    return NextResponse.json(tarefaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar status da tarefa:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

// PUT para atualizar outros campos da tarefa
export async function PUT(
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

    // Verificar se a tarefa existe e pertence à contabilidade do usuário
    const [tarefaExistente] = await db
      .select()
      .from(tarefas)
      .where(
        and(
          eq(tarefas.id, tarefaId),
          eq(tarefas.contabilidadeId, contabilidadeId)
        )
      );

    if (!tarefaExistente) {
      return new NextResponse("Tarefa não encontrada", { status: 404 });
    }

    const body = await request.json();
    const validatedData = tarefaUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updateData = {
      ...validatedData.data,
      dataAtualizacao: new Date(),
    };

    // Converter IDs de string para número
    if (updateData.responsavelId !== undefined) {
      updateData.responsavelId = updateData.responsavelId === null 
        ? null 
        : Number(updateData.responsavelId);
    }
    
    if (updateData.clienteId !== undefined) {
      updateData.clienteId = updateData.clienteId === null 
        ? null 
        : Number(updateData.clienteId);
    }

    // Atualizar a tarefa
    const [tarefaAtualizada] = await db
      .update(tarefas)
      .set(updateData)
      .where(
        and(
          eq(tarefas.id, tarefaId),
          eq(tarefas.contabilidadeId, contabilidadeId)
        )
      )
      .returning();

    return NextResponse.json(tarefaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}