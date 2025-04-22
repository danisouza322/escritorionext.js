const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/pg-pool');
const { eq } = require('drizzle-orm');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

// Carrega as variáveis de ambiente
dotenv.config();

// Verifica se a variável DATABASE_URL está definida
if (!process.env.DATABASE_URL) {
  console.error('A variável de ambiente DATABASE_URL não está definida.');
  process.exit(1);
}

async function main() {
  try {
    // Conexão com o banco de dados
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Importar manualmente as definições do schema
    // No ambiente Node.js comum temos problemas para importar módulos ES
    // então vamos definir as tabelas diretamente
    const { sql } = require('drizzle-orm');

    // Verificar se as tabelas existem
    const checkTablesResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'contabilidades'
      );
    `);

    if (!checkTablesResult.rows[0].exists) {
      console.error('As tabelas não foram criadas corretamente. Execute a migração primeiro.');
      process.exit(1);
    }

    // Usar SQL direto para as consultas
    const db = drizzle(pool);
    
    console.log('Verificando as tabelas existentes...');
    
    // Verificar contabilidades existentes usando SQL direto
    const contabilidadesResult = await pool.query('SELECT * FROM contabilidades');
    const contabilidades = contabilidadesResult.rows;
    
    if (contabilidades.length === 0) {
      console.log('Nenhuma contabilidade encontrada, inserindo a primeira...');
      
      // Inserir contabilidade base usando SQL
      const contabilidadeResult = await pool.query(`
        INSERT INTO contabilidades (nome, cnpj, email, telefone, plano, ativo, data_criacao, data_atualizacao)
        VALUES ('Contabilidade Exemplo', '12.345.678/0001-99', 'contato@contabilidade.com', '(11) 99999-9999', 'premium', true, NOW(), NOW())
        RETURNING *
      `);
      
      const contabilidade = contabilidadeResult.rows[0];
      console.log(`Contabilidade criada com ID: ${contabilidade.id}`);
      
      // Gerar senha criptografada
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash('123456', salt);
      
      // Inserir usuário administrador usando SQL
      const adminResult = await pool.query(`
        INSERT INTO usuarios (contabilidade_id, nome, email, senha, tipo, ativo, data_criacao, data_atualizacao)
        VALUES ($1, 'Administrador', 'admin@contabilidade.com', $2, 'admin', true, NOW(), NOW())
        RETURNING *
      `, [contabilidade.id, senhaHash]);
      
      const admin = adminResult.rows[0];
      console.log(`Usuário administrador criado com ID: ${admin.id}`);
    } else {
      console.log(`${contabilidades.length} contabilidades encontradas no banco de dados.`);
      
      // Verificar usuários existentes
      const usuariosResult = await pool.query('SELECT * FROM usuarios');
      console.log(`${usuariosResult.rows.length} usuários encontrados no banco de dados.`);
    }
    
    // Fechar conexão com o banco de dados
    await pool.end();
    
    console.log('Verificação concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a verificação do banco de dados:', error);
  }
}

main();