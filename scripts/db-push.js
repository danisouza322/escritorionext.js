const { Pool } = require('pg');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente
dotenv.config();

// Verifica se a variável DATABASE_URL está definida
if (!process.env.DATABASE_URL) {
  console.error('A variável de ambiente DATABASE_URL não está definida.');
  process.exit(1);
}

// Função para criar um tipo ENUM verificando se já existe
async function createEnumIfNotExists(pool, typeName, values) {
  try {
    // Verifica se o tipo já existe
    const checkResult = await pool.query(`
      SELECT 1 FROM pg_type WHERE typname = $1;
    `, [typeName]);
    
    if (checkResult.rows.length === 0) {
      console.log(`Criando tipo ENUM ${typeName}...`);
      const valueString = values.map(v => `'${v}'`).join(', ');
      await pool.query(`CREATE TYPE ${typeName} AS ENUM (${valueString});`);
      console.log(`Tipo ${typeName} criado com sucesso!`);
    } else {
      console.log(`Tipo ${typeName} já existe.`);
    }
  } catch (error) {
    console.error(`Erro ao criar o tipo ${typeName}:`, error.message);
  }
}

// Função para criar uma tabela se não existir
async function createTableIfNotExists(pool, tableName, tableDefinition) {
  try {
    console.log(`Criando tabela ${tableName}...`);
    await pool.query(`CREATE TABLE IF NOT EXISTS ${tableName} (${tableDefinition});`);
    console.log(`Tabela ${tableName} criada com sucesso!`);
  } catch (error) {
    console.error(`Erro ao criar a tabela ${tableName}:`, error.message);
  }
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('Iniciando migração do banco de dados...');
    
    // Cria os tipos ENUM
    await createEnumIfNotExists(pool, 'tipo_usuario', ['admin', 'contador', 'assistente']);
    await createEnumIfNotExists(pool, 'tipo_cliente', ['pessoa_fisica', 'pessoa_juridica']);
    await createEnumIfNotExists(pool, 'tipo_tarefa', ['fiscal', 'contabil', 'departamento_pessoal', 'administrativa', 'outro']);
    await createEnumIfNotExists(pool, 'status_tarefa', ['pendente', 'em_andamento', 'concluida', 'atrasada', 'cancelada']);
    await createEnumIfNotExists(pool, 'tipo_documento', ['fiscal', 'contabil', 'departamento_pessoal', 'juridico', 'outro']);
    
    // Cria as tabelas
    await createTableIfNotExists(pool, 'contabilidades', `
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
    `);
    
    await createTableIfNotExists(pool, 'usuarios', `
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
    `);
    
    await createTableIfNotExists(pool, 'clientes', `
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
    `);
    
    await createTableIfNotExists(pool, 'documentos', `
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
    `);
    
    await createTableIfNotExists(pool, 'tarefas', `
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
    `);
    
    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error.message);
  } finally {
    await pool.end();
  }
}

main();