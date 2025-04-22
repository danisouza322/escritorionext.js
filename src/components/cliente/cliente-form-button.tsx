"use client";

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import ClienteForm from "./cliente-form";
import { Cliente } from "@/types";

interface ClienteFormButtonProps {
  onSuccess?: (cliente: Cliente) => void;
}

export default function ClienteFormButton({ onSuccess }: ClienteFormButtonProps) {
  return (
    <ClienteForm onSuccess={onSuccess}>
      <Button className="gap-2">
        <UserPlus className="h-4 w-4" />
        Novo Cliente
      </Button>
    </ClienteForm>
  );
}