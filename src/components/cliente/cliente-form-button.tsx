"use client";

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import ClienteForm from "./cliente-form";

export default function ClienteFormButton() {
  return (
    <ClienteForm>
      <Button className="gap-2">
        <UserPlus className="h-4 w-4" />
        Novo Cliente
      </Button>
    </ClienteForm>
  );
}