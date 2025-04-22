import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../db/schema";

// Configurar o WebSocket para o Neon Database
neonConfig.webSocketConstructor = ws;

// Verificação das variáveis de ambiente
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está definida");
}

// Conexão com o banco de dados
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
