# Sistema de Gestão para Escritório de Contabilidade

Aplicação SaaS empresarial para escritórios de contabilidade, focada em automação e integração de processos contábeis com tecnologias modernas e fluxo de trabalho otimizado.

## Principais Recursos

- **Gestão de Clientes**: Cadastro, consulta, edição e remoção de clientes com integração da API CNPJA para preenchimento automático
- **Gestão de Documentos**: Upload, compartilhamento e organização de documentos por cliente
- **Gestão de Tarefas**: Acompanhamento de tarefas com priorização e atribuição a múltiplos colaboradores
- **Dashboard**: Visualização consolidada de estatísticas e atividades recentes
- **Colaboradores**: Gerenciamento de usuários da contabilidade com diferentes níveis de acesso

## Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TailwindCSS, shadcn/ui, React Hook Form, Zod
- **Backend**: API Routes no Next.js, NextAuth.js para autenticação
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **Integrações**: API CNPJA para consulta de dados empresariais

## Documentação

Toda a documentação está disponível na pasta `docs/`:

- **[README.md](docs/README.md)**: Visão geral do projeto e referências a outros documentos
- **[DOCUMENTACAO-TECNICA.md](docs/DOCUMENTACAO-TECNICA.md)**: Detalhes sobre a implementação, arquitetura e padrões de código
- **[GUIA-CLIENTES.md](docs/GUIA-CLIENTES.md)**: Documentação específica do módulo de clientes
- **[TAREFAS.md](docs/TAREFAS.md)**: Documentação completa do módulo de tarefas
- **[DESENVOLVEDORES.md](docs/DESENVOLVEDORES.md)**: Guia técnico para desenvolvedores
- **[MANUAL_USUARIO_TAREFAS.md](docs/MANUAL_USUARIO_TAREFAS.md)**: Manual de uso para usuários finais
- **[ALTERACOES-RECENTES.md](docs/ALTERACOES-RECENTES.md)**: Histórico de atualizações e melhorias
- **[CODIGOS-IMPLEMENTADOS.md](docs/CODIGOS-IMPLEMENTADOS.md)**: Exemplos de código importantes
- **[CORRECOES_RESPONSAVEIS.md](docs/CORRECOES_RESPONSAVEIS.md)**: Detalhes sobre correções no sistema de responsáveis

## Instalação e Configuração

```bash
# Instalar dependências
npm install

# Variáveis de ambiente necessárias
# Crie um arquivo .env com:
NEXTAUTH_SECRET=sua_chave_secreta_aqui
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=sua_url_do_postgres
CNPJA_API_KEY=sua_chave_api_cnpja

# Iniciar o servidor de desenvolvimento
npm run dev
```

## Desenvolvimento

O projeto segue uma estrutura de diretórios organizada:

- `/src/app`: Rotas e estrutura principal do Next.js
- `/src/components`: Componentes React reutilizáveis
- `/src/db`: Esquema do banco de dados
- `/src/lib`: Utilitários e configurações
- `/src/hooks`: Hooks personalizados
- `/src/types`: Definições de tipos TypeScript
- `/docs`: Documentação completa do projeto