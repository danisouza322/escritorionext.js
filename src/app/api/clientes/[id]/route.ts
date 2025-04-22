import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/clientes/[id]
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Extrair os parâmetros de forma segura
  const params = context.params;
  // Extrair o ID em uma variável separada para evitar o erro "params.id should be awaited"
  const paramId = params.id;
  
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const contabilidadeId = Number(session.user.contabilidadeId);
  // Acessar o ID a partir dos parâmetros de forma segura
  const id = Number(paramId);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const cliente = await db.query.clientes.findFirst({
      where: and(
        eq(clientes.id, id),
        eq(clientes.contabilidadeId, contabilidadeId)
      ),
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cliente" },
      { status: 500 }
    );
  }
}

// PUT /api/clientes/[id]
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Extrair os parâmetros de forma segura
  const params = context.params;
  // Extrair o ID em uma variável separada para evitar o erro "params.id should be awaited"
  const paramId = params.id;
  
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const contabilidadeId = Number(session.user.contabilidadeId);
    const id = Number(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Verificar se o cliente existe
    const clienteExistente = await db.query.clientes.findFirst({
      where: and(
        eq(clientes.id, id),
        eq(clientes.contabilidadeId, contabilidadeId)
      ),
    });

    if (!clienteExistente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Obter dados do corpo da requisição
    const data = await request.json();

    // Atualizar cliente
    await db
      .update(clientes)
      .set({
        ...data,
        contabilidadeId, // Garantir que o contabilidadeId seja mantido
        dataAtualizacao: new Date(),
      })
      .where(
        and(
          eq(clientes.id, id),
          eq(clientes.contabilidadeId, contabilidadeId)
        )
      );

    // Buscar o cliente atualizado
    const clienteAtualizado = await db.query.clientes.findFirst({
      where: and(
        eq(clientes.id, id),
        eq(clientes.contabilidadeId, contabilidadeId)
      ),
    });

    return NextResponse.json(clienteAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar cliente" },
      { status: 500 }
    );
  }
}

// DELETE /api/clientes/[id]
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Extrair os parâmetros de forma segura
  const params = context.params;
  // Extrair o ID em uma variável separada para evitar o erro "params.id should be awaited"
  const paramId = params.id;
  
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const contabilidadeId = Number(session.user.contabilidadeId);
  // Acessar o ID a partir dos parâmetros de forma segura
  const id = Number(paramId);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    // Verificar se o cliente existe
    const cliente = await db.query.clientes.findFirst({
      where: and(
        eq(clientes.id, id),
        eq(clientes.contabilidadeId, contabilidadeId)
      ),
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Não excluímos permanentemente, apenas marcamos como inativo
    await db
      .update(clientes)
      .set({ ativo: false })
      .where(
        and(
          eq(clientes.id, id),
          eq(clientes.contabilidadeId, contabilidadeId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao desativar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao desativar cliente" },
      { status: 500 }
    );
  }
}