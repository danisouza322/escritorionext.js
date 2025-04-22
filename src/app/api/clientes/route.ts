import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

// Validação dos dados de cliente
const clienteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["pessoa_fisica", "pessoa_juridica"]),
  documento: z.string().min(1, "Documento é obrigatório"),
  email: z.union([
    z.string().email("Email inválido"),
    z.string().length(0),
    z.null()
  ]).optional(),
  telefone: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  // Novos campos para pessoa jurídica
  data_abertura: z.string().optional().nullable(),
  natureza_juridica: z.string().optional().nullable(),
  atividade_principal: z.string().optional().nullable(),
  simples_nacional: z.enum(["sim", "nao"]).optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contabilidadeId = Number(session.user.contabilidadeId);
    
    // Busca clientes da contabilidade do usuário logado
    const clientesList = await db.query.clientes.findMany({
      where: eq(clientes.contabilidadeId, contabilidadeId),
      orderBy: [desc(clientes.dataCriacao)],
    });

    return NextResponse.json(clientesList);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar clientes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contabilidadeId = Number(session.user.contabilidadeId);
    const body = await request.json();
    
    // Valida os dados recebidos
    const validacao = clienteSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { error: "Dados inválidos", detalhes: validacao.error.format() },
        { status: 400 }
      );
    }

    // Cria o novo cliente
    const novoCliente = await db
      .insert(clientes)
      .values({
        ...validacao.data,
        contabilidadeId,
      })
      .returning();

    return NextResponse.json(novoCliente[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}
