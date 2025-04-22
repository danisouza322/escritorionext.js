import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";
import LoadingProgress from "@/components/loading-progress";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ContabilidadePRO - Sistema para Escritórios de Contabilidade",
  description: "Solução completa para gestão de escritórios de contabilidade, com recursos de gestão de clientes, documentos, tarefas e colaboradores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <LoadingProgress />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
