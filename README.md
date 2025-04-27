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

# ContabilidadePRO - Atualização de Perfil e Avatar

## Funcionalidade: Edição de Perfil do Usuário

### Fluxo Implementado

- O usuário pode editar seu nome e foto de perfil na rota `/dashboard/perfil`.
- O upload da foto é feito via formulário, com preview imediato.
- Após salvar, a foto é persistida no banco (campo `fotoPerfil` na tabela `usuarios`).
- **A foto anterior é excluída automaticamente do servidor ao salvar uma nova, evitando acúmulo de arquivos órfãos.**
- O backend e a sessão do NextAuth propagam o campo `fotoPerfil` para o frontend.
- O avatar do header exibe a foto de perfil imediatamente após o upload, sem necessidade de logout ou reload manual.

### Arquitetura

- **Contexto Global de Usuário (`UserContext`)**: Garante atualização instantânea do avatar em toda a aplicação.
- **Atualização da Sessão**: O formulário chama `useSession().update()` e também atualiza o contexto global com a nova URL da foto.
- **Fallback**: Se o usuário não tiver foto, o avatar exibe a inicial do nome.

### Principais Arquivos

- `src/components/perfil/perfil-form.tsx`: Formulário de edição de perfil, upload de foto e atualização do contexto global.
- `src/components/user-dropdown.tsx`: Avatar do usuário, consumindo o contexto global.
- `src/context/UserContext.tsx`: Contexto global de usuário.
- `src/app/dashboard/layout.tsx`: Envolve o dashboard com o provider do contexto global.
- `src/lib/auth.ts`: Propagação do campo `fotoPerfil` na sessão do NextAuth.
- `src/app/api/usuario/perfil/route.ts`: Endpoint para atualização de nome e foto de perfil, com exclusão automática da foto anterior.

### Observações

- O campo `fotoPerfil` deve estar presente no banco e na sessão.
- O contexto global é atualizado após o upload, garantindo UX instantânea.
- O avatar nunca fica desatualizado após alteração de foto.
- O servidor mantém apenas a foto mais recente do usuário, evitando arquivos órfãos.

---

## Como funciona o fluxo de atualização do avatar?

1. O usuário faz upload de uma nova foto em `/dashboard/perfil`.
2. O backend salva a foto, exclui a anterior (se houver) e retorna a URL.
3. O formulário atualiza a sessão e o contexto global com a nova URL.
4. O avatar consome o contexto e exibe a nova foto imediatamente.
5. Se não houver foto, exibe a inicial do nome.

---

## Manutenção

- Para alterar o comportamento do avatar, edite `user-dropdown.tsx`.
- Para alterar o fluxo de atualização, edite `perfil-form.tsx` e `UserContext.tsx`.
- Para garantir que o campo `fotoPerfil` está sempre atualizado, mantenha a lógica de update no backend e na sessão.
- Para alterar o diretório de armazenamento ou lógica de exclusão, edite `api/usuario/perfil/route.ts`.

## Funcionalidade: Ícone de Anexo em Tarefas

- Na listagem de tarefas, um ícone de clipe (Paperclip) é exibido ao lado do título sempre que a tarefa possuir pelo menos um arquivo/anexo.
- O backend (API e SSR) retorna o campo `arquivos` para cada tarefa, garantindo que o frontend possa identificar e exibir o ícone corretamente.
- O ícone é discreto (15x15px), com tooltip "Possui anexo" para acessibilidade.
- Para alterar o comportamento ou visual do ícone, edite o componente `src/components/tarefa-optimized/tarefa-list.tsx`.
- O relacionamento entre tarefas e anexos está modelado no banco e refletido no Drizzle ORM.

---

## Manutenção

- Para garantir que o ícone de anexo funcione corretamente, sempre inclua `arquivos: true` nas consultas de tarefas que alimentam listagens.
- Para ajustes visuais, altere o tamanho, cor ou posição do ícone diretamente no componente de listagem.
- Para evoluir a funcionalidade (ex: mostrar quantidade de anexos, nomes, etc.), utilize o array `arquivos` já disponível em cada tarefa.

...