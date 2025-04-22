import { tipoUsuarioEnum, tipoClienteEnum, tipoTarefaEnum, statusTarefaEnum, tipoDocumentoEnum } from "@/db/schema";

export type Usuario = {
  id: number;
  contabilidadeId: number;
  nome: string;
  email: string;
  senha?: string;
  tipo: (typeof tipoUsuarioEnum.enumValues)[number];
  ativo: boolean;
  fotoPerfil?: string | null;
  dataCriacao: Date;
  dataAtualizacao: Date;
  contabilidade?: Contabilidade;
};

export type Contabilidade = {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  logo?: string | null;
  plano: string;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
  usuarios?: Usuario[];
  clientes?: Cliente[];
};

export type Cliente = {
  id: number;
  contabilidadeId: number;
  tipo: (typeof tipoClienteEnum.enumValues)[number];
  nome: string;
  documento: string;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  // Novos campos para pessoa jurídica
  data_abertura?: string | null;
  natureza_juridica?: string | null;
  atividade_principal?: string | null;
  simples_nacional?: string | null;
  observacoes?: string | null;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
  contabilidade?: Contabilidade;
  documentos?: Documento[];
  tarefas?: Tarefa[];
};

export type Documento = {
  id: number;
  contabilidadeId: number;
  clienteId?: number | null;
  nome: string;
  tipo: (typeof tipoDocumentoEnum.enumValues)[number];
  descricao?: string | null;
  caminho: string;
  tamanho?: number | null;
  periodo?: string | null;
  linkCompartilhamento?: string | null;
  usuarioUploadId?: number | null;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
  contabilidade?: Contabilidade;
  cliente?: Cliente | null;
  usuarioUpload?: Usuario | null;
};

export type Tarefa = {
  id: number;
  contabilidadeId: number;
  clienteId?: number | null;
  titulo: string;
  descricao?: string | null;
  tipo: (typeof tipoTarefaEnum.enumValues)[number];
  status: (typeof statusTarefaEnum.enumValues)[number];
  responsavelId?: number | null;
  criadorId?: number | null;
  dataVencimento?: Date | null;
  dataConclusao?: Date | null;
  prioridade: number;
  recorrente: boolean;
  detalhesRecorrencia?: any;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
  contabilidade?: Contabilidade;
  cliente?: Cliente | null;
  responsavel?: Usuario | null;
  criador?: Usuario | null;
  observacoes?: ObservacaoTarefa[];
  arquivos?: ArquivoTarefa[];
};

export type ObservacaoTarefa = {
  id: number;
  tarefaId: number;
  usuarioId: number;
  texto: string;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
  usuario?: Usuario;
};

export type ArquivoTarefa = {
  id: number;
  tarefaId: number;
  usuarioId: number;
  nome: string;
  tipo?: string | null;
  tamanho?: number | null;
  caminho: string;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
  usuario?: Usuario;
};

export type Session = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    contabilidadeId: number;
    tipo: (typeof tipoUsuarioEnum.enumValues)[number];
    contabilidade?: Contabilidade;
  };
  expires: string;
};
