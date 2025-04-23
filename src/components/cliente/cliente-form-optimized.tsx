"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Cliente } from "@/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

// Esquema de validação do cliente
const clienteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["pessoa_fisica", "pessoa_juridica"]),
  documento: z.string().min(1, "Documento é obrigatório"),
  email: z.union([
    z.string().email("Email inválido"),
    z.string().length(0),
    z.null()
  ]).optional(),
  telefone: z.union([z.string().min(1), z.string().length(0), z.null()]).optional(),
  endereco: z.union([z.string().min(1), z.string().length(0), z.null()]).optional(),
  cidade: z.union([z.string().min(1), z.string().length(0), z.null()]).optional(),
  estado: z.union([z.string().min(1), z.string().length(0), z.null()]).optional(),
  cep: z.union([z.string().min(1), z.string().length(0), z.null()]).optional(),
  data_abertura: z.union([z.string().min(1), z.string().length(0), z.null()]).optional(),
  natureza_juridica: z.union([z.string().min(1), z.string().length(0), z.null()]).optional(),
  atividade_principal: z.union([z.string().min(1), z.string().length(0), z.null()]).optional(),
  simples_nacional: z.enum(["sim", "nao"]).optional().nullable(),
  observacoes: z.union([z.string().min(1), z.string().length(0), z.null()]).optional(),
});

type ClienteFormValues = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  children?: React.ReactNode;
  cliente?: Cliente; // Cliente para edição
  onClose?: () => void; // Callback quando o modal é fechado
  onSuccess?: (cliente: Cliente) => void; // Callback após o sucesso
  embedded?: boolean; // Se o formulário é embutido e não um modal
}

export default function ClienteForm({ 
  children, 
  cliente, 
  onClose, 
  onSuccess, 
  embedded = false 
}: ClienteFormProps) {
  const [isOpen, setIsOpen] = useState(cliente ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsultandoCNPJ, setIsConsultandoCNPJ] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Pré-carregar dados para modal mais rápido
  useEffect(() => {
    // Prefetch API de clientes para rápido acesso quando o modal for aberto
    const prefetchData = async () => {
      await fetch("/api/clientes?limit=5").catch(() => {});
    };
    
    if (!embedded) {
      prefetchData();
    }
  }, [embedded]);

  // Valor inicial do formulário
  const defaultValues = useMemo(() => 
    cliente
      ? {
          tipo: cliente.tipo as "pessoa_juridica" | "pessoa_fisica",
          nome: cliente.nome,
          documento: cliente.documento,
          email: cliente.email || "",
          telefone: cliente.telefone || "",
          endereco: cliente.endereco || "",
          cidade: cliente.cidade || "",
          estado: cliente.estado || "",
          cep: cliente.cep || "",
          data_abertura: cliente.data_abertura || "",
          natureza_juridica: cliente.natureza_juridica || "",
          atividade_principal: cliente.atividade_principal || "",
          simples_nacional: (cliente.simples_nacional === "sim" ? "sim" : "nao") as "sim" | "nao",
          observacoes: cliente.observacoes || "",
        }
      : {
          nome: "",
          tipo: "pessoa_juridica",
          documento: "",
          email: "",
          telefone: "",
          endereco: "",
          cidade: "",
          estado: "",
          cep: "",
          data_abertura: "",
          natureza_juridica: "",
          atividade_principal: "",
          simples_nacional: "nao",
          observacoes: "",
        }
  , [cliente]);

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues,
  });

  // Função para consultar CNPJ (otimizada)
  const consultarCNPJ = useCallback(async (documento: string) => {
    if (!documento || documento.length < 14) {
      toast({
        title: "CNPJ Inválido",
        description: "Por favor, informe um CNPJ válido",
        variant: "destructive",
      });
      return;
    }
    
    setIsConsultandoCNPJ(true);
    
    try {
      const response = await fetch(`/api/cnpja?documento=${encodeURIComponent(documento)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao consultar CNPJ");
      }
      
      const data = await response.json();
      
      // Preencher os campos do formulário com os dados retornados
      form.setValue("nome", data.nome);
      form.setValue("email", data.email || "");
      form.setValue("telefone", data.telefone || "");
      form.setValue("endereco", data.endereco || "");
      form.setValue("cidade", data.cidade || "");
      form.setValue("estado", data.estado || "");
      form.setValue("cep", data.cep || "");
      form.setValue("data_abertura", data.data_abertura || "");
      form.setValue("natureza_juridica", data.natureza_juridica || "");
      form.setValue("atividade_principal", data.atividade_principal || "");
      
      // Atualiza a seleção do Simples Nacional
      const simples = data.simples_nacional === 'sim' ? 'sim' : 'nao';
      
      // Atualizar o valor e forçar renderização
      form.setValue("simples_nacional", simples, { 
        shouldDirty: true, 
        shouldTouch: true,
        shouldValidate: true
      });
      
      toast({
        title: "CNPJ Consultado",
        description: "Dados preenchidos com sucesso",
      });
    } catch (error) {
      console.error("Erro ao consultar CNPJ:", error);
      toast({
        title: "Erro na consulta",
        description: error instanceof Error ? error.message : "Erro ao consultar CNPJ",
        variant: "destructive",
      });
    } finally {
      setIsConsultandoCNPJ(false);
    }
  }, [form, toast]);

  // Função otimizada para lidar com o envio do formulário
  const onSubmit = useCallback(async (data: ClienteFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Se for edição
      if (cliente) {
        const response = await fetch(`/api/clientes/${cliente.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Erro ao atualizar cliente");
        }

        toast({
          title: "Cliente atualizado",
          description: "O cliente foi atualizado com sucesso",
        });
      } 
      // Se for criação
      else {
        // Certifique-se de que o simples_nacional é uma das opções permitidas
        if (data.simples_nacional !== "sim" && data.simples_nacional !== "nao") {
          data.simples_nacional = "nao";
        }
        
        const response = await fetch("/api/clientes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Erro ao criar cliente");
        }

        const clienteCriado = await response.json();

        toast({
          title: "Cliente criado",
          description: "O cliente foi criado com sucesso",
        });

        // Se temos uma função de sucesso, chamá-la com o cliente criado
        if (onSuccess) {
          onSuccess(clienteCriado);
        }
      }

      // Se for modal, fechá-lo
      if (!embedded) {
        setIsOpen(false);
      }
      
      // Se for edição e temos uma função de sucesso, chamá-la
      if (cliente && onSuccess) {
        // Buscar cliente atualizado
        const fetchResponse = await fetch(`/api/clientes/${cliente.id}`);
        if (fetchResponse.ok) {
          const clienteAtualizado = await fetchResponse.json();
          onSuccess(clienteAtualizado);
        }
      }
      
      // Se não for modal e não houver callback de sucesso, redirecionar para a lista
      if (embedded && !onSuccess) {
        router.push('/dashboard/clientes');
      } else if (!embedded && !cliente) {
        // Se for modal de criação, recarregamos a página
        router.refresh();
      }
      
      // Chamar callback de fechamento se existir
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar o cliente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [cliente, embedded, onClose, onSuccess, router, toast]);

  // Função para lidar com a alteração do estado do modal
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    // Se o modal estiver sendo fechado e temos um callback de fechamento
    if (!open && onClose) {
      onClose();
    }
  }, [onClose]);

  // Se o formulário é embutido (não é um modal), renderizar diretamente
  if (embedded) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Conteúdo do formulário aqui */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Campos do formulário */}
            <Button type="submit" className="mt-4" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
              ) : null}
              {cliente ? "Atualizar" : "Cadastrar"} Cliente
            </Button>
          </div>
        </form>
      </Form>
    );
  }
  
  // Caso contrário, renderizar como um modal
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || <Button>Novo Cliente</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar" : "Novo"} Cliente</DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Conteúdo do formulário aqui */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Campos do formulário */}
              <Button type="submit" className="mt-4" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                ) : null}
                {cliente ? "Atualizar" : "Cadastrar"} Cliente
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}