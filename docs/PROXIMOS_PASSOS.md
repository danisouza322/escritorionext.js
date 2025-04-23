# Próximos Passos e Correções Necessárias

## Data: 23/04/2025

Este documento apresenta uma análise detalhada do estado atual do sistema, identificando problemas a serem corrigidos e melhorias a serem implementadas nas próximas etapas de desenvolvimento.

## 1. Correções Urgentes

### 1.1. Erro de Parâmetros Dinâmicos no Next.js 14

**Problema identificado**: Erro recorrente nos logs:
```
Error: Route "/api/clientes/[id]" used `params.id`. `params` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
```

Este erro ocorre em várias rotas que utilizam parâmetros dinâmicos (`[id]`), indicando que estamos acessando propriedades dos parâmetros de forma síncrona quando deveria ser assíncrona no Next.js 14.

**Arquivos afetados**:
- `src/app/api/clientes/[id]/route.ts`
- `src/app/dashboard/clientes/[id]/page.tsx` 
- Possivelmente outras rotas dinâmicas

**Solução proposta**:
Atualizar o padrão de extração de parâmetros em todas as rotas dinâmicas conforme a documentação do Next.js 14:

```typescript
// Incorreto (gerando erro)
const clienteId = Number(params.id);

// Correto (Next.js 14)
const { id } = params;
const clienteId = Number(id);
```

Em alguns casos, pode ser necessário usar o padrão assíncrono:
```typescript
// Em componentes de página
export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  // resto do código
}

// Em handlers de rota (route.ts)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  // resto do código
}
```

### 1.2. Erros de Tipagem LSP

**Problema identificado**: Diversos erros de tipagem nos arquivos:
- `src/app/dashboard/page.tsx`
- `src/components/cliente/cliente-form-optimized.tsx`
- `src/components/tarefa-optimized/tarefa-form.tsx`

Estes erros indicam incompatibilidades entre os tipos de dados esperados e os recebidos, principalmente:
- Campos que podem ser `null` vs. campos não-nulos
- Tipos de dados em formulários vs. tipos esperados pelo backend
- Tipagem de parâmetros em funções como `SubmitHandler`

**Solução proposta**:
1. Corrigir as tipagens nos formulários para corresponder às interfaces definidas
2. Implementar conversão de tipos adequada antes de enviar dados para a API
3. Atualizar os tipos em `src/types/index.ts` para refletir corretamente a estrutura do banco de dados

## 2. Melhorias de Performance

### 2.1. Otimizar Carregamento de Dados

**Problema identificado**: Navegação lenta entre páginas e abertura demorada de modais.

**Solução proposta**:
1. Implementar estratégia de cache mais eficiente:
   ```typescript
   // Adicionar opções de cache nas chamadas fetch
   const response = await fetch('/api/endpoint', {
     next: { revalidate: 60 } // Revalidar a cada 60 segundos
   });
   ```

2. Utilizar React Suspense de forma mais ampla para carregamento progressivo
3. Implementar estratégia de paginação em listas de dados grandes
4. Reduzir quantidade de dados retornados nas consultas iniciais

### 2.2. Melhoria em Componentes Select

**Problema identificado**: Comportamento inconsistente em componentes Select, alternando entre estados controlados e não-controlados.

**Aviso nos logs**:
```
"Select is changing from uncontrolled to controlled. Components should not switch from controlled to uncontrolled (or vice versa)."
```

**Solução proposta**:
1. Garantir que todos os componentes Select iniciem com um valor padrão explícito
2. Usar o padrão controlado consistentemente em todo o aplicativo
3. Implementar manipuladores de eventos adequados para atualizar o estado

## 3. Melhorias Funcionais

### 3.1. Aprimorar Sistema de Responsáveis em Tarefas

**Próximos passos**:
1. Consolidar a funcionalidade de múltiplos responsáveis
2. Implementar interface para visualizar e gerenciar todos os responsáveis de uma tarefa
3. Adicionar funcionalidade para reordenar responsáveis (alterar o principal)
4. Implementar notificações para os responsáveis quando uma tarefa é atribuída

### 3.2. Melhoria na Interface de Upload de Arquivos

**Próximos passos**:
1. Implementar barra de progresso para uploads
2. Adicionar validação de tipos de arquivo permitidos
3. Implementar preview de imagens e documentos
4. Adicionar drag & drop para upload mais intuitivo

### 3.3. Funcionalidade de Tarefas Recorrentes

**Próximos passos**:
1. Completar implementação de tarefas recorrentes
2. Criar interface para definir padrões de recorrência
3. Implementar geração automática de tarefas baseada na recorrência
4. Adicionar visualização de calendário para tarefas recorrentes

## 4. Refatoração Técnica

### 4.1. Padronização de Formulários

**Próximos passos**:
1. Criar componentes de formulário reutilizáveis para elementos comuns
2. Padronizar a validação com Zod em todos os formulários
3. Unificar o padrão de envio de dados (JSON vs FormData)
4. Implementar gestão de estado de formulário consistente

### 4.2. Migração Completa para Componentes Optimizados

**Próximos passos**:
1. Substituir completamente componentes legados pelos optimizados
2. Remover código duplicado entre versões de componentes
3. Consolidar lógica em hooks reutilizáveis
4. Documentar padrões de componentes para futuras adições

## 5. Novas Funcionalidades

### 5.1. Sistema de Relatórios

**Próximos passos**:
1. Implementar relatórios de produtividade por usuário
2. Criar relatórios de tarefas por cliente
3. Desenvolver dashboard com gráficos e métricas visuais
4. Adicionar funcionalidade de exportação para PDF e Excel

### 5.2. Integração com Email

**Próximos passos**:
1. Implementar notificações por email utilizando SendGrid
2. Criar sistema de lembretes para tarefas próximas do vencimento
3. Enviar relatórios periódicos por email
4. Implementar recebimento de respostas por email

### 5.3. Aprimorar Integração com CNPJA API

**Próximos passos**:
1. Expandir dados capturados da API
2. Implementar atualização automática periódica dos dados
3. Adicionar histórico de consultas
4. Criar indicadores visuais para informações desatualizadas

## 6. Manutenção e Infraestrutura

### 6.1. Tratamento de Erros Consistente

**Próximos passos**:
1. Implementar sistema centralizado de tratamento de erros
2. Criar componentes reutilizáveis para exibição de erros
3. Melhorar mensagens de erro para o usuário final
4. Implementar sistema de log para facilitar diagnóstico

### 6.2. Segurança e Autenticação

**Próximos passos**:
1. Revisar permissões de acesso em todas as APIs
2. Implementar sistema de tokens para autenticação mais segura
3. Adicionar autenticação de dois fatores
4. Revisar e reforçar a segurança no acesso aos dados

## Priorização Recomendada

1. **Alta prioridade (imediato)**:
   - Corrigir erro de parâmetros dinâmicos no Next.js 14
   - Resolver problemas de tipagem críticos

2. **Média prioridade (próxima sprint)**:
   - Otimizar performance de carregamento
   - Concluir migração para componentes optimizados
   - Melhorar sistema de responsáveis em tarefas

3. **Baixa prioridade (futuro próximo)**:
   - Implementar novas funcionalidades (relatórios, integração com email)
   - Refinar interface de usuário
   - Expandir integração com API CNPJA

## Conclusão

O sistema está em bom estado de desenvolvimento, com funcionalidades essenciais já implementadas e operacionais. As correções e melhorias listadas neste documento visam aprimorar a experiência do usuário, a performance e a confiabilidade da aplicação.

A priorização sugerida permite focar primeiro nos problemas críticos, avançando gradualmente para melhorias e novas funcionalidades de acordo com os recursos disponíveis e necessidades dos usuários.