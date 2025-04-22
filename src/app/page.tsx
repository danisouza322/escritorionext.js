import { Button } from "@/components/ui/button";
import { Calculator, BarChart3, Users, FileText, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Se já estiver autenticado, redireciona para o dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Cabeçalho da Página Inicial */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">ContabilidadePRO</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#recursos" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Recursos
            </Link>
            <Link href="#planos" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Planos
            </Link>
            <Link href="#contato" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Contato
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth">
              <Button>Acessar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container flex flex-col items-center text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            Sistema de Gestão<br />para Escritórios de Contabilidade
          </h1>
          <p className="text-xl text-muted-foreground max-w-[800px]">
            Simplifique sua rotina contábil, organize documentos, automatize tarefas
            e gerencie seus clientes em uma única plataforma completa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth?tab=cadastro">
              <Button size="lg" className="gap-2">
                Comece Agora <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" size="lg">
                Acessar Conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="py-16 bg-muted">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Recursos Principais</h2>
            <p className="text-muted-foreground max-w-[600px] mx-auto">
              Uma solução completa para otimizar a gestão do seu escritório de contabilidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Gestão de Clientes</h3>
              <p className="text-muted-foreground">
                Cadastre e gerencie seus clientes com dados completos e organizados
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm">
              <FileText className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Documentos Digitais</h3>
              <p className="text-muted-foreground">
                Organize, armazene e compartilhe arquivos com segurança
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm">
              <Calendar className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Agenda e Tarefas</h3>
              <p className="text-muted-foreground">
                Controle prazos, obrigações fiscais e tarefas da equipe
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm">
              <BarChart3 className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Relatórios</h3>
              <p className="text-muted-foreground">
                Visualize métricas essenciais para o crescimento do seu escritório
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-4">Pronto para transformar seu escritório?</h2>
            <p className="mb-8 max-w-[600px]">
              Experimente o ContabilidadePRO e descubra como podemos ajudar a
              otimizar seus processos e aumentar sua eficiência.
            </p>
            <Link href="/auth?tab=cadastro">
              <Button size="lg" variant="secondary">
                Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calculator className="h-5 w-5 text-primary" />
                <span className="font-bold">ContabilidadePRO</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-[350px]">
                Solução completa para escritórios de contabilidade, com foco em produtividade e organização.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Produto</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#recursos" className="text-sm text-muted-foreground hover:text-foreground">
                      Recursos
                    </Link>
                  </li>
                  <li>
                    <Link href="#planos" className="text-sm text-muted-foreground hover:text-foreground">
                      Planos
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      Segurança
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Suporte</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      Ajuda
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      Contato
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      Termos
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      Privacidade
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ContabilidadePRO. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
