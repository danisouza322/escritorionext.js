import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { tarefas, observacoesTarefas, tarefasResponsaveis } from "@/db/schema";
import { eq, desc, and, gte, lte, or, exists, asc } from "drizzle-orm";
import { z } from "zod";

// Validação dos dados de tarefa
const tarefaSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  tipo: z.enum(["fiscal", "contabil", "departamento_pessoal", "administrativa", "outro"]),
  status: z.enum(["pendente", "em_andamento", "concluida", "atrasada", "cancelada"]).default("pendente"),
  clienteId: z.number().optional().nullable(),
  responsavelId: z.number().optional().nullable(), // Mantido para compatibilidade
  responsaveis: z.array(z.number()).optional().default([]), // Novo campo para múltiplos responsáveis
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
    
    // Filtrar apenas tarefas onde o usuário é responsável principal OU está na lista de responsáveis adicionais OU é o criador
    // A não ser que a query 'todos' seja passada como true
    if (!todos) {
      const orConditions = [
        // Condição 1: Usuário é o responsável principal
        eq(tarefas.responsavelId, usuarioId),
        
        // Condição 2: Usuário é o criador
        eq(tarefas.criadorId, usuarioId),
        
        // Condição 3: Usuário está na lista de responsáveis adicionais
        exists(
          db.select()
            .from(tarefasResponsaveis)
            .where(
              and(
                eq(tarefasResponsaveis.tarefaId, tarefas.id),
                eq(tarefasResponsaveis.usuarioId, usuarioId)
              )
            )
        )
      ];
      
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
        responsaveis: {
          with: {
            usuario: true,
          }
        },
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

    // Extrai lista de responsáveis para inserir na tabela de relacionamento
    const responsaveis = validacao.data.responsaveis || [];

    // Cria a nova tarefa
    const novaTarefa = await db
      .insert(tarefas)
      .values(dadosTarefa)
      .returning();

    const tarefaCriada = novaTarefa[0];

    // Se há responsáveis adicionais, insere na tabela de relacionamento
    if (responsaveis.length > 0) {
      const responsaveisValues = responsaveis.map(usuarioId => ({
        tarefaId: tarefaCriada.id,
        usuarioId: usuarioId,
      }));

      await db
        .insert(tarefasResponsaveis)
        .values(responsaveisValues);
    }

    // Se o próprio responsável principal (responsavelId) não está nos responsáveis múltiplos,
    // adiciona ele também na tabela de relacionamento para coerência de dados
    if (tarefaCriada.responsavelId && !responsaveis.includes(tarefaCriada.responsavelId)) {
      await db
        .insert(tarefasResponsaveis)
        .values({
          tarefaId: tarefaCriada.id,
          usuarioId: tarefaCriada.responsavelId,
        });
    }

    return NextResponse.json(tarefaCriada, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return NextResponse.json(
      { error: "Erro ao criar tarefa" },
      { status: 500 }
    );
  }
}
