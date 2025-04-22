import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { documentos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import DocumentoList from "@/components/documento/documento-list";
import UploadDocumento from "@/components/documento/upload-documento";
import { FileUp } from "lucide-react";

export default async function DocumentosPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  const contabilidadeId = Number(session.user.contabilidadeId);
  
  // Buscar documentos
  const documentosList = await db.query.documentos.findMany({
    where: eq(documentos.contabilidadeId, contabilidadeId),
    orderBy: [desc(documentos.dataCriacao)],
    with: {
      cliente: true,
      usuarioUpload: true,
    },
  });
  
  // Buscar clientes para o form de upload
  const clientes = await db.query.clientes.findMany({
    where: eq(documentos.contabilidadeId, contabilidadeId),
  });
  
  // Contagem por tipo
  const tiposDocumentos = documentosList.reduce((acc, doc) => {
    acc[doc.tipo] = (acc[doc.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os documentos do escritório
          </p>
        </div>
        <UploadDocumento>
          <Button className="gap-2">
            <FileUp className="h-4 w-4" />
            Novo Documento
          </Button>
        </UploadDocumento>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Total</p>
          <p className="text-3xl font-bold">{documentosList.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Fiscais</p>
          <p className="text-3xl font-bold">{tiposDocumentos.fiscal || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Contábeis</p>
          <p className="text-3xl font-bold">{tiposDocumentos.contabil || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Dep. Pessoal</p>
          <p className="text-3xl font-bold">{tiposDocumentos.departamento_pessoal || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Jurídicos</p>
          <p className="text-3xl font-bold">{tiposDocumentos.juridico || 0}</p>
        </div>
      </div>
      
      <DocumentoList documentos={documentosList} />
    </div>
  );
}
