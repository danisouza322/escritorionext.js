# Documentação Técnica - Sistema Contábil SaaS

## Visão Geral do Sistema

Este projeto é uma aplicação SaaS empresarial para escritórios de contabilidade, focada em automação e integração de processos contábeis utilizando tecnologias modernas. A aplicação é construída usando:

- **Framework Principal**: Next.js 14
- **Estilização**: TailwindCSS com componentes UI baseados em Radix UI
- **Banco de Dados**: PostgreSQL com conexão direta usando o driver pg
- **Autenticação**: NextAuth.js
- **Validação de Formulários**: Zod
- **Integração API Externa**: API CNPJA para consultas de dados empresariais

## Arquitetura do Sistema

### Estrutura de Diretórios

```
/
├── public/               # Arquivos estáticos
├── scripts/              # Scripts utilitários (admin-seed.js, db-push.js)
├── server/               # API e conexão com banco de dados
├── src/
│   ├── app/              # Rotas do Next.js 14 (App Router)
│   │   ├── api/          # Endpoints da API
│   │   ├── auth/         # Páginas de autenticação
│   │   ├── dashboard/    # Páginas do dashboard
│   │   ├── layout.tsx    # Layout principal da aplicação
│   │   └── page.tsx      # Página inicial
│   ├── components/       # Componentes reutilizáveis
│   │   ├── cliente/      # Componentes relacionados a clientes
│   │   ├── colaborador/  # Componentes relacionados a colaboradores
│   │   ├── dashboard/    # Componentes específicos do dashboard
│   │   ├── documento/    # Componentes de gerenciamento de documentos
│   │   ├── tarefa/       # Componentes de gerenciamento de tarefas
│   │   └── ui/           # Componentes de UI base
│   ├── contexts/         # Contextos React
│   ├── db/               # Esquema do banco de dados
│   ├── hooks/            # Hooks personalizados
│   ├── lib/              # Utilitários e configuração
│   ├── providers.tsx     # Provedores de contexto
│   └── types/            # Definições de tipos TypeScript
└── package.json          # Dependências do projeto
```

### Fluxo de Dados

1. **Cliente → Servidor**: Requisições HTTP para endpoints da API em `/src/app/api/`
2. **Servidor → Banco de Dados**: Consultas SQL diretas usando o driver pg
3. **Integração Externa**: API CNPJA para consultas de dados de empresas

## Módulos do Sistema

### 1. Autenticação (NextAuth.js)

- **Endpoints**: `/api/auth/*`
- **Configuração**: `/src/lib/auth.ts`
- **Contexto**: `/src/contexts/auth-context.tsx`

### 2. Gerenciamento de Clientes

#### Componentes Principais

- **Lista de Clientes**: `/src/components/cliente/cliente-list.tsx`
- **Formulário de Cliente**: `/src/components/cliente/cliente-form.tsx`
- **Botão de Remoção**: `/src/components/cliente/remove-cliente-button.tsx`

#### Endpoints da API

- **Listar/Criar**: `/src/app/api/clientes/route.ts`
- **Detalhar/Atualizar/Remover**: `/src/app/api/clientes/[id]/route.ts`
- **Consulta CNPJ**: `/src/app/api/cnpja/route.ts`

#### Páginas

- **Listagem**: `/src/app/dashboard/clientes/page.tsx`
- **Detalhes**: `/src/app/dashboard/clientes/[id]/page.tsx`
- **Novo Cliente**: `/src/app/dashboard/clientes/novo/page.tsx`

### 3. Gerenciamento de Documentos

#### Componentes Principais

- **Lista de Documentos**: `/src/components/documento/documento-list.tsx`
- **Upload de Documento**: `/src/components/documento/upload-documento.tsx`

### 4. Gerenciamento de Tarefas

#### Componentes Principais

- **Lista de Tarefas**: `/src/components/tarefa/tarefa-list.tsx`
- **Formulário de Tarefa**: `/src/components/tarefa/tarefa-form.tsx`

### 5. Dashboard

#### Componentes Principais

- **Cards de Estatísticas**: `/src/components/dashboard/stats-cards.tsx`
- **Tarefas Recentes**: `/src/components/dashboard/recent-tasks.tsx`
- **Visão Geral de Clientes**: `/src/components/dashboard/client-overview.tsx`
- **Calendário**: `/src/components/dashboard/calendar-overview.tsx`

## Esquema do Banco de Dados

O esquema do banco de dados está definido em `/src/db/schema.ts` e inclui as seguintes tabelas:

- **contabilidades**: Registros das empresas contábeis
- **usuarios**: Usuários do sistema (colaboradores, administradores)
- **clientes**: Clientes das contabilidades
- **documentos**: Documentos dos clientes
- **tarefas**: Tarefas associadas aos clientes

## Padrões de Implementação

### 1. Tratamento de Dados Ativos/Inativos

Todos os registros principais (clientes, documentos, tarefas) possuem um campo `ativo` que é usado para implementar exclusão lógica. Ao remover um item, seu campo `ativo` é alterado para `false` ao invés de removê-lo fisicamente do banco de dados.

```tsx
// Exemplo: Consulta de clientes ativos
const clientes = await db.query.clientes.findMany({
  where: and(
    eq(clientes.contabilidadeId, contabilidadeId),
    eq(clientes.ativo, true)
  ),
});
```

### 2. Redirecionamento após Ações

O componente `RemoveClienteButton` aceita uma prop `redirectTo` que permite configurar o redirecionamento após a remoção:

```tsx
<RemoveClienteButton 
  id={clienteId} 
  nome={cliente.nome}
  redirectTo="/dashboard/clientes"
/>
```

### 3. Formulários Dinâmicos

Os formulários podem ser usados tanto como modais quanto como componentes embutidos em páginas:

```tsx
<ClienteForm 
  embedded={true} 
  onSuccess={(cliente) => router.push(`/dashboard/clientes/${cliente.id}`)} 
/>
```

### 4. Proteção de Rotas

O sistema redireciona usuários para rotas adequadas quando tentam acessar dados inexistentes ou inativos:

```tsx
if (!cliente) {
  return { redirect: "/dashboard/clientes" };
}
```

## Integração com API CNPJA

A aplicação se integra com a API CNPJA para consultar e preencher automaticamente dados de empresas a partir do CNPJ:

- **Endpoint**: `/src/app/api/cnpja/route.ts`
- **Uso no Formulário**: `/src/components/cliente/cliente-form.tsx`
- **Variável de Ambiente**: `CNPJA_API_KEY` para autenticação

```tsx
async function consultarCNPJ(documento: string) {
  // Lógica de consulta à API CNPJA
}
```

## Componentes de UI

O sistema utiliza componentes de UI baseados em Radix UI e TailwindCSS:

- **Botões**: `/src/components/ui/button.tsx`
- **Cards**: `/src/components/ui/card.tsx`
- **Tabelas**: `/src/components/ui/table.tsx`
- **Formulários**: `/src/components/ui/form.tsx`
- **Modais/Diálogos**: `/src/components/ui/dialog.tsx`, `/src/components/ui/alert-dialog.tsx`
- **Notificações**: `/src/components/ui/toast.tsx`, `/src/hooks/use-toast.ts`

## Padrões de Design

### 1. Interface Minimalista

Os botões de ação na lista de clientes exibem apenas ícones para uma interface mais limpa:

```tsx
<Button variant="ghost" size="sm" className="gap-1">
  <Eye className="h-4 w-4" />
  <span className="sr-only">Detalhes</span>
</Button>
```

### 2. Toast Notifications

O sistema usa toast notifications para feedback do usuário:

```tsx
const { toast } = useToast();

toast({
  title: "Cliente removido",
  description: "O cliente foi removido com sucesso",
});
```

## Boas Práticas Implementadas

### 1. Validação de Dados

O sistema usa Zod para validação de formulários:

```tsx
const clienteSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  documento: z.string().min(1, "Documento é obrigatório"),
  // ...
});
```

### 2. Filtros de Dados

Sempre filtrar dados ativos nas consultas:

```tsx
const totalClientes = await db.query.clientes.findMany({
  where: and(
    eq(clientes.contabilidadeId, contabilidadeId),
    eq(clientes.ativo, true)
  ),
}).then(res => res.length);
```

### 3. Tratamento de Erros

Implementação de tratamento de erros consistente:

```tsx
try {
  // Operação
} catch (error) {
  console.error("Erro:", error);
  toast({
    title: "Erro",
    description: error instanceof Error ? error.message : "Ocorreu um erro",
    variant: "destructive",
  });
} finally {
  setIsLoading(false);
}
```

## Funcionalidades Prontas para Uso

1. ✅ **Autenticação Completa** - Login/Registro de usuários
2. ✅ **Gerenciamento de Clientes** - Criar, visualizar, editar, remover
3. ✅ **Integração com API CNPJA** - Consulta automática de dados empresariais
4. ✅ **Upload de Documentos** - Associados a clientes
5. ✅ **Gerenciamento de Tarefas** - Atribuídas a clientes e responsáveis
6. ✅ **Dashboard** - Visão geral de estatísticas e atividades recentes

## Otimizações e Boas Práticas de Consulta

1. **Controle de Estado**:
   - Todos os modais e operações de loading são controlados por estados React
   - Uso de `useState` para controle local
   - Uso de contextos para estado global

2. **Consultas SQL Eficientes**:
   - Uso de filtros específicos para reduzir volume de dados
   - Uso de `limit` e ordenação para paginação
   - Queries com relações quando necessário usando `with`

```tsx
const tarefasRecentes = await db.query.tarefas.findMany({
  where: eq(tarefas.contabilidadeId, contabilidadeId),
  orderBy: [desc(tarefas.dataCriacao)],
  limit: 5,
  with: {
    cliente: true,
    responsavel: true,
  },
});
```

## Problemas Conhecidos e Limitações

1. **Erro de params.id**: Existe um erro no Next.js 14 relacionado ao uso de `params.id` sem await, exibindo uma mensagem de alerta no console. Este é um problema conhecido que não afeta a funcionalidade.

2. **Funções de Utilitários**: Algumas funções de formatação como `formataDocumento` podem precisar de ajustes para casos específicos.

3. **Notificações**: Sistema ainda não implementa notificações em tempo real para atualizações.

## Manutenção e Expansão

### Adicionando Novos Campos

Para adicionar um novo campo a uma tabela:

1. Atualize o esquema em `/src/db/schema.ts`
2. Atualize os tipos correspondentes em `/src/types/index.ts`
3. Modifique os formulários e componentes de exibição
4. Execute `npm run db:push` para atualizar o esquema do banco de dados

### Adicionando Novas Páginas

1. Crie um novo arquivo em `/src/app/dashboard/[nome-da-rota]/page.tsx`
2. Atualize a navegação em `/src/components/sidebar.tsx`
3. Implemente os componentes necessários

## Conclusão

Este sistema implementa uma aplicação SaaS completa para escritórios de contabilidade, com foco em gerenciamento de clientes, documentos e tarefas. A documentação acima fornece uma visão geral do código, arquitetura e padrões implementados para facilitar futuras manutenções e expansões do sistema.