import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contabilidades, usuarios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hash } from "bcrypt";
import { sql } from "drizzle-orm";

// Validação para criar contabilidade
const contabilidadeSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().min(14, "CNPJ é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  usuario: z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    tipo: z.enum(["admin", "contador", "assistente"]).default("admin"),
    fotoPerfil: z.string().optional().nullable(),
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Valida os dados recebidos
    const validacao = contabilidadeSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        { error: "Dados inválidos", detalhes: validacao.error.format() },
        { status: 400 }
      );
    }

    // Verificar se CNPJ já existe
    const contabilidadesResult = await db
      .select()
      .from(contabilidades)
      .where(eq(contabilidades.cnpj, validacao.data.cnpj));
    
    const contabilidadeExistente = contabilidadesResult.length > 0 ? contabilidadesResult[0] : null;

    if (contabilidadeExistente) {
      return NextResponse.json(
        { error: "CNPJ já cadastrado" },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const usuariosResult = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, validacao.data.usuario.email));
    
    const usuarioExistente = usuariosResult.length > 0 ? usuariosResult[0] : null;

    if (usuarioExistente) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const senhaHash = await hash(validacao.data.usuario.senha, 10);

    // Transação para criar contabilidade e usuário
    // Em um ambiente de produção, você usaria transações reais
    // Aqui simulamos uma operação sequencial
    
    // Cria a contabilidade
    const novaContabilidade = await db
      .insert(contabilidades)
      .values({
        nome: validacao.data.nome,
        cnpj: validacao.data.cnpj,
        email: validacao.data.email,
        telefone: validacao.data.telefone,
        endereco: validacao.data.endereco,
        cidade: validacao.data.cidade,
        estado: validacao.data.estado,
        cep: validacao.data.cep,
        logo: validacao.data.logo,
      })
      .returning();

    // Cria o usuário admin
    await db
      .insert(usuarios)
      .values({
        contabilidadeId: novaContabilidade[0].id,
        nome: validacao.data.usuario.nome,
        email: validacao.data.usuario.email,
        senha: senhaHash,
        tipo: validacao.data.usuario.tipo,
        fotoPerfil: validacao.data.usuario.fotoPerfil,
      });

    return NextResponse.json(
      { message: "Contabilidade criada com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar contabilidade:", error);
    return NextResponse.json(
      { error: "Erro ao criar contabilidade" },
      { status: 500 }
    );
  }
}
