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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cliente } from "@/types";
import { FileUp } from "lucide-react";

// Esquema de validação do documento
const documentoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["fiscal", "contabil", "departamento_pessoal", "juridico", "outro"]),
  clienteId: z.string().optional(),
  descricao: z.string().optional(),
  periodo: z.string().optional(),
  arquivo: z.instanceof(File, { message: "Arquivo é obrigatório" }),
});

type DocumentoFormValues = z.infer<typeof documentoSchema>;

interface UploadDocumentoProps {
  children?: React.ReactNode;
  clienteId?: number; // Cliente pré-selecionado
}

export default function UploadDocumento({ children, clienteId }: UploadDocumentoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoadingClientes, setIsLoadingClientes] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Buscar lista de clientes para o select
  useEffect(() => {
    if (isOpen && !clienteId) {
      setIsLoadingClientes(true);
      fetch("/api/clientes")
        .then((res) => res.json())
        .then((data) => {
          setClientes(data);
        })
        .catch((error) => {
          console.error("Erro ao carregar clientes:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar a lista de clientes",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoadingClientes(false);
        });
    }
  }, [isOpen, clienteId, toast]);

  // Configurar formulário
  const form = useForm<DocumentoFormValues>({
    resolver: zodResolver(documentoSchema),
    defaultValues: {
      nome: "",
      tipo: "fiscal",
      clienteId: clienteId ? String(clienteId) : undefined,
      descricao: "",
      periodo: "",
    },
  });

  async function onSubmit(data: DocumentoFormValues) {
    setIsSubmitting(true);
    
    try {
      // Criar FormData para upload do arquivo
      const formData = new FormData();
      formData.append("arquivo", data.arquivo);
      formData.append("nome", data.nome);
      formData.append("tipo", data.tipo);
      
      if (data.clienteId) {
        formData.append("clienteId", data.clienteId);
      }
      
      if (data.descricao) {
        formData.append("descricao", data.descricao);
      }
      
      if (data.periodo) {
        formData.append("periodo", data.periodo);
      }
      
      // Enviar para a API
      const response = await fetch("/api/documentos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload do documento");
      }

      toast({
        title: "Documento enviado",
        description: "O documento foi enviado com sucesso",
      });

      // Fechar modal e atualizar dados
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o documento",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <FileUp className="h-4 w-4" />
            Novo Documento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload de Documento</DialogTitle>
          <DialogDescription>
            Selecione um arquivo e preencha as informações do documento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="arquivo"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Arquivo</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Selecione o arquivo que deseja enviar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Documento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nota Fiscal Jan/2023" {...field} />
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
                      <SelectItem value="juridico">Jurídico</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
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
                            <SelectItem value="">Nenhum cliente (geral)</SelectItem>
                            {clientes.map((cliente) => (
                              <SelectItem key={cliente.id} value={String(cliente.id)}>
                                {cliente.nome}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Associe o documento a um cliente específico (opcional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="periodo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período</FormLabel>
                  <FormControl>
                    <Input 
                      type="month" 
                      placeholder="MM/AAAA" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Mês/ano de referência do documento (opcional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Informações adicionais sobre o documento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
