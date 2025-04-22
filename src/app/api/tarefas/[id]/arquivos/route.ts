import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { tarefas, arquivosTarefas } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";

// Diretório para salvar os arquivos
const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "tarefas");

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const tarefaId = Number(params.id);
    const contabilidadeId = Number(session.user.contabilidadeId);

    // Verificar se a tarefa pertence à contabilidade do usuário
    const [tarefa] = await db
      .select()
      .from(tarefas)
      .where(
        and(
          eq(tarefas.id, tarefaId),
          eq(tarefas.contabilidadeId, contabilidadeId)
        )
      );

    if (!tarefa) {
      return new NextResponse("Tarefa não encontrada", { status: 404 });
    }

    // Buscar os arquivos
    const arquivos = await db.query.arquivosTarefas.findMany({
      where: eq(arquivosTarefas.tarefaId, tarefaId),
      with: {
        usuario: true,
      },
      orderBy: (arquivosTarefas, { desc }) => [desc(arquivosTarefas.dataCriacao)],
    });

    return NextResponse.json(arquivos);
  } catch (error) {
    console.error("Erro ao buscar arquivos:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const tarefaId = Number(params.id);
    const contabilidadeId = Number(session.user.contabilidadeId);
    const usuarioId = Number(session.user.id);

    // Verificar se a tarefa pertence à contabilidade do usuário
    const [tarefa] = await db
      .select()
      .from(tarefas)
      .where(
        and(
          eq(tarefas.id, tarefaId),
          eq(tarefas.contabilidadeId, contabilidadeId)
        )
      );

    if (!tarefa) {
      return new NextResponse("Tarefa não encontrada", { status: 404 });
    }

    // Verificar se o request tem um arquivo
    const formData = await request.formData();
    const file = formData.get("arquivo") as File;

    if (!file) {
      return new NextResponse("Nenhum arquivo enviado", { status: 400 });
    }

    // Criar pasta de uploads caso não exista
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error("Erro ao criar diretório:", error);
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split(".").pop() || "";
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = join(UPLOAD_DIR, fileName);
    const fileRelativePath = `/uploads/tarefas/${fileName}`;

    // Salvar o arquivo
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);

    // Salvar referência no banco de dados
    const [novoArquivo] = await db
      .insert(arquivosTarefas)
      .values({
        tarefaId,
        usuarioId,
        nome: file.name,
        tipo: file.type,
        tamanho: file.size,
        caminho: fileRelativePath,
        ativo: true,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      })
      .returning();

    // Buscar o arquivo com dados do usuário
    const arquivoCompleto = await db.query.arquivosTarefas.findFirst({
      where: eq(arquivosTarefas.id, novoArquivo.id),
      with: {
        usuario: true,
      },
    });

    return NextResponse.json(arquivoCompleto, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar arquivo:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}