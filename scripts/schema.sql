
-- Enums (com verificação de existência)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_usuario') THEN
    CREATE TYPE tipo_usuario AS ENUM ('admin', 'contador', 'assistente');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_cliente') THEN
    CREATE TYPE tipo_cliente AS ENUM ('pessoa_fisica', 'pessoa_juridica');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_tarefa') THEN
    CREATE TYPE tipo_tarefa AS ENUM ('fiscal', 'contabil', 'departamento_pessoal', 'administrativa', 'outro');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_tarefa') THEN
    CREATE TYPE status_tarefa AS ENUM ('pendente', 'em_andamento', 'concluida', 'atrasada', 'cancelada');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_documento') THEN
    CREATE TYPE tipo_documento AS ENUM ('fiscal', 'contabil', 'departamento_pessoal', 'juridico', 'outro');
  END IF;
END $$;

-- Contabilidade (Escritório de contabilidade)
CREATE TABLE IF NOT EXISTS contabilidades (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  logo TEXT,
  plano VARCHAR(50) DEFAULT 'basic',
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  contabilidade_id INTEGER NOT NULL REFERENCES contabilidades(id),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  tipo tipo_usuario DEFAULT 'assistente',
  ativo BOOLEAN DEFAULT TRUE,
  foto_perfil TEXT,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  contabilidade_id INTEGER NOT NULL REFERENCES contabilidades(id),
  tipo tipo_cliente NOT NULL,
  nome VARCHAR(255) NOT NULL,
  documento VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Documentos
CREATE TABLE IF NOT EXISTS documentos (
  id SERIAL PRIMARY KEY,
  contabilidade_id INTEGER NOT NULL REFERENCES contabilidades(id),
  cliente_id INTEGER REFERENCES clientes(id),
  nome VARCHAR(255) NOT NULL,
  tipo tipo_documento NOT NULL,
  descricao TEXT,
  caminho TEXT NOT NULL,
  tamanho INTEGER,
  periodo VARCHAR(7),
  link_compartilhamento UUID DEFAULT gen_random_uuid(),
  usuario_upload_id INTEGER REFERENCES usuarios(id),
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tarefas
CREATE TABLE IF NOT EXISTS tarefas (
  id SERIAL PRIMARY KEY,
  contabilidade_id INTEGER NOT NULL REFERENCES contabilidades(id),
  cliente_id INTEGER REFERENCES clientes(id),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo tipo_tarefa NOT NULL,
  status status_tarefa DEFAULT 'pendente',
  responsavel_id INTEGER REFERENCES usuarios(id),
  data_vencimento TIMESTAMP,
  data_conclusao TIMESTAMP,
  prioridade INTEGER DEFAULT 0,
  recorrente BOOLEAN DEFAULT FALSE,
  detalhes_recorrencia JSONB,
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);
