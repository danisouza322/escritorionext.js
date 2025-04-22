"use client";

import { Tarefa, Usuario, ObservacaoTarefa, ArquivoTarefa } from "@/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  formataData, 
  getStatusTarefaLabel, 
  getTipoTarefaLabel 
} from "@/lib/utils";
import { 
  CalendarIcon, 
  Clock, 
  FileUp, 
  MessageSquare, 
  Users, 
  ArrowLeft,
  UploadCloud,
  Paperclip,
  CheckCircle,
  XCircle,
  Send,
  File as FileIcon,
  Download
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TarefaDetalhesProps {
  tarefa: Tarefa;
  colaboradores: Usuario[];
}

export default function TarefaDetalhes({ tarefa, colaboradores }: TarefaDetalhesProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [observacao, setObservacao] = useState("");
  const [enviandoObservacao, setEnviandoObservacao] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);
  const [novoStatus, setNovoStatus] = useState(tarefa.status);
  const [novoResponsavel, setNovoResponsavel] = useState(tarefa.responsavelId?.toString() || "");
  const [atualizandoTarefa, setAtualizandoTarefa] = useState(false);
  const [observacoes, setObservacoes] = useState<ObservacaoTarefa[]>([]);
  const [arquivos, setArquivos] = useState<ArquivoTarefa[]>([]);
  const [carregandoObservacoes, setCarregandoObservacoes] = useState(false);
  const [carregandoArquivos, setCarregandoArquivos] = useState(false);

  // Buscar observações e arquivos ao carregar o componente
  useEffect(() => {
    buscarObservacoes();
    buscarArquivos();
  }, [tarefa.id]);

  // Função para buscar observações
  const buscarObservacoes = async () => {
    try {
      setCarregandoObservacoes(true);
      const response = await fetch(`/api/tarefas/${tarefa.id}/observacoes`);
      
      if (!response.ok) {
        throw new Error("Erro ao buscar observações");
      }
      
      const data = await response.json();
      setObservacoes(data);
    } catch (error) {
      console.error("Erro ao buscar observações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as observações",
        variant: "destructive",
      });
    } finally {
      setCarregandoObservacoes(false);
    }
  };

  // Função para buscar arquivos
  const buscarArquivos = async () => {
    try {
      setCarregandoArquivos(true);
      const response = await fetch(`/api/tarefas/${tarefa.id}/arquivos`);
      
      if (!response.ok) {
        throw new Error("Erro ao buscar arquivos");
      }
      
      const data = await response.json();
      setArquivos(data);
    } catch (error) {
      console.error("Erro ao buscar arquivos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os arquivos",
        variant: "destructive",
      });
    } finally {
      setCarregandoArquivos(false);
    }
  };

  // Função para lidar com a mudança de status
  const handleStatusChange = async (novoStatus: string) => {
    try {
      setAtualizandoTarefa(true);
      const response = await fetch(`/api/tarefas/${tarefa.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar tarefa");
      }

      toast({
        title: "Status atualizado",
        description: `Tarefa marcada como ${getStatusTarefaLabel(novoStatus as any)}`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa",
        variant: "destructive",
      });
    } finally {
      setAtualizandoTarefa(false);
    }
  };

  // Função para lidar com a mudança de responsável
  const handleResponsavelChange = async (responsavelId: string) => {
    try {
      setAtualizandoTarefa(true);
      const response = await fetch(`/api/tarefas/${tarefa.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          responsavelId: responsavelId === "0" ? null : responsavelId 
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar responsável");
      }

      toast({
        title: "Responsável atualizado",
        description: "O responsável pela tarefa foi atualizado com sucesso",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o responsável",
        variant: "destructive",
      });
    } finally {
      setAtualizandoTarefa(false);
    }
  };

  // Função para enviar uma observação
  const enviarObservacao = async () => {
    if (!observacao.trim()) {
      toast({
        title: "Observação vazia",
        description: "Por favor, adicione uma observação antes de enviar",
        variant: "destructive",
      });
      return;
    }

    try {
      setEnviandoObservacao(true);
      const response = await fetch(`/api/tarefas/${tarefa.id}/observacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ texto: observacao }),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar observação");
      }

      const novaObservacao = await response.json();
      
      // Adicionar a nova observação ao estado
      setObservacoes([novaObservacao, ...observacoes]);
      
      toast({
        title: "Observação enviada",
        description: "Sua observação foi adicionada à tarefa",
      });
      
      setObservacao("");
    } catch (error) {
      console.error("Erro ao enviar observação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a observação",
        variant: "destructive",
      });
    } finally {
      setEnviandoObservacao(false);
    }
  };

  // Função para enviar um arquivo
  const enviarArquivo = async () => {
    if (!arquivoSelecionado) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo antes de enviar",
        variant: "destructive",
      });
      return;
    }

    try {
      setEnviandoArquivo(true);
      
      const formData = new FormData();
      formData.append("arquivo", arquivoSelecionado);
      
      const response = await fetch(`/api/tarefas/${tarefa.id}/arquivos`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar arquivo");
      }

      const novoArquivo = await response.json();
      
      // Adicionar o novo arquivo ao estado
      setArquivos([novoArquivo, ...arquivos]);
      
      toast({
        title: "Arquivo enviado",
        description: "Seu arquivo foi adicionado à tarefa",
      });
      
      setArquivoSelecionado(null);
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o arquivo",
        variant: "destructive",
      });
    } finally {
      setEnviandoArquivo(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2"
          onClick={() => router.push("/dashboard/tarefas")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para tarefas
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Coluna 1: Detalhes da Tarefa */}
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{tarefa.titulo}</CardTitle>
                <CardDescription>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge>
                      {getTipoTarefaLabel(tarefa.tipo)}
                    </Badge>
                    <Badge 
                      variant={
                        tarefa.status === "concluida" 
                          ? "default" 
                          : tarefa.status === "atrasada" 
                          ? "destructive" 
                          : "outline"
                      }
                    >
                      {getStatusTarefaLabel(tarefa.status)}
                    </Badge>
                  </div>
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                {tarefa.status === "pendente" && (
                  <Button 
                    size="sm"
                    onClick={() => handleStatusChange("em_andamento")}
                    disabled={atualizandoTarefa}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Iniciar
                  </Button>
                )}
                
                {tarefa.status === "em_andamento" && (
                  <Button 
                    size="sm"
                    onClick={() => handleStatusChange("concluida")}
                    disabled={atualizandoTarefa}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Concluir
                  </Button>
                )}
                
                {tarefa.status !== "cancelada" && tarefa.status !== "concluida" && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleStatusChange("cancelada")}
                    disabled={atualizandoTarefa}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Cliente</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {tarefa.cliente ? tarefa.cliente.nome : "Não especificado"}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Responsável</h3>
                <Select 
                  value={novoResponsavel} 
                  onValueChange={(value) => {
                    setNovoResponsavel(value);
                    handleResponsavelChange(value);
                  }}
                  disabled={atualizandoTarefa}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Não atribuído</SelectItem>
                    {colaboradores.map((colaborador) => (
                      <SelectItem key={colaborador.id} value={colaborador.id.toString()}>
                        {colaborador.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Vencimento</h3>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {tarefa.dataVencimento ? formataData(tarefa.dataVencimento) : "Não especificada"}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Conclusão</h3>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  {tarefa.dataConclusao ? formataData(tarefa.dataConclusao) : "Não concluída"}
                </div>
              </div>
            </div>
            
            {tarefa.descricao && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h3>
                <span className="text-sm whitespace-pre-wrap block">{tarefa.descricao}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coluna 2: Dados de Criação e Prioridade */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Prioridade</h3>
              <Badge 
                variant={
                  tarefa.prioridade === 3 
                    ? "destructive" 
                    : tarefa.prioridade === 2 
                    ? "outline" 
                    : "default"
                }
              >
                {tarefa.prioridade === 3 
                  ? "Alta" 
                  : tarefa.prioridade === 2 
                  ? "Média" 
                  : "Baixa"
                }
              </Badge>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Criação</h3>
              <span className="text-sm block">{formataData(tarefa.dataCriacao)}</span>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Última Atualização</h3>
              <span className="text-sm block">{formataData(tarefa.dataAtualizacao)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Observações e Arquivos */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atividades</CardTitle>
            <CardDescription>
              Adicione observações ou arquivos relacionados a esta tarefa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="observacoes">
              <TabsList className="mb-4">
                <TabsTrigger value="observacoes" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Observações
                </TabsTrigger>
                <TabsTrigger value="arquivos" className="flex items-center gap-2">
                  <FileUp className="h-4 w-4" />
                  Arquivos
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="observacoes" className="space-y-4">
                {/* Formulário para adicionar observação */}
                <div className="space-y-2">
                  <div className="grid w-full gap-2">
                    <Label htmlFor="observacao">Nova observação</Label>
                    <Textarea 
                      id="observacao" 
                      placeholder="Adicione uma observação sobre o andamento da tarefa..." 
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button 
                    className="w-full flex items-center justify-center" 
                    onClick={enviarObservacao}
                    disabled={enviandoObservacao || !observacao.trim()}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Observação
                  </Button>
                </div>
                
                {/* Lista de observações */}
                <div className="space-y-4">
                  {observacoes.length === 0 ? (
                    <div className="border rounded p-4 text-center text-muted-foreground">
                      Nenhuma observação adicionada ainda.
                    </div>
                  ) : (
                    observacoes.map((observacao) => (
                      <div key={observacao.id} className="border rounded p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarFallback>{observacao.usuario?.nome?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="block text-sm font-medium">{observacao.usuario?.nome || "Usuário"}</span>
                              <span className="block text-xs text-muted-foreground">
                                {formataData(observacao.dataCriacao)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{observacao.texto}</div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="arquivos" className="space-y-4">
                {/* Formulário para adicionar arquivo */}
                <div className="space-y-2">
                  <div className="grid w-full gap-2">
                    <Label htmlFor="arquivo">Novo arquivo</Label>
                    <div className="border rounded p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors">
                      <Input 
                        id="arquivo" 
                        type="file" 
                        className="hidden"
                        onChange={(e) => setArquivoSelecionado(e.target.files ? e.target.files[0] : null)}
                      />
                      <Label htmlFor="arquivo" className="cursor-pointer flex flex-col items-center gap-2">
                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Clique para selecionar um arquivo
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ou arraste e solte aqui
                        </span>
                      </Label>
                    </div>
                    {arquivoSelecionado && (
                      <div className="flex items-center gap-2 p-2 border rounded bg-accent/20">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate flex-1">{arquivoSelecionado.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setArquivoSelecionado(null)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button 
                    className="w-full flex items-center justify-center" 
                    onClick={enviarArquivo}
                    disabled={enviandoArquivo || !arquivoSelecionado}
                  >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Enviar Arquivo
                  </Button>
                </div>
                
                {/* Lista de arquivos */}
                <div className="space-y-4">
                  {arquivos.length === 0 ? (
                    <div className="border rounded p-4 text-center text-muted-foreground">
                      Nenhum arquivo adicionado ainda.
                    </div>
                  ) : (
                    arquivos.map((arquivo) => (
                      <div key={arquivo.id} className="border rounded p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-accent p-2 rounded">
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="block text-sm font-medium">{arquivo.nome}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{arquivo.usuario?.nome || "Usuário"}</span>
                              <span>•</span>
                              <span>{formataData(arquivo.dataCriacao)}</span>
                              {arquivo.tamanho && (
                                <>
                                  <span>•</span>
                                  <span>{(arquivo.tamanho / 1024).toFixed(1)} KB</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <a 
                          href={arquivo.caminho} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          Baixar
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}