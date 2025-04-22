"use client";

import { useEffect } from "react";
import { getSession } from "next-auth/react";
import AuthForm from "@/components/auth-form";
import Logo from "@/components/logo";
import ThemeSwitcher from "@/components/theme-switcher";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (session) {
        router.push("/dashboard");
      }
    }
    
    checkSession();
  }, [router]);

  return (
    <div className="flex min-h-screen">
      {/* Formulário de Autenticação */}
      <div className="flex-1 flex flex-col p-8">
        <div className="flex justify-between items-center mb-10">
          <Logo />
          <ThemeSwitcher />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <AuthForm />
          </div>
        </div>
        
        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ContabilidadePRO. Todos os direitos reservados.
          </p>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="hidden lg:flex flex-1 bg-primary">
        <div className="flex flex-col justify-center p-12 text-primary-foreground">
          <h1 className="text-4xl font-bold mb-6">
            Sistema Completo para Escritórios de Contabilidade
          </h1>
          <p className="mb-8 text-xl">
            Gerencie clientes, documentos, tarefas e muito mais em uma única plataforma.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary-foreground/20 p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Gestão de Clientes</h3>
                <p>Cadastro completo com histórico de serviços e documentos</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary-foreground/20 p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Documentos Organizados</h3>
                <p>Upload, versionamento e compartilhamento seguro</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary-foreground/20 p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                  <path d="m9 16 2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Calendário e Tarefas</h3>
                <p>Acompanhamento de obrigações fiscais e gerenciamento de equipe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
