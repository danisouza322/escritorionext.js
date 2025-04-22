import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Validação dos dados de cliente
const clienteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["pessoa_fisica", "pessoa_juridica"]),
  documento: z.string().min(1, "Documento é obrigatório"),
  email: z.string().email("Email inválido").optional().nullable(),
  telefone: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  data_abertura: z.string().optional().nullable(),
  natureza_juridica: z.string().optional().nullable(),
  atividade_principal: z.string().optional().nullable(),
  simples_nacional: z.enum(["sim", "nao"]).optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contabilidadeId = Number(session.user.contabilidadeId);
    const clienteId = Number(params.id);
    
    if (isNaN(clienteId)) {
      return NextResponse.json(
        { error: "ID do cliente inválido" },
        { status: 400 }
      );
    }

    // Busca o cliente específico
    const cliente = await db.query.clientes.findFirst({
      where: and(
        eq(clientes.id, clienteId),
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contabilidadeId = Number(session.user.contabilidadeId);
    const clienteId = Number(params.id);
    
    if (isNaN(clienteId)) {
      return NextResponse.json(
        { error: "ID do cliente inválido" },
        { status: 400 }
      );
    }
    
    // Verifica se o cliente existe e pertence à contabilidade do usuário
    const clienteExistente = await db.query.clientes.findFirst({
      where: and(
        eq(clientes.id, clienteId),
        eq(clientes.contabilidadeId, contabilidadeId)
      ),
    });

    if (!clienteExistente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Valida os dados recebidos
    const validacao = clienteSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { error: "Dados inválidos", detalhes: validacao.error.format() },
        { status: 400 }
      );
    }

    // Atualiza o cliente
    const clienteAtualizado = await db
      .update(clientes)
      .set({
        ...validacao.data,
        dataAtualizacao: new Date(),
      })
      .where(and(
        eq(clientes.id, clienteId),
        eq(clientes.contabilidadeId, contabilidadeId)
      ))
      .returning();

    return NextResponse.json(clienteAtualizado[0]);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contabilidadeId = Number(session.user.contabilidadeId);
    const clienteId = Number(params.id);
    
    if (isNaN(clienteId)) {
      return NextResponse.json(
        { error: "ID do cliente inválido" },
        { status: 400 }
      );
    }
    
    // Verifica se o cliente existe e pertence à contabilidade do usuário
    const clienteExistente = await db.query.clientes.findFirst({
      where: and(
        eq(clientes.id, clienteId),
        eq(clientes.contabilidadeId, contabilidadeId)
      ),
    });

    if (!clienteExistente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Em vez de excluir fisicamente, desativa o cliente
    const clienteDesativado = await db
      .update(clientes)
      .set({
        ativo: false,
        dataAtualizacao: new Date(),
      })
      .where(and(
        eq(clientes.id, clienteId),
        eq(clientes.contabilidadeId, contabilidadeId)
      ))
      .returning();

    return NextResponse.json(clienteDesativado[0]);
  } catch (error) {
    console.error("Erro ao desativar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao desativar cliente" },
      { status: 500 }
    );
  }
}