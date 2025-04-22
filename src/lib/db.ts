import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";

// Verificação das variáveis de ambiente
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está definida");
}

// Conexão com o banco de dados
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
