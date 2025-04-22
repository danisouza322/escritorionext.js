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

// DELETE para remover um arquivo específico
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Obter o ID do arquivo da URL de consulta
    const url = new URL(request.url);
    const arquivoId = url.searchParams.get("arquivoId");
    
    if (!arquivoId) {
      return new NextResponse("ID do arquivo não fornecido", { status: 400 });
    }

    const tarefaId = parseInt(context.params.id as string, 10);
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

    // Buscar o arquivo para verificar se o usuário atual é o autor
    const [arquivo] = await db
      .select()
      .from(arquivosTarefas)
      .where(
        and(
          eq(arquivosTarefas.id, parseInt(arquivoId, 10)),
          eq(arquivosTarefas.tarefaId, tarefaId)
        )
      );

    if (!arquivo) {
      return new NextResponse("Arquivo não encontrado", { status: 404 });
    }

    // Verificar se o usuário atual é o autor do arquivo
    if (arquivo.usuarioId !== usuarioId) {
      return new NextResponse("Você não tem permissão para excluir este arquivo", { status: 403 });
    }

    // Excluir o arquivo (usando exclusão lógica, apenas marcando como inativo)
    await db
      .update(arquivosTarefas)
      .set({ 
        ativo: false,
        dataAtualizacao: new Date() 
      })
      .where(eq(arquivosTarefas.id, parseInt(arquivoId, 10)));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir arquivo:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

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
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const tarefaId = Number(context.params.id);
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