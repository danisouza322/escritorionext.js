import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { usuarios, contabilidades } from "../db/schema";
import { compare } from "bcrypt";
import { sql } from "drizzle-orm";

// Extendendo os tipos do NextAuth
declare module "next-auth" {
  interface User {
    id: string;
    contabilidadeId: number;
    tipo: string;
    contabilidade?: any;
  }
  
  interface Session {
    user: {
      id: string;
      contabilidadeId: number;
      tipo: string;
      contabilidade?: any;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    contabilidadeId: number;
    tipo: string;
    contabilidade?: any;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
    signOut: "/auth",
    error: "/auth",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Buscar usuário pelo email
          const userResult = await db
            .select()
            .from(usuarios)
            .where(eq(usuarios.email, credentials.email));

          if (!userResult.length || !userResult[0].ativo) {
            console.log("Usuário não encontrado ou inativo");
            return null;
          }

          const user = userResult[0];

          // Verificar senha
          const senhaCorreta = await compare(credentials.password, user.senha);

          if (!senhaCorreta) {
            console.log("Senha incorreta");
            return null;
          }

          // Buscar contabilidade do usuário
          const contabilidadeQuery = await db
            .select()
            .from(usuarios.contabilidade)
            .where(eq(usuarios.contabilidade.id, user.contabilidadeId));

          const contabilidade = contabilidadeQuery.length ? contabilidadeQuery[0] : null;

          return {
            id: user.id.toString(),
            name: user.nome,
            email: user.email,
            image: user.fotoPerfil,
            contabilidadeId: user.contabilidadeId,
            tipo: user.tipo,
            contabilidade: contabilidade,
          };
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          contabilidadeId: user.contabilidadeId,
          tipo: user.tipo,
          contabilidade: user.contabilidade,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          contabilidadeId: token.contabilidadeId,
          tipo: token.tipo,
          contabilidade: token.contabilidade,
        },
      };
    },
  },
};
