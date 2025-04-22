# Documentação do Módulo de Tarefas

## Visão Geral

O módulo de Tarefas é uma funcionalidade central do sistema de contabilidade que permite criar, visualizar, editar e gerenciar tarefas relacionadas a clientes e serviços contábeis. As tarefas podem ter múltiplos responsáveis, observações e arquivos anexos.

## Funcionalidades Implementadas

### 1. Listagem de Tarefas
- Visualização de todas as tarefas em uma tabela organizada
- Filtro de busca por título, descrição, cliente ou responsável
- Exibição de status visual (pendente, em andamento, concluída, atrasada, cancelada)
- Ações rápidas para iniciar ou concluir tarefas diretamente da lista

### 2. Criação de Tarefas
- Formulário para criação de novas tarefas com os seguintes campos:
  - Título (obrigatório)
  - Tipo (fiscal, contábil, departamento pessoal, administrativa, outro)
  - Cliente associado (opcional)
  - Descrição detalhada (opcional)
  - Status inicial (padrão: pendente)
  - Data de vencimento (opcional)
  - Prioridade (baixa, média, alta)
  - Múltiplos responsáveis (opcional)
- O primeiro responsável selecionado é definido como principal

### 3. Visualização Detalhada de Tarefas
- Página dedicada para visualizar todos os detalhes de uma tarefa
- Exibição de múltiplos responsáveis com avatares para fácil identificação
- Informações do cliente associado (quando existente)
- Detalhes de criação, atualização e conclusão
- Histórico de atividades (observações e arquivos)

### 4. Gerenciamento de Tarefas
- Atualização de status (pendente → em andamento → concluída)
- Cancelamento de tarefas
- Exibição de prazos e datas de vencimento
- Indicadores visuais de prioridade

### 5. Observações em Tarefas
- Adição de observações para documentar o progresso
- Visualização cronológica das observações
- Identificação do autor de cada observação
- Exclusão de observações (apenas pelo autor)

### 6. Arquivos em Tarefas
- Upload de arquivos relacionados à tarefa
- Visualização e download dos arquivos
- Exclusão de arquivos (apenas pelo autor)

### 7. Exclusão de Tarefas
- Exclusão de tarefas com confirmação
- Exclusão em cascata (remove observações, arquivos e relações de responsáveis)
- Restrição de exclusão: apenas o criador da tarefa pode excluí-la

## Estrutura de Dados

### Tabela `tarefas`
- `id`: Chave primária
- `contabilidadeId`: Referência à contabilidade
- `clienteId`: Referência ao cliente (opcional)
- `titulo`: Título da tarefa
- `descricao`: Descrição detalhada
- `tipo`: Enum (fiscal, contábil, departamento_pessoal, administrativa, outro)
- `status`: Enum (pendente, em_andamento, concluida, atrasada, cancelada)
- `responsavelId`: Referência ao usuário responsável principal (mantido para compatibilidade)
- `criadorId`: Referência ao usuário que criou a tarefa
- `dataVencimento`: Data limite para conclusão
- `dataConclusao`: Data de conclusão efetiva
- `prioridade`: Nível de prioridade (0-3)
- `recorrente`: Indica se a tarefa é recorrente
- `detalhesRecorrencia`: Dados JSON sobre a recorrência
- `ativo`: Status de atividade
- `dataCriacao`: Data de criação
- `dataAtualizacao`: Data da última atualização

### Tabela `tarefas_responsaveis`
- `id`: Chave primária
- `tarefaId`: Referência à tarefa
- `usuarioId`: Referência ao usuário responsável
- `dataCriacao`: Data de atribuição

### Tabela `observacoes_tarefas`
- `id`: Chave primária
- `tarefaId`: Referência à tarefa
- `usuarioId`: Referência ao autor
- `texto`: Conteúdo da observação
- `ativo`: Status de atividade
- `dataCriacao`: Data de criação
- `dataAtualizacao`: Data da última atualização

### Tabela `arquivos_tarefas`
- `id`: Chave primária
- `tarefaId`: Referência à tarefa
- `usuarioId`: Referência ao autor do upload
- `nome`: Nome do arquivo
- `tipo`: Tipo de arquivo (MIME)
- `tamanho`: Tamanho em bytes
- `caminho`: Caminho de armazenamento
- `ativo`: Status de atividade
- `dataCriacao`: Data de upload
- `dataAtualizacao`: Data da última atualização

## Relacionamentos

- Uma tarefa pertence a uma contabilidade
- Uma tarefa pode pertencer a um cliente
- Uma tarefa pode ter múltiplos responsáveis (relação N:N)
- Uma tarefa pode ter múltiplas observações
- Uma tarefa pode ter múltiplos arquivos
- Uma tarefa tem um criador (usuário)

## Rotas da API

### Tarefas

- `GET /api/tarefas`: Lista todas as tarefas
- `POST /api/tarefas`: Cria uma nova tarefa
- `GET /api/tarefas/:id`: Obtém detalhes de uma tarefa específica
- `PUT /api/tarefas/:id`: Atualiza uma tarefa (todas as propriedades)
- `PATCH /api/tarefas/:id`: Atualiza parcialmente uma tarefa (algumas propriedades)
- `DELETE /api/tarefas/:id`: Exclui uma tarefa (apenas o criador pode excluir)

### Observações

- `GET /api/tarefas/:id/observacoes`: Lista observações de uma tarefa
- `POST /api/tarefas/:id/observacoes`: Adiciona uma observação
- `DELETE /api/tarefas/:id/observacoes?observacaoId=X`: Remove uma observação (apenas o autor pode excluir)

### Arquivos

- `GET /api/tarefas/:id/arquivos`: Lista arquivos de uma tarefa
- `POST /api/tarefas/:id/arquivos`: Faz upload de um arquivo
- `DELETE /api/tarefas/:id/arquivos?arquivoId=X`: Remove um arquivo (apenas o autor pode excluir)

## Permissões e Restrições

1. **Visualização:**
   - Todos os usuários da contabilidade podem ver todas as tarefas

2. **Criação:**
   - Todos os usuários podem criar tarefas
   - O criador é registrado automaticamente

3. **Edição:**
   - Qualquer usuário pode atualizar o status de uma tarefa
   - Qualquer usuário pode adicionar observações ou arquivos

4. **Exclusão:**
   - Apenas o criador pode excluir uma tarefa
   - Apenas o autor pode excluir suas próprias observações ou arquivos

## Componentes Frontend

1. **TarefaList**: Componente de listagem com filtros e ações rápidas
2. **TarefaForm**: Formulário para criação/edição de tarefas
3. **TarefaDetalhes**: Visualização detalhada com abas para observações e arquivos

## Regras de Negócio Implementadas

1. O criador da tarefa é automaticamente registrado
2. Apenas o criador pode excluir a tarefa
3. O primeiro responsável selecionado é definido como responsável principal
4. Exclusão em cascata de todos os registros relacionados
5. Apenas o autor pode excluir suas próprias observações e arquivos
6. O status da tarefa segue um fluxo lógico (pendente → em andamento → concluída)
7. Todas as ações ficam registradas com timestamp e autor

## Melhorias Futuras

1. Implementar notificações para tarefas próximas do vencimento
2. Adicionar sistema de lembretes por email
3. Implementar histórico completo de alterações
4. Adicionar sistema de etiquetas/tags para categorização
5. Implementar dashboard com métricas e visualizações gráficas
6. Criar tela de calendário para visualização temporal das tarefas