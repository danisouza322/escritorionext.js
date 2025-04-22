import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formataDocumento, getTipoClienteLabel } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Cliente } from "@/types";

interface ClientOverviewProps {
  clientes: Cliente[];
}

export default function ClientOverview({ clientes }: ClientOverviewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Clientes Recentes</CardTitle>
          <CardDescription>
            Últimos clientes adicionados ao sistema
          </CardDescription>
        </div>
        <Link href="/dashboard/clientes">
          <Button variant="ghost" size="sm" className="gap-1">
            Ver mais
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {clientes.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">
            Nenhum cliente encontrado
          </p>
        ) : (
          <div className="space-y-4">
            {clientes.map((cliente) => (
              <Link key={cliente.id} href={`/dashboard/clientes/${cliente.id}`}>
                <div className="border rounded-lg p-3 hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">{cliente.nome}</div>
                    <Badge variant="outline">
                      {getTipoClienteLabel(cliente.tipo)}
                    </Badge>
                  </div>
                  <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                    <div>Documento: {formataDocumento(cliente.documento, cliente.tipo)}</div>
                    {cliente.email && <div>Email: {cliente.email}</div>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
