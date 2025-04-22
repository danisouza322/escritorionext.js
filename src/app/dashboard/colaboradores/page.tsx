import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { usuarios } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import ColaboradorList from "@/components/colaborador/colaborador-list";
import ColaboradorForm from "@/components/colaborador/colaborador-form";
import { UserPlus } from "lucide-react";

export default async function ColaboradoresPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  // Verificar se é admin
  if (session.user.tipo !== "admin") {
    redirect("/dashboard");
  }

  const contabilidadeId = Number(session.user.contabilidadeId);
  
  // Buscar colaboradores
  const colaboradoresList = await db.query.usuarios.findMany({
    where: eq(usuarios.contabilidadeId, contabilidadeId),
    orderBy: [desc(usuarios.dataCriacao)],
  });
  
  // Remover senhas do resultado
  const colaboradoresSemSenha = colaboradoresList.map(({ senha, ...colaborador }) => colaborador);
  
  // Contagem por tipo
  const tiposUsuarios = colaboradoresSemSenha.reduce((acc, usuario) => {
    acc[usuario.tipo] = (acc[usuario.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Colaboradores</h1>
          <p className="text-muted-foreground">
            Gerencie a equipe do escritório
          </p>
        </div>
        <ColaboradorForm>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Novo Colaborador
          </Button>
        </ColaboradorForm>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Total</p>
          <p className="text-3xl font-bold">{colaboradoresSemSenha.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Administradores</p>
          <p className="text-3xl font-bold">{tiposUsuarios.admin || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Contadores</p>
          <p className="text-3xl font-bold">{tiposUsuarios.contador || 0}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Assistentes</p>
          <p className="text-3xl font-bold">{tiposUsuarios.assistente || 0}</p>
        </div>
      </div>
      
      <ColaboradorList colaboradores={colaboradoresSemSenha} />
    </div>
  );
}
