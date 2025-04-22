import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { tarefas, observacoesTarefas } from "@/db/schema";
import { eq, desc, and, gte, lte, or, exists, asc } from "drizzle-orm";
import { z } from "zod";

// Validação dos dados de tarefa
const tarefaSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  tipo: z.enum(["fiscal", "contabil", "departamento_pessoal", "administrativa", "outro"]),
  status: z.enum(["pendente", "em_andamento", "concluida", "atrasada", "cancelada"]).default("pendente"),
  clienteId: z.number().optional().nullable(),
  responsavelId: z.number().optional().nullable(),
  descricao: z.string().optional().nullable(),
  dataVencimento: z.string().optional().nullable(),
  prioridade: z.number().default(0),
  recorrente: z.boolean().default(false),
  detalhesRecorrencia: z.any().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contabilidadeId = Number(session.user.contabilidadeId);
    const usuarioId = Number(session.user.id);
    const { searchParams } = new URL(request.url);
    
    // Parâmetros para filtragem
    const clienteId = searchParams.get("clienteId");
    const status = searchParams.get("status");
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const todos = searchParams.get("todos") === "true"; // Para permitir buscar todas as tarefas quando necessário
    
    // Construir condições de consulta
    let conditions = [eq(tarefas.contabilidadeId, contabilidadeId)];
    
    // Filtrar apenas tarefas onde o usuário é responsável OU é o criador
    // A não ser que a query 'todos' seja passada como true
    if (!todos) {
      const orConditions = [eq(tarefas.responsavelId, usuarioId)];
      
      // Adiciona a condição de criadorId apenas se a coluna existir
      // isso garante que a consulta funcione mesmo para tarefas antigas
      orConditions.push(eq(tarefas.criadorId, usuarioId));
      
      conditions.push(or(...orConditions));
    }
    
    if (clienteId) {
      conditions.push(eq(tarefas.clienteId, Number(clienteId)));
    }
    
    if (status) {
      conditions.push(eq(tarefas.status, status as any));
    }
    
    if (dataInicio && dataFim) {
      conditions.push(gte(tarefas.dataVencimento, new Date(dataInicio)));
      conditions.push(lte(tarefas.dataVencimento, new Date(dataFim)));
    }
    
    // Buscar tarefas com os filtros aplicados
    const tarefasList = await db.query.tarefas.findMany({
      where: and(...conditions),
      orderBy: [desc(tarefas.dataVencimento)],
      with: {
        cliente: true,
        responsavel: true,
        criador: true,
      },
    });

    return NextResponse.json(tarefasList);
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tarefas" },
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
    const usuarioId = Number(session.user.id);
    const body = await request.json();
    
    // Valida os dados recebidos
    const validacao = tarefaSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { error: "Dados inválidos", detalhes: validacao.error.format() },
        { status: 400 }
      );
    }

    // Prepara os dados para inserção
    const dadosTarefa = {
      ...validacao.data,
      contabilidadeId,
      // Se não for especificado um responsável, define o usuário atual como responsável
      responsavelId: validacao.data.responsavelId || usuarioId,
      // Sempre define o usuário atual como criador
      criadorId: usuarioId,
      dataVencimento: validacao.data.dataVencimento
        ? new Date(validacao.data.dataVencimento)
        : null,
    };

    // Cria a nova tarefa
    const novaTarefa = await db
      .insert(tarefas)
      .values(dadosTarefa)
      .returning();

    return NextResponse.json(novaTarefa[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return NextResponse.json(
      { error: "Erro ao criar tarefa" },
      { status: 500 }
    );
  }
}
