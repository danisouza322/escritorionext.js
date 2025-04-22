import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { usuarios } from "../db/schema";
import { compare } from "bcrypt";

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

        const user = await db.query.usuarios.findFirst({
          where: eq(usuarios.email, credentials.email),
          with: {
            contabilidade: true,
          },
        });

        if (!user || !user.ativo) {
          return null;
        }

        const senhaCorreta = await compare(credentials.password, user.senha);

        if (!senhaCorreta) {
          return null;
        }

        return {
          id: user.id.toString(),
          name: user.nome,
          email: user.email,
          image: user.fotoPerfil,
          contabilidadeId: user.contabilidadeId,
          tipo: user.tipo,
          contabilidade: user.contabilidade,
        };
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
