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
import {
  Form,
  FormControl,
  FormDescription,
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
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cliente, Usuario } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Esquema de validação da tarefa
const tarefaSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  tipo: z.enum(["fiscal", "contabil", "departamento_pessoal", "administrativa", "outro"]),
  status: z.enum(["pendente", "em_andamento", "concluida", "atrasada", "cancelada"]).default("pendente"),
  clienteId: z.string().optional(),
  responsavelId: z.string().optional(), // Mantido para compatibilidade
  responsaveis: z.array(z.string()).default([]), // Múltiplos responsáveis
  descricao: z.string().optional(),
  dataVencimento: z.string().optional(),
  prioridade: z.coerce.number().default(0),
  recorrente: z.boolean().default(false),
  // O arquivo não precisa ser incluído no schema já que será enviado separadamente
});

type TarefaFormValues = z.infer<typeof tarefaSchema>;

interface TarefaFormProps {
  children?: React.ReactNode;
  clienteId?: number; // Cliente pré-selecionado
  clientes?: Cliente[]; // Lista de clientes
  colaboradores?: Usuario[]; // Lista de colaboradores
}

export default function TarefaForm({ 
  children, 
  clienteId, 
  clientes = [], 
  colaboradores = [] 
}: TarefaFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingClientes, setIsLoadingClientes] = useState(false);
  const [clientesList, setClientesList] = useState<Cliente[]>(clientes);
  const router = useRouter();
  const { toast } = useToast();

  // Buscar lista de clientes se não for fornecida
  const fetchClientes = async () => {
    if (clienteId || clientesList.length > 0) return;
    
    setIsLoadingClientes(true);
    try {
      const response = await fetch("/api/clientes");
      if (!response.ok) throw new Error("Erro ao carregar clientes");
      
      const data = await response.json();
      setClientesList(data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de clientes",
        variant: "destructive",
      });
    } finally {
      setIsLoadingClientes(false);
    }
  };

  // Estado para o arquivo selecionado
  const [arquivo, setArquivo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configurar formulário
  const form = useForm<TarefaFormValues>({
    resolver: zodResolver(tarefaSchema),
    defaultValues: {
      titulo: "",
      tipo: "fiscal",
      status: "pendente",
      clienteId: clienteId ? String(clienteId) : undefined,
      responsavelId: undefined,
      responsaveis: [],
      descricao: "",
      dataVencimento: "",
      prioridade: 0,
      recorrente: false,
    },
  });

  async function onSubmit(data: TarefaFormValues) {
    setIsSubmitting(true);
    
    try {
      // Processar dados antes de enviar
      const processedData = {
        ...data,
        // Converter "0" para null onde apropriado e string para number onde necessário
        clienteId: data.clienteId === "0" ? null : data.clienteId ? Number(data.clienteId) : null,
        responsavelId: data.responsavelId === "0" ? null : data.responsavelId ? Number(data.responsavelId) : null,
        // Converter os IDs dos responsáveis para números
        responsaveis: data.responsaveis.map(id => Number(id)),
      };
      
      // Enviar para a API
      const response = await fetch("/api/tarefas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar tarefa");
      }

      const tarefaCriada = await response.json();
      
      // Se houver um arquivo para upload, enviar após criar a tarefa
      if (arquivo) {
        const formData = new FormData();
        formData.append("arquivo", arquivo);
        
        const uploadResponse = await fetch(`/api/tarefas/${tarefaCriada.id}/arquivos`, {
          method: "POST",
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          console.error("Erro ao fazer upload do arquivo");
          // Ainda assim continuamos, pois a tarefa já foi criada
        }
      }

      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso" + (arquivo ? ", incluindo o arquivo anexado" : ""),
      });

      // Fechar modal e atualizar dados
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a tarefa",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          // Buscar clientes
          fetchClientes();
          // Resetar o formulário para os valores padrão
          form.reset({
            titulo: "",
            tipo: "fiscal",
            status: "pendente",
            clienteId: clienteId ? String(clienteId) : undefined,
            responsavelId: undefined,
            responsaveis: [],
            descricao: "",
            dataVencimento: "",
            prioridade: 0,
            recorrente: false,
          });
          // Resetar o arquivo
          setArquivo(null);
        }
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button>Nova Tarefa</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="tarefa-form-description">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription id="tarefa-form-description">
            Preencha os detalhes da tarefa abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título da tarefa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
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
                        <SelectItem value="fiscal">Fiscal</SelectItem>
                        <SelectItem value="contabil">Contábil</SelectItem>
                        <SelectItem value="departamento_pessoal">Departamento Pessoal</SelectItem>
                        <SelectItem value="administrativa">Administrativa</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                        <SelectItem value="atrasada">Atrasada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {!clienteId && (
                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cliente (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingClientes ? (
                            <SelectItem value="" disabled>Carregando...</SelectItem>
                          ) : (
                            <>
                              <SelectItem value="0">Nenhum cliente</SelectItem>
                              {clientesList
                                .filter(cliente => cliente.ativo) // Filtra apenas clientes ativos
                                .map((cliente) => (
                                  <SelectItem key={cliente.id} value={String(cliente.id)}>
                                    {cliente.nome}
                                  </SelectItem>
                                ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="responsavelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável Principal</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o responsável principal (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Sem responsável</SelectItem>
                        {colaboradores.map((colaborador) => (
                          <SelectItem key={colaborador.id} value={String(colaborador.id)}>
                            {colaborador.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="responsaveis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsáveis Adicionais</FormLabel>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((userId, index) => {
                          const colaborador = colaboradores.find(col => col.id === Number(userId));
                          return colaborador ? (
                            <Badge 
                              key={userId} 
                              className="px-3 py-1"
                              variant="secondary"
                            >
                              {colaborador.nome}
                              <button
                                type="button"
                                className="ml-2 text-muted-foreground"
                                onClick={() => {
                                  const newResponsaveis = [...field.value];
                                  newResponsaveis.splice(index, 1);
                                  field.onChange(newResponsaveis);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                      <Select
                        onValueChange={(value) => {
                          if (value === "0") return;
                          if (!field.value.includes(value)) {
                            field.onChange([...field.value, value]);
                          }
                        }}
                        value=""
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Adicionar responsável" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colaboradores
                            .filter(col => !field.value.includes(String(col.id)))
                            .map((colaborador) => (
                              <SelectItem key={colaborador.id} value={String(colaborador.id)}>
                                {colaborador.nome}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormDescription>
                      Você pode adicionar múltiplos responsáveis para esta tarefa
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dataVencimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        placeholder="DD/MM/AAAA" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="prioridade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Normal</SelectItem>
                        <SelectItem value="1">Baixa</SelectItem>
                        <SelectItem value="2">Média</SelectItem>
                        <SelectItem value="3">Alta</SelectItem>
                        <SelectItem value="4">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes sobre a tarefa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="recorrente"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Tarefa recorrente</FormLabel>
                    <FormDescription>
                      Marque esta opção se a tarefa se repete periodicamente.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {/* Componente de upload de arquivo */}
            <div className="space-y-2">
              <FormLabel>Anexar Arquivo (opcional)</FormLabel>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Selecionar Arquivo
                </Button>
                {arquivo && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1">
                      {arquivo.name}
                      <button
                        type="button"
                        className="ml-2 text-muted-foreground"
                        onClick={() => setArquivo(null)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
              <FormDescription>
                Você pode anexar um arquivo à tarefa. Formatos suportados: PDF, Word, Excel, imagens
              </FormDescription>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    setArquivo(files[0]);
                  }
                }}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar Tarefa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
