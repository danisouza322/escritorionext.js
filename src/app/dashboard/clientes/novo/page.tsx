import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClienteForm from "@/components/cliente/cliente-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NovoClientePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Link href="/dashboard/clientes">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            Novo Cliente
          </h1>
          <p className="text-muted-foreground">
            Adicione um novo cliente ao sistema
          </p>
        </div>
      </div>
      
      <div className="bg-card border rounded-lg p-6">
        <ClienteForm embedded={true} />
      </div>
    </div>
  );
}