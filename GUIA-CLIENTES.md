# Guia Técnico - Módulo de Clientes

## Visão Geral do Módulo

O módulo de clientes é responsável pelo gerenciamento completo dos clientes das contabilidades, incluindo cadastro, edição, visualização e remoção. Este módulo também implementa a integração com a API CNPJA para preenchimento automático de dados de empresas a partir do CNPJ.

## Arquivos-Chave

### Páginas

| Arquivo | Descrição |
|---------|-----------|
| `/src/app/dashboard/clientes/page.tsx` | Página de listagem de clientes |
| `/src/app/dashboard/clientes/[id]/page.tsx` | Página de detalhes do cliente |
| `/src/app/dashboard/clientes/novo/page.tsx` | Página de cadastro de novo cliente |

### Componentes

| Arquivo | Descrição |
|---------|-----------|
| `/src/components/cliente/cliente-list.tsx` | Componente de listagem de clientes com filtro e busca |
| `/src/components/cliente/cliente-form.tsx` | Formulário de cliente (criação/edição) |
| `/src/components/cliente/cliente-form-button.tsx` | Botão para abrir o modal de formulário |
| `/src/components/cliente/remove-cliente-button.tsx` | Botão para remoção de clientes |

### API

| Arquivo | Descrição |
|---------|-----------|
| `/src/app/api/clientes/route.ts` | Endpoints GET (listar) e POST (criar) |
| `/src/app/api/clientes/[id]/route.ts` | Endpoints GET (detalhar), PUT (atualizar) e DELETE (remover) |
| `/src/app/api/cnpja/route.ts` | Endpoint para consulta de CNPJ na API externa |

## Esquema de Dados

```typescript
export const clientes = pgTable("clientes", {
  id: serial("id").primaryKey(),
  contabilidadeId: integer("contabilidade_id").notNull().references(() => contabilidades.id),
  tipo: tipoClienteEnum("tipo").notNull(),
  nome: text("nome").notNull(),
  documento: text("documento").notNull(),
  email: text("email"),
  telefone: text("telefone"),
  endereco: text("endereco"),
  cidade: text("cidade"),
  estado: text("estado"),
  cep: text("cep"),
  // Campos para pessoa jurídica
  data_abertura: text("data_abertura"),
  natureza_juridica: text("natureza_juridica"),
  atividade_principal: text("atividade_principal"),
  simples_nacional: text("simples_nacional"),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").notNull().default(true),
  dataCriacao: timestamp("data_criacao").notNull().defaultNow(),
  dataAtualizacao: timestamp("data_atualizacao").notNull().defaultNow(),
});
```

## Fluxos Principais

### 1. Listagem de Clientes

- Página: `/dashboard/clientes`
- Componente: `ClienteList`
- API: GET `/api/clientes`
- Filtro: Apenas clientes ativos (ativo=true)
- Ordenação: Por data de criação (mais recentes primeiro)

```tsx
// Consulta na API
const clientes = await db.query.clientes.findMany({
  where: and(
    eq(clientes.contabilidadeId, contabilidadeId),
    eq(clientes.ativo, true)
  ),
  orderBy: [desc(clientes.dataCriacao)],
});
```

### 2. Detalhes do Cliente

- Página: `/dashboard/clientes/[id]`
- API: GET `/api/clientes/[id]`
- Proteção: Redireciona se o cliente não for encontrado ou não estiver ativo

```tsx
// Consulta e proteção
const cliente = await db.query.clientes.findFirst({
  where: and(
    eq(clientes.contabilidadeId, contabilidadeId),
    eq(clientes.id, clienteId),
    eq(clientes.ativo, true)
  ),
});

if (!cliente) {
  return { redirect: "/dashboard/clientes" };
}
```

### 3. Cadastro de Cliente

- Página: `/dashboard/clientes/novo`
- Componente: `ClienteForm` com `embedded={true}`
- API: POST `/api/clientes`
- Redirecionamento após sucesso: Página de detalhes do cliente

### 4. Edição de Cliente

- Modal na lista ou página de detalhes
- Componente: `ClienteForm`
- API: PUT `/api/clientes/[id]`
- Atualização automática da lista após edição

### 5. Remoção de Cliente

- Componente: `RemoveClienteButton`
- API: DELETE `/api/clientes/[id]`
- Confirmação: Modal de alerta
- Exclusão lógica: Atualiza campo `ativo` para `false`
- Redirecionamento configurável: Prop `redirectTo`

```tsx
<RemoveClienteButton 
  id={clienteId} 
  nome={cliente.nome}
  redirectTo="/dashboard/clientes"
/>
```

## Integração com API CNPJA

### Fluxo de Consulta

1. Usuário insere CNPJ no formulário de cliente
2. Sistema detecta que é um CNPJ válido e chama função `consultarCNPJ`
3. Requisição é enviada para `/api/cnpja?documento=XX.XXX.XXX/XXXX-XX`
4. API CNPJA é consultada usando a chave de API armazenada em variáveis de ambiente
5. Dados retornados são mapeados para o formato do formulário
6. Formulário é preenchido automaticamente com os dados recebidos

```tsx
// Em cliente-form.tsx
async function consultarCNPJ(documento: string) {
  setIsConsultando(true);
  
  try {
    const response = await fetch(`/api/cnpja?documento=${documento}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Erro ao consultar CNPJ");
    }
    
    const data = await response.json();
    
    // Preencher formulário com dados recebidos
    setValue("nome", data.nome);
    setValue("email", data.email || "");
    // ...outras propriedades
    
    toast({
      title: "CNPJ consultado com sucesso",
      description: "Dados preenchidos automaticamente",
    });
  } catch (error) {
    console.error("Erro ao consultar CNPJ:", error);
    toast({
      title: "Erro na consulta",
      description: error instanceof Error ? error.message : "Não foi possível consultar o CNPJ",
      variant: "destructive",
    });
  } finally {
    setIsConsultando(false);
  }
}
```

## Componentes Principais em Detalhes

### 1. ClienteList

- **Propósito**: Exibir lista paginada e filtrável de clientes
- **Estado Local**: 
  - `clientes`: Array de clientes atual
  - `pesquisa`: Termo de busca
  - `clienteEmEdicao`: Cliente sendo editado no modal
- **Funções Principais**:
  - `buscarDetalhesCliente`: Carrega cliente para edição
  - `removerClienteDaLista`: Atualiza lista após remoção
  - `atualizarListaClientes`: Atualiza lista após edição
- **Filtragem**: Clientes inativos são excluídos da lista

### 2. ClienteForm

- **Propósito**: Formulário para criar/editar clientes
- **Modo de Uso**: Modal (padrão) ou embutido (`embedded={true}`)
- **Props Principais**:
  - `cliente`: Dados do cliente para edição (opcional)
  - `onClose`: Callback quando o modal é fechado
  - `onSuccess`: Callback após sucesso (recebe o cliente criado/atualizado)
  - `embedded`: Se o formulário é embutido ou modal
- **Validação**: Esquema Zod `clienteSchema`
- **Integração**: Consulta CNPJ automática

### 3. RemoveClienteButton

- **Propósito**: Botão para remover clientes com confirmação
- **Props Principais**:
  - `id`: ID do cliente
  - `nome`: Nome do cliente (exibido na confirmação)
  - `onSuccess`: Callback após remoção bem-sucedida
  - `redirectTo`: Caminho para redirecionamento após remoção
- **UX**: Modal de confirmação com AlertDialog
- **Visual**: Exibe apenas ícones sem texto para interface limpa

## Mensagens e Notificações

O sistema utiliza o componente Toast para exibir mensagens de sucesso, erro e informações:

```tsx
const { toast } = useToast();

// Notificação de sucesso
toast({
  title: "Cliente cadastrado",
  description: "O cliente foi cadastrado com sucesso",
});

// Notificação de erro
toast({
  title: "Erro",
  description: "Ocorreu um erro ao cadastrar o cliente",
  variant: "destructive",
});
```

## Boas Práticas Implementadas

### 1. Exclusão Lógica

Clientes nunca são excluídos fisicamente do banco, apenas marcados como inativos:

```tsx
// Na API DELETE
await db
  .update(clientes)
  .set({ 
    ativo: false,
    dataAtualizacao: new Date()
  })
  .where(and(
    eq(clientes.id, clienteId),
    eq(clientes.contabilidadeId, contabilidadeId)
  ));
```

### 2. Validação com Zod

Todos os dados são validados antes de serem enviados:

```tsx
const clienteSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  documento: z.string().min(1, "Documento é obrigatório"),
  tipo: z.enum(["pessoa_fisica", "pessoa_juridica"]),
  // ...outros campos
});
```

### 3. Formatação de Documentos

Documentos são exibidos formatados usando funções utilitárias:

```tsx
// Em utils.ts
export function formataCNPJ(cnpj: string) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export function formataCPF(cpf: string) {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}
```

## Dicas para Manutenção

### 1. Adicionando Novos Campos

Para adicionar um novo campo ao cliente:

1. Adicione o campo no esquema (`src/db/schema.ts`)
2. Atualize o tipo Cliente (`src/types/index.ts`)
3. Adicione o campo no esquema de validação (`clienteSchema`)
4. Adicione o campo no formulário (`ClienteForm`)
5. Atualize a exibição na página de detalhes
6. Execute `npm run db:push` para atualizar o banco de dados

### 2. Alterando a Validação

Para modificar as regras de validação, edite o esquema Zod:

```tsx
const clienteSchema = z.object({
  // Modificações aqui
});
```

### 3. Customizando a Consulta CNPJ

Para ajustar a consulta CNPJ, modifique o mapeamento de dados em:

1. Função `consultarCNPJ` no `cliente-form.tsx`
2. Endpoint `/api/cnpja/route.ts`

## Problemas Conhecidos

1. Erro de console sobre `params.id` nas rotas dinâmicas é um problema conhecido do Next.js 14
2. O filtro de pesquisa na lista de clientes é case-sensitive

## Testes

As principais operações que devem ser testadas:

1. Criação de cliente (com e sem consulta CNPJ)
2. Edição de cliente
3. Remoção de cliente (verificar redirecionamento e exclusão lógica)
4. Visualização de detalhes
5. Filtro de pesquisa na lista de clientes
6. Tentativa de acesso a cliente inativo (deve redirecionar)