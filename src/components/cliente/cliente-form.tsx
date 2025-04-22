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

  // Valor inicial do formulário
  const defaultValues: Partial<ClienteFormValues> = cliente
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
      
      console.log('Dados recebidos do CNPJ:', data);
      
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
      
      // Atualiza a seleção do Simples Nacional imediatamente no formulário
      console.log('Simples Nacional da API:', data.simples_nacional);
      
      // Força a atualização do campo diretamente
      try {
        const simples = data.simples_nacional === 'sim' ? 'sim' : 'nao';
        
        // Atualizar o valor e forçar renderização
        form.setValue("simples_nacional", simples, { 
          shouldDirty: true, 
          shouldTouch: true,
          shouldValidate: true
        });
        
        // Forçar atualização do form state
        form.trigger("simples_nacional");
        
        console.log('Definido simples_nacional para:', simples);
      } catch (error) {
        console.error('Erro ao atualizar simples_nacional:', error);
      }
      
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
          const errorData = await response.json().catch(() => ({}));
          console.error("Erro:", errorData);
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
          console.error("Erro:", errorData);
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
  }

  // Função para lidar com a alteração do estado do modal
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Se o modal estiver sendo fechado e temos um callback de fechamento
    if (!open && onClose) {
      onClose();
    }
  };

  // Conteúdo do formulário que será usado em ambos os modos (modal e embutido)
  const formContent = (
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
                  <Input 
                    placeholder="email@exemplo.com" 
                    type="email" 
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
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
                  <Input 
                    placeholder="(00) 00000-0000"
                    value={field.value || ""}  
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
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
                      <Input 
                        placeholder="01/01/2000"
                        value={field.value || ""}  
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
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
                      <Input 
                        placeholder="Ex: Sociedade Empresária Limitada"
                        value={field.value || ""}  
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
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
                      <Input 
                        placeholder="Ex: Comércio varejista de..."
                        value={field.value || ""}  
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="simples_nacional"
                render={({ field }) => {
                  // Usando o valor observado para garantir a reatividade do componente
                  const currentValue = form.watch("simples_nacional");
                  console.log('Valor atual do Simples Nacional:', currentValue);
                  
                  // Certificar-se de que é um valor válido
                  const safeValue = currentValue === "sim" ? "sim" : "nao";
                  
                  return (
                    <FormItem>
                      <FormLabel>Optante pelo Simples Nacional</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          // Garante que a atualização é aplicada corretamente
                          field.onChange(value);
                          console.log('Simples Nacional alterado para:', value);
                        }}
                        value={safeValue}
                        defaultValue="nao"
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
                  );
                }}
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
                  <Input 
                    placeholder="Rua, número, complemento"
                    value={field.value || ""}  
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
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
                  <Input 
                    placeholder="Cidade"
                    value={field.value || ""}  
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
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
                  <Input 
                    placeholder="UF" 
                    maxLength={2}
                    value={field.value || ""}  
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
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
                  <Input 
                    placeholder="00000-000"
                    value={field.value || ""}  
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
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
                <Textarea 
                  placeholder="Informações adicionais sobre o cliente"
                  value={field.value || ""}  
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          {embedded ? (
            <>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/dashboard/clientes')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Cliente"}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );

  // Se o formulário é embutido (não é um modal), renderizar diretamente
  if (embedded) {
    return formContent;
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
        {formContent}
      </DialogContent>
    </Dialog>
  );
}