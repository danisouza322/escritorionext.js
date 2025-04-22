"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface RemoveClienteButtonProps {
  id: number;
}

export default function RemoveClienteButton({ id }: RemoveClienteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao desativar cliente");
      }

      toast({
        title: "Cliente desativado",
        description: "O cliente foi desativado com sucesso.",
      });

      // Fechar o modal
      setIsOpen(false);
      
      // Redirecionar para a lista de clientes
      router.push("/dashboard/clientes");
      router.refresh();
    } catch (error) {
      console.error("Erro ao desativar cliente:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao desativar cliente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desativar Cliente</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja desativar este cliente? Esta ação não pode ser desfeita.
            O cliente será marcado como inativo e não aparecerá mais nas listagens padrão.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Desativando..." : "Sim, desativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}