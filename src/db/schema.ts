import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  uuid,
  json,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const tipoUsuarioEnum = pgEnum("tipo_usuario", [
  "admin",
  "contador",
  "assistente",
]);

export const tipoClienteEnum = pgEnum("tipo_cliente", [
  "pessoa_fisica",
  "pessoa_juridica",
]);

export const tipoTarefaEnum = pgEnum("tipo_tarefa", [
  "fiscal",
  "contabil",
  "departamento_pessoal",
  "administrativa",
  "outro",
]);

export const statusTarefaEnum = pgEnum("status_tarefa", [
  "pendente",
  "em_andamento",
  "concluida",
  "atrasada",
  "cancelada",
]);

export const tipoDocumentoEnum = pgEnum("tipo_documento", [
  "fiscal",
  "contabil",
  "departamento_pessoal",
  "juridico",
  "outro",
]);

// Contabilidade (Escritório de contabilidade)
export const contabilidades = pgTable("contabilidades", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  telefone: varchar("telefone", { length: 20 }),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 10 }),
  logo: text("logo"),
  plano: varchar("plano", { length: 50 }).default("basic"),
  ativo: boolean("ativo").default(true),
  dataCriacao: timestamp("data_criacao").defaultNow(),
  dataAtualizacao: timestamp("data_atualizacao").defaultNow(),
});

// Relações da Contabilidade
export const contabilidadesRelations = relations(contabilidades, ({ many }) => ({
  usuarios: many(usuarios),
  clientes: many(clientes),
}));

// Usuários
export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  contabilidadeId: integer("contabilidade_id").notNull().references(() => contabilidades.id),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  senha: text("senha").notNull(),
  tipo: tipoUsuarioEnum("tipo").default("assistente"),
  ativo: boolean("ativo").default(true),
  fotoPerfil: text("foto_perfil"),
  dataCriacao: timestamp("data_criacao").defaultNow(),
  dataAtualizacao: timestamp("data_atualizacao").defaultNow(),
});

// Relações dos Usuários
export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  contabilidade: one(contabilidades, {
    fields: [usuarios.contabilidadeId],
    references: [contabilidades.id],
  }),
  tarefas: many(tarefas),
}));

// Clientes
export const clientes = pgTable("clientes", {
  id: serial("id").primaryKey(),
  contabilidadeId: integer("contabilidade_id").notNull().references(() => contabilidades.id),
  tipo: tipoClienteEnum("tipo").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  documento: varchar("documento", { length: 20 }).notNull(), // CPF ou CNPJ
  email: varchar("email", { length: 255 }),
  telefone: varchar("telefone", { length: 20 }),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 10 }),
  // Novos campos para pessoa jurídica
  data_abertura: varchar("data_abertura", { length: 20 }),
  natureza_juridica: varchar("natureza_juridica", { length: 255 }),
  atividade_principal: text("atividade_principal"),
  simples_nacional: varchar("simples_nacional", { length: 3 }).default("nao"),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").default(true),
  dataCriacao: timestamp("data_criacao").defaultNow(),
  dataAtualizacao: timestamp("data_atualizacao").defaultNow(),
});

// Relações dos Clientes
export const clientesRelations = relations(clientes, ({ one, many }) => ({
  contabilidade: one(contabilidades, {
    fields: [clientes.contabilidadeId],
    references: [contabilidades.id],
  }),
  documentos: many(documentos),
  tarefas: many(tarefas),
}));

// Documentos
export const documentos = pgTable("documentos", {
  id: serial("id").primaryKey(),
  contabilidadeId: integer("contabilidade_id").notNull().references(() => contabilidades.id),
  clienteId: integer("cliente_id").references(() => clientes.id),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: tipoDocumentoEnum("tipo").notNull(),
  descricao: text("descricao"),
  caminho: text("caminho").notNull(),
  tamanho: integer("tamanho"),
  periodo: varchar("periodo", { length: 7 }), // formato: YYYY-MM
  linkCompartilhamento: uuid("link_compartilhamento").defaultRandom(),
  usuarioUploadId: integer("usuario_upload_id").references(() => usuarios.id),
  ativo: boolean("ativo").default(true),
  dataCriacao: timestamp("data_criacao").defaultNow(),
  dataAtualizacao: timestamp("data_atualizacao").defaultNow(),
});

// Relações dos Documentos
export const documentosRelations = relations(documentos, ({ one }) => ({
  contabilidade: one(contabilidades, {
    fields: [documentos.contabilidadeId],
    references: [contabilidades.id],
  }),
  cliente: one(clientes, {
    fields: [documentos.clienteId],
    references: [clientes.id],
  }),
  usuarioUpload: one(usuarios, {
    fields: [documentos.usuarioUploadId],
    references: [usuarios.id],
  }),
}));

// Tarefas
export const tarefas = pgTable("tarefas", {
  id: serial("id").primaryKey(),
  contabilidadeId: integer("contabilidade_id").notNull().references(() => contabilidades.id),
  clienteId: integer("cliente_id").references(() => clientes.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: tipoTarefaEnum("tipo").notNull(),
  status: statusTarefaEnum("status").default("pendente"),
  responsavelId: integer("responsavel_id").references(() => usuarios.id),
  dataVencimento: timestamp("data_vencimento"),
  dataConclusao: timestamp("data_conclusao"),
  prioridade: integer("prioridade").default(0),
  recorrente: boolean("recorrente").default(false),
  detalhesRecorrencia: json("detalhes_recorrencia"),
  ativo: boolean("ativo").default(true),
  dataCriacao: timestamp("data_criacao").defaultNow(),
  dataAtualizacao: timestamp("data_atualizacao").defaultNow(),
});

// Observações de Tarefas
export const observacoesTarefas = pgTable("observacoes_tarefas", {
  id: serial("id").primaryKey(),
  tarefaId: integer("tarefa_id").notNull().references(() => tarefas.id),
  usuarioId: integer("usuario_id").notNull().references(() => usuarios.id),
  texto: text("texto").notNull(),
  ativo: boolean("ativo").default(true),
  dataCriacao: timestamp("data_criacao").defaultNow(),
  dataAtualizacao: timestamp("data_atualizacao").defaultNow(),
});

// Arquivos de Tarefas
export const arquivosTarefas = pgTable("arquivos_tarefas", {
  id: serial("id").primaryKey(),
  tarefaId: integer("tarefa_id").notNull().references(() => tarefas.id),
  usuarioId: integer("usuario_id").notNull().references(() => usuarios.id),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 100 }),
  tamanho: integer("tamanho"),
  caminho: text("caminho").notNull(),
  ativo: boolean("ativo").default(true),
  dataCriacao: timestamp("data_criacao").defaultNow(),
  dataAtualizacao: timestamp("data_atualizacao").defaultNow(),
});

// Relações das Tarefas
export const tarefasRelations = relations(tarefas, ({ one, many }) => ({
  contabilidade: one(contabilidades, {
    fields: [tarefas.contabilidadeId],
    references: [contabilidades.id],
  }),
  cliente: one(clientes, {
    fields: [tarefas.clienteId],
    references: [clientes.id],
  }),
  responsavel: one(usuarios, {
    fields: [tarefas.responsavelId],
    references: [usuarios.id],
  }),
  observacoes: many(observacoesTarefas),
  arquivos: many(arquivosTarefas),
}));

// Relações das Observações de Tarefas
export const observacoesTarefasRelations = relations(observacoesTarefas, ({ one }) => ({
  tarefa: one(tarefas, {
    fields: [observacoesTarefas.tarefaId],
    references: [tarefas.id],
  }),
  usuario: one(usuarios, {
    fields: [observacoesTarefas.usuarioId],
    references: [usuarios.id],
  }),
}));

// Relações dos Arquivos de Tarefas
export const arquivosTarefasRelations = relations(arquivosTarefas, ({ one }) => ({
  tarefa: one(tarefas, {
    fields: [arquivosTarefas.tarefaId],
    references: [tarefas.id],
  }),
  usuario: one(usuarios, {
    fields: [arquivosTarefas.usuarioId],
    references: [usuarios.id],
  }),
}));
