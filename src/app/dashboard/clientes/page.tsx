import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clientes } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import ClienteList from "@/components/cliente/cliente-list";
import ClienteFormButton from "@/components/cliente/cliente-form-button";
import { Cliente } from "@/types";

export default async function ClientesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  const contabilidadeId = Number(session.user.contabilidadeId);
  
  // Buscar apenas clientes ativos
  const clientesList = await db.query.clientes.findMany({
    where: and(
      eq(clientes.contabilidadeId, contabilidadeId),
      eq(clientes.ativo, true)
    ),
    orderBy: [desc(clientes.dataCriacao)],
  });
  
  // Contagem por tipo
  const pessoasFisicas = clientesList.filter(c => c.tipo === "pessoa_fisica").length;
  const pessoasJuridicas = clientesList.filter(c => c.tipo === "pessoa_juridica").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e seus dados
          </p>
        </div>
        <ClienteFormButton />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Total de Clientes</p>
          <p className="text-3xl font-bold">{clientesList.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Pessoas Físicas</p>
          <p className="text-3xl font-bold">{pessoasFisicas}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">Pessoas Jurídicas</p>
          <p className="text-3xl font-bold">{pessoasJuridicas}</p>
        </div>
      </div>
      
      <ClienteList clientes={clientesList as Cliente[]} />
    </div>
  );
}
