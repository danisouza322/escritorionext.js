import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET - Obter detalhes de um cliente específico
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
    const clienteId = Number(params.id);

    if (isNaN(clienteId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    
    // Buscar cliente no banco de dados
    const [cliente] = await db
      .select()
      .from(clientes)
      .where(
        and(
          eq(clientes.id, clienteId),
          eq(clientes.contabilidadeId, contabilidadeId)
        )
      );

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar um cliente existente
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
    const clienteId = Number(params.id);

    if (isNaN(clienteId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se o cliente existe e pertence a esta contabilidade
    const [clienteExistente] = await db
      .select({ id: clientes.id })
      .from(clientes)
      .where(
        and(
          eq(clientes.id, clienteId),
          eq(clientes.contabilidadeId, contabilidadeId)
        )
      );

    if (!clienteExistente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Obter dados da requisição
    const clienteData = await request.json();

    // Atualizar cliente
    const [clienteAtualizado] = await db
      .update(clientes)
      .set({
        ...clienteData,
        dataAtualizacao: new Date(),
      })
      .where(eq(clientes.id, clienteId))
      .returning();

    return NextResponse.json(clienteAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Remover cliente (soft delete)
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
    const clienteId = Number(params.id);

    if (isNaN(clienteId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se o cliente existe e pertence a esta contabilidade
    const [clienteExistente] = await db
      .select({ id: clientes.id })
      .from(clientes)
      .where(
        and(
          eq(clientes.id, clienteId),
          eq(clientes.contabilidadeId, contabilidadeId)
        )
      );

    if (!clienteExistente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Soft delete (apenas marcamos como inativo)
    await db
      .update(clientes)
      .set({
        ativo: false,
        dataAtualizacao: new Date(),
      })
      .where(eq(clientes.id, clienteId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}