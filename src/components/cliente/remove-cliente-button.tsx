"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface RemoveClienteButtonProps {
  id: number;
  nome: string;
  onSuccess?: () => void;
}

export default function RemoveClienteButton({ id, nome, onSuccess }: RemoveClienteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  async function removerCliente() {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao remover cliente");
      }

      toast({
        title: "Cliente removido",
        description: "O cliente foi removido com sucesso",
      });
      
      // Chamar callback se existir
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao remover cliente:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao remover o cliente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">Remover</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso irá remover permanentemente o cliente 
            <span className="font-semibold"> {nome}</span> e todos os dados associados a ele.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              removerCliente();
            }}
            className="bg-destructive hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? "Removendo..." : "Sim, remover cliente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}