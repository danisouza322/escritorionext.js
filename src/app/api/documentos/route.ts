import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { documentos } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import path from "path";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

// Validação dos dados do documento (para upload via JSON)
const documentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["fiscal", "contabil", "departamento_pessoal", "juridico", "outro"]),
  clienteId: z.number().optional().nullable(),
  descricao: z.string().optional().nullable(),
  periodo: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const contabilidadeId = Number(session.user.contabilidadeId);
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get("clienteId");
    
    let documentosList;
    
    if (clienteId) {
      // Busca documentos específicos de um cliente
      documentosList = await db.query.documentos.findMany({
        where: and(
          eq(documentos.contabilidadeId, contabilidadeId),
          eq(documentos.clienteId, Number(clienteId))
        ),
        orderBy: [desc(documentos.dataCriacao)],
        with: {
          cliente: true,
          usuarioUpload: true,
        },
      });
    } else {
      // Busca todos os documentos da contabilidade
      documentosList = await db.query.documentos.findMany({
        where: eq(documentos.contabilidadeId, contabilidadeId),
        orderBy: [desc(documentos.dataCriacao)],
        with: {
          cliente: true,
          usuarioUpload: true,
        },
      });
    }

    return NextResponse.json(documentosList);
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar documentos" },
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
    
    const formData = await request.formData();
    
    // Obter arquivo
    const arquivo = formData.get("arquivo") as File;
    
    if (!arquivo) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }
    
    // Obter outros dados
    const nome = formData.get("nome") as string;
    const tipo = formData.get("tipo") as string;
    const clienteId = formData.get("clienteId") as string;
    const descricao = formData.get("descricao") as string;
    const periodo = formData.get("periodo") as string;
    
    // Validação básica
    if (!nome || !tipo) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }
    
    // Gerar nome único para o arquivo
    const uniqueId = uuidv4();
    const fileExtension = arquivo.name.split(".").pop();
    const fileName = `${uniqueId}.${fileExtension}`;
    const documentoPath = `/uploads/${contabilidadeId}/${fileName}`;
    
    // Preparar o diretório para a contabilidade (simulação)
    // Em um ambiente de produção, você salvaria o arquivo em um serviço de armazenamento como S3
    console.log(`Simulando salvamento do arquivo em: ${documentoPath}`);
    
    // Criar entrada no banco de dados
    const novoDocumento = await db
      .insert(documentos)
      .values({
        nome,
        tipo: tipo as any,
        clienteId: clienteId ? Number(clienteId) : null,
        descricao: descricao || null,
        periodo: periodo || null,
        caminho: documentoPath,
        tamanho: arquivo.size,
        contabilidadeId,
        usuarioUploadId: usuarioId,
        linkCompartilhamento: uuidv4(),
      })
      .returning();

    return NextResponse.json(novoDocumento[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao fazer upload de documento:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload de documento" },
      { status: 500 }
    );
  }
}
