import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { clientes, documentos, tarefas } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, FolderKanban, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formataTelefone, formataDocumento } from "@/lib/utils";
import UploadDocumento from "@/components/documento/upload-documento";
import DocumentoList from "@/components/documento/documento-list";
import TarefaList from "@/components/tarefa/tarefa-list";
import TarefaForm from "@/components/tarefa/tarefa-form";
import RemoveClienteButton from "@/components/cliente/remove-cliente-button";

// Solução alternativa para o problema do params.id
interface PageProps {
  params: { id: string };
}

// Função para buscar as informações do cliente
async function getData(clienteIdParam: string) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return { redirect: "/auth" };
  }
  
  const clienteId = Number(clienteIdParam);
  
  if (isNaN(clienteId) || clienteIdParam === 'cadastrar') {
    return { redirect: "/dashboard/clientes" };
  }
  
  const contabilidadeId = Number(session.user.contabilidadeId);
  
  // Buscar cliente
  const cliente = await db.query.clientes.findFirst({
    where: and(
      eq(clientes.contabilidadeId, contabilidadeId),
      eq(clientes.id, clienteId)
    ),
  });
  
  if (!cliente) {
    return { notFound: true };
  }
  
  // Buscar documentos do cliente
  const documentosCliente = await db.query.documentos.findMany({
    where: and(
      eq(documentos.contabilidadeId, contabilidadeId),
      eq(documentos.clienteId, clienteId)
    ),
    orderBy: [desc(documentos.dataCriacao)],
    with: {
      usuarioUpload: true,
    },
  });
  
  // Buscar tarefas do cliente
  const tarefasCliente = await db.query.tarefas.findMany({
    where: and(
      eq(tarefas.contabilidadeId, contabilidadeId),
      eq(tarefas.clienteId, clienteId)
    ),
    orderBy: [desc(tarefas.dataVencimento)],
    with: {
      responsavel: true,
    },
  });
  
  // Buscar colaboradores para o form de tarefa
  const colaboradores = await db.query.usuarios.findMany({
    where: eq(tarefas.contabilidadeId, contabilidadeId),
  });
  
  return {
    cliente,
    documentosCliente,
    tarefasCliente,
    colaboradores,
    clienteId,
    contabilidadeId
  };
}

export default async function ClienteDetalhesPage(props: PageProps) {
  // Extraímos o ID do cliente de forma segura, criando uma variável com o valor em string
  const clienteIdStr = String(props.params.id);
  
  // Buscamos os dados usando a função auxiliar
  const data = await getData(clienteIdStr);
  
  if ('redirect' in data) {
    redirect(data.redirect);
  }
  
  if ('notFound' in data) {
    notFound();
  }
  
  // Extraímos todos os dados necessários retornados pela função
  const { cliente, documentosCliente, tarefasCliente, colaboradores, clienteId } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/clientes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{cliente.nome}</h1>
            <p className="text-muted-foreground">
              {cliente.tipo === "pessoa_fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <RemoveClienteButton id={clienteId} />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
          <CardDescription>Informações cadastrais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Documento</p>
              <p>{formataDocumento(cliente.documento, cliente.tipo)}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Email</p>
              <p>{cliente.email || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Telefone</p>
              <p>{cliente.telefone ? formataTelefone(cliente.telefone) : "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Endereço</p>
              <p>
                {cliente.endereco 
                  ? `${cliente.endereco}, ${cliente.cidade}/${cliente.estado}, ${cliente.cep}`
                  : "Não informado"}
              </p>
            </div>
            {cliente.observacoes && (
              <div className="col-span-2">
                <p className="text-sm font-medium mb-1">Observações</p>
                <p>{cliente.observacoes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="documentos">
        <TabsList className="mb-4">
          <TabsTrigger value="documentos" className="gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="tarefas" className="gap-2">
            <FolderKanban className="h-4 w-4" />
            Tarefas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="documentos" className="space-y-4">
          <div className="flex justify-end">
            <UploadDocumento clienteId={clienteId} />
          </div>
          
          <DocumentoList documentos={documentosCliente} />
        </TabsContent>
        
        <TabsContent value="tarefas" className="space-y-4">
          <div className="flex justify-end">
            <TarefaForm 
              clienteId={clienteId} 
              colaboradores={colaboradores}
            />
          </div>
          
          <TarefaList tarefas={tarefasCliente} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
