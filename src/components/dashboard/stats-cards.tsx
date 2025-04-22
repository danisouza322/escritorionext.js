import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, FolderKanban, AlertCircle } from "lucide-react";

interface StatsCardsProps {
  totalClientes: number;
  totalDocumentos: number;
  tarefasEmAberto: number;
  tarefasAtrasadas: number;
}

export default function StatsCards({
  totalClientes,
  totalDocumentos,
  tarefasEmAberto,
  tarefasAtrasadas,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClientes}</div>
          <p className="text-xs text-muted-foreground">
            Clientes ativos do escritório
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Documentos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDocumentos}</div>
          <p className="text-xs text-muted-foreground">
            Documentos armazenados
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Minhas Tarefas Pendentes</CardTitle>
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tarefasEmAberto}</div>
          <p className="text-xs text-muted-foreground">
            Tarefas pendentes sob sua responsabilidade
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Minhas Tarefas Atrasadas</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{tarefasAtrasadas}</div>
          <p className="text-xs text-muted-foreground">
            Suas tarefas com prazo excedido
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
