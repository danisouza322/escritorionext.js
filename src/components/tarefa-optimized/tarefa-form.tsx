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
import { useState, useRef, useCallback, useEffect } from "react";
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
  prioridade: z.enum(["1", "2", "3"]).default("2"),
  recorrente: z.boolean().default(false),
  arquivos: z.array(z.instanceof(File)).default([]),
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  // Otimização: Pré-carregar dados para melhorar a performance
  useEffect(() => {
    // Prefetch API para carregamento mais rápido
    const prefetchData = async () => {
      if (!isOpen) {
        try {
          // Prefetch de APIs frequentemente utilizadas
          fetch('/api/tarefas?limit=5').catch(() => {});
          fetch('/api/clientes?limit=5').catch(() => {});
        } catch (error) {
          // Ignorar silenciosamente erros durante prefetch
        }
      }
    };
    
    prefetchData();
  }, [isOpen]);
  
  // Inicializa o formulário com valores padrão
  const form = useForm<TarefaFormValues>({
    resolver: zodResolver(tarefaSchema),
    defaultValues: {
      titulo: "",
      tipo: "administrativa",
      status: "pendente",
      clienteId: clienteId ? String(clienteId) : undefined,
      responsavelId: undefined,
      responsaveis: [],
      descricao: "",
      dataVencimento: "",
      prioridade: "2",
      recorrente: false,
      arquivos: [],
    },
  });

  // Handler de troca de arquivos (otimizado)
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      form.setValue('arquivos', [...selectedFiles, ...newFiles]);
    }
  }, [form, selectedFiles]);

  // Remover arquivo (otimizado)
  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      
      // Atualizar o valor do formulário também
      form.setValue('arquivos', updated);
      
      return updated;
    });
  }, [form]);

  // Abrir o seletor de arquivos (otimizado)
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Submissão do formulário (otimizado)
  const onSubmit = useCallback(async (data: TarefaFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Vamos separar os dados em JSON para o endpoint principal
      // e posteriormente fazer upload de arquivos se necessário
      
      // Preparar dados para JSON
      const jsonData = {
        titulo: data.titulo,
        tipo: data.tipo,
        status: data.status,
        descricao: data.descricao || '',
        prioridade: data.prioridade,
        recorrente: data.recorrente,
      };
      
      // Cliente (opcional)
      if (data.clienteId) {
        jsonData.clienteId = Number(data.clienteId);
      }
      
      // Data de vencimento (opcional)
      if (data.dataVencimento) {
        jsonData.dataVencimento = data.dataVencimento;
      }
      
      // Responsáveis - preservando o responsavelId para compatibilidade
      // e adicionando os novos responsáveis
      if (data.responsaveis.length > 0) {
        // O primeiro responsável da lista se torna o principal
        jsonData.responsavelId = Number(data.responsaveis[0]);
        
        // Converter para números
        jsonData.responsaveis = data.responsaveis.map(id => Number(id));
      }
      
      // Enviar dados JSON para a API
      const response = await fetch('/api/tarefas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao criar tarefa');
      }
      
      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso",
      });
      
      // Limpar formulário e fechar modal
      form.reset();
      setSelectedFiles([]);
      setIsOpen(false);
      
      // Recarregar a página para mostrar a nova tarefa
      router.refresh();
      
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar a tarefa",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, router, toast]);

  // Handler de alteração do modal (otimizado)
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || <Button>Nova Tarefa</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da tarefa abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="clienteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={clienteId ? String(clienteId) : undefined}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Sem cliente</SelectItem>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={String(cliente.id)}>
                            {cliente.nome}
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
                    <FormLabel>Responsáveis</FormLabel>
                    <div className="relative">
                      <Select 
                        onValueChange={(value) => {
                          if (!value) return;
                          
                          // Se o valor já existe na lista, não adicionar
                          if (field.value.includes(value)) return;
                          
                          // Adicionar à lista de responsáveis
                          const newValue = [...field.value, value];
                          field.onChange(newValue);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione responsáveis" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colaboradores.map((colaborador) => (
                            <SelectItem key={colaborador.id} value={String(colaborador.id)}>
                              {colaborador.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Exibir responsáveis selecionados como badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((respId, index) => {
                        const colaborador = colaboradores.find(c => String(c.id) === respId);
                        return (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {colaborador?.nome || `Responsável ${index + 1}`}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => {
                                const newValue = [...field.value];
                                newValue.splice(index, 1);
                                field.onChange(newValue);
                              }} 
                            />
                          </Badge>
                        );
                      })}
                    </div>
                    
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
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="prioridade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Baixa</SelectItem>
                        <SelectItem value="2">Média</SelectItem>
                        <SelectItem value="3">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="arquivos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arquivos</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={openFilePicker}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" /> Selecionar Arquivos
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                          multiple
                        />
                        {/* Lista de arquivos */}
                        <div className="flex flex-col gap-1 mt-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-secondary/50 px-3 py-1 rounded text-sm">
                              <span className="truncate" title={file.name}>
                                {file.name.length > 20 
                                  ? file.name.substring(0, 17) + '...' 
                                  : file.name
                                }
                              </span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FormControl>
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
                    <Textarea 
                      placeholder="Descreva a tarefa em detalhes" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="recorrente"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel>Tarefa Recorrente</FormLabel>
                    <FormDescription>
                      Marque esta opção se a tarefa se repete regularmente
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    <span>Salvando...</span>
                  </div>
                ) : (
                  "Salvar Tarefa"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}