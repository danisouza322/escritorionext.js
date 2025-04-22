import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { usuarios } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { hash } from "bcrypt";

// Validação dos dados de colaborador
const colaboradorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  tipo: z.enum(["admin", "contador", "assistente"]),
  fotoPerfil: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    if (session.user.tipo !== "admin") {
      return NextResponse.json(
        { error: "Acesso restrito a administradores" },
        { status: 403 }
      );
    }

    const contabilidadeId = Number(session.user.contabilidadeId);
    
    // Busca colaboradores da contabilidade do usuário logado
    const colaboradoresList = await db.query.usuarios.findMany({
      where: eq(usuarios.contabilidadeId, contabilidadeId),
      orderBy: [desc(usuarios.dataCriacao)],
    });

    // Remove a senha dos resultados
    const colaboradoresSemSenha = colaboradoresList.map(({ senha, ...colaborador }) => colaborador);

    return NextResponse.json(colaboradoresSemSenha);
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return NextResponse.json(
      { error: "Erro ao buscar colaboradores" },
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

    // Verificar se é admin
    if (session.user.tipo !== "admin") {
      return NextResponse.json(
        { error: "Acesso restrito a administradores" },
        { status: 403 }
      );
    }

    const contabilidadeId = Number(session.user.contabilidadeId);
    const body = await request.json();
    
    // Valida os dados recebidos
    const validacao = colaboradorSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { error: "Dados inválidos", detalhes: validacao.error.format() },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const colaboradorExistente = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, validacao.data.email),
    });

    if (colaboradorExistente) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const senhaHash = await hash(validacao.data.senha, 10);

    // Cria o novo colaborador
    const novoColaborador = await db
      .insert(usuarios)
      .values({
        ...validacao.data,
        senha: senhaHash,
        contabilidadeId,
      })
      .returning();

    // Remove a senha do retorno
    const { senha, ...colaboradorSemSenha } = novoColaborador[0];

    return NextResponse.json(colaboradorSemSenha, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar colaborador:", error);
    return NextResponse.json(
      { error: "Erro ao criar colaborador" },
      { status: 500 }
    );
  }
}
