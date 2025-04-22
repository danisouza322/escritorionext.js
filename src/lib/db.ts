import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../db/schema";

// Verificação das variáveis de ambiente
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está definida");
}

// Conexão com o banco de dados usando driver PostgreSQL padrão
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
});

// Teste de conexão para garantir que o banco está acessível
pool.on('error', (err) => {
  console.error('Erro inesperado na conexão com o PostgreSQL:', err);
});

// Exportando a instância do Drizzle com o pool configurado
export const db = drizzle(pool, { schema });
