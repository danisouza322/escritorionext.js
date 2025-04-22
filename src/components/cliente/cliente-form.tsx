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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
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
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  endereco: z.string().optional().or(z.literal("")),
  cidade: z.string().optional().or(z.literal("")),
  estado: z.string().optional().or(z.literal("")),
  cep: z.string().optional().or(z.literal("")),
  data_abertura: z.string().optional().or(z.literal("")),
  natureza_juridica: z.string().optional().or(z.literal("")),
  atividade_principal: z.string().optional().or(z.literal("")),
  simples_nacional: z.enum(["sim", "nao"]).optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
});

type ClienteFormValues = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  children?: React.ReactNode;
  cliente?: Cliente; // Cliente para edição
  onClose?: () => void; // Callback quando o modal é fechado
  onSuccess?: (cliente: Cliente) => void; // Callback após o sucesso
}

export default function ClienteForm({ children, cliente, onClose, onSuccess }: ClienteFormProps) {
  const [isOpen, setIsOpen] = useState(cliente ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConsultandoCNPJ, setIsConsultandoCNPJ] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Valor inicial do formulário
  const defaultValues: Partial<ClienteFormValues> = cliente
    ? {
        ...cliente,
        email: cliente.email || "",
        telefone: cliente.telefone || "",
        endereco: cliente.endereco || "",
        cidade: cliente.cidade || "",
        estado: cliente.estado || "",
        cep: cliente.cep || "",
        data_abertura: cliente.data_abertura || "",
        natureza_juridica: cliente.natureza_juridica || "",
        atividade_principal: cliente.atividade_principal || "",
        simples_nacional: cliente.simples_nacional || "nao",
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
      };

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues,
  });

  // Função para consultar CNPJ
  async function consultarCNPJ(documento: string) {
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
      form.setValue("simples_nacional", data.simples_nacional || "nao");
      
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
  }

  async function onSubmit(data: ClienteFormValues) {
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
          throw new Error("Erro ao atualizar cliente");
        }

        toast({
          title: "Cliente atualizado",
          description: "O cliente foi atualizado com sucesso",
        });
      } 
      // Se for criação
      else {
        const response = await fetch("/api/clientes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Erro ao criar cliente");
        }

        toast({
          title: "Cliente criado",
          description: "O cliente foi criado com sucesso",
        });
      }

      // Fechar modal e chamar callbacks
      setIsOpen(false);
      
      // Se for edição e temos uma função de sucesso, chamá-la
      if (cliente && onSuccess) {
        // Buscar cliente atualizado
        const fetchResponse = await fetch(`/api/clientes/${cliente.id}`);
        if (fetchResponse.ok) {
          const clienteAtualizado = await fetchResponse.json();
          onSuccess(clienteAtualizado);
        } else {
          // Falha ao obter dados atualizados, apenas atualizar página
          router.refresh();
        }
      } else {
        // Atualizar a página nos outros casos
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
        description: "Ocorreu um erro ao salvar o cliente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Função para lidar com a alteração do estado do modal
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Se o modal estiver sendo fechado e temos um callback de fechamento
    if (!open && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || <Button>Novo Cliente</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto" aria-describedby="cliente-form-description">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar" : "Novo"} Cliente</DialogTitle>
          <DialogDescription id="cliente-form-description">
            Preencha os dados do cliente abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Pessoa</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                        <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{form.watch("tipo") === "pessoa_fisica" ? "CPF" : "CNPJ"}</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder={form.watch("tipo") === "pessoa_fisica" ? "000.000.000-00" : "00.000.000/0000-00"} {...field} />
                      </FormControl>
                      
                      {form.watch("tipo") === "pessoa_juridica" && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => consultarCNPJ(field.value)}
                          disabled={isConsultandoCNPJ || !field.value}
                          title="Consultar CNPJ"
                        >
                          {isConsultandoCNPJ ? (
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder={form.watch("tipo") === "pessoa_fisica" ? "Nome completo" : "Razão Social"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch("tipo") === "pessoa_juridica" && (
                <>
                  <FormField
                    control={form.control}
                    name="data_abertura"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Abertura</FormLabel>
                        <FormControl>
                          <Input placeholder="01/01/2000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="natureza_juridica"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Natureza Jurídica</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Sociedade Empresária Limitada" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="atividade_principal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Atividade Principal</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Comércio varejista de..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="simples_nacional"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Optante pelo Simples Nacional</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "nao"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número, complemento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="UF" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="00000-000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Informações adicionais sobre o cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
