# Manual do Usuário - Gerenciamento de Tarefas

## Introdução

O módulo de Tarefas permite que você crie, visualize e gerencie todas as atividades relacionadas aos seus clientes e trabalhos contábeis. Este guia apresenta as principais funcionalidades e como utilizá-las.

## Índice

1. [Visualizando Tarefas](#1-visualizando-tarefas)
2. [Criando Novas Tarefas](#2-criando-novas-tarefas)
3. [Detalhes da Tarefa](#3-detalhes-da-tarefa)
4. [Gerenciando Status](#4-gerenciando-status)
5. [Adicionando Observações](#5-adicionando-observações)
6. [Anexando Arquivos](#6-anexando-arquivos)
7. [Excluindo Tarefas](#7-excluindo-tarefas)
8. [Perguntas Frequentes](#8-perguntas-frequentes)

## 1. Visualizando Tarefas

A página principal de tarefas exibe todas as suas tarefas em formato de tabela:

- Para **filtrar tarefas**, use a caixa de busca no topo da lista. Você pode buscar por título, descrição, cliente ou responsável.
- A coluna **Status** mostra o andamento atual da tarefa com cores diferentes:
  - **Pendente**: Tarefas que ainda não foram iniciadas
  - **Em Andamento**: Tarefas que estão sendo trabalhadas
  - **Concluída**: Tarefas finalizadas
  - **Atrasada**: Tarefas que ultrapassaram a data de vencimento
  - **Cancelada**: Tarefas que foram canceladas

- A coluna **Ações** oferece botões para operações rápidas:
  - **Ver**: Exibe os detalhes completos da tarefa
  - **Iniciar**: (Para tarefas pendentes) Muda o status para "Em Andamento"
  - **Concluir**: (Para tarefas em andamento) Muda o status para "Concluída"
  - **Excluir**: (Apenas para o criador da tarefa) Remove a tarefa do sistema

## 2. Criando Novas Tarefas

Para criar uma nova tarefa:

1. Clique no botão **Nova Tarefa** no topo da página de tarefas
2. Preencha os campos do formulário:
   - **Título**: Nome ou identificação da tarefa (obrigatório)
   - **Tipo**: Categoria da tarefa (fiscal, contábil, etc.)
   - **Cliente**: Cliente relacionado à tarefa (opcional)
   - **Descrição**: Explicação detalhada do que precisa ser feito
   - **Status**: Estado inicial da tarefa (padrão: pendente)
   - **Responsáveis**: Pessoas encarregadas de executar a tarefa
   - **Data de Vencimento**: Prazo para conclusão
   - **Prioridade**: Nível de importância (baixa, média, alta)

3. Clique em **Salvar** para criar a tarefa

**Dica**: O primeiro responsável selecionado será considerado o responsável principal da tarefa.

## 3. Detalhes da Tarefa

Ao clicar em "Ver" em uma tarefa, você acessa a página de detalhes que mostra:

- **Informações Gerais**: Título, tipo, cliente, responsáveis, datas
- **Aba Observações**: Comentários e atualizações sobre o andamento
- **Aba Arquivos**: Documentos relacionados à tarefa

Esta página permite que você acompanhe todo o histórico e andamento da tarefa.

## 4. Gerenciando Status

Você pode atualizar o status de uma tarefa de duas maneiras:

1. **Na lista de tarefas**:
   - Clique em "Iniciar" para mudar de Pendente para Em Andamento
   - Clique em "Concluir" para marcar uma tarefa Em Andamento como Concluída

2. **Na página de detalhes**:
   - Botões de ação no topo da página permitem mudar o status
   - Você também pode cancelar uma tarefa por meio do botão "Cancelar"

**Observação**: Quando uma tarefa é concluída, a data de conclusão é registrada automaticamente.

## 5. Adicionando Observações

Para adicionar observações em uma tarefa:

1. Acesse a página de detalhes da tarefa
2. Na aba "Observações", digite seu comentário na caixa de texto
3. Clique em "Enviar Observação"

As observações são exibidas em ordem cronológica inversa (mais recentes primeiro).

**Importante**: Você pode excluir apenas as observações que você mesmo criou, clicando no ícone de lixeira ao lado da observação.

## 6. Anexando Arquivos

Para anexar arquivos a uma tarefa:

1. Acesse a página de detalhes da tarefa
2. Na aba "Arquivos", clique na área de upload ou arraste arquivos para ela
3. Clique em "Enviar Arquivo"

Você pode baixar qualquer arquivo anexado, e excluir apenas os arquivos que você mesmo enviou.

## 7. Excluindo Tarefas

Para excluir uma tarefa:

1. Na lista de tarefas, clique no ícone de lixeira na coluna de ações
2. Confirme a exclusão no diálogo que aparece

**Importante**: Apenas o criador da tarefa pode excluí-la. Se você não vê o botão de exclusão, significa que não foi você quem criou a tarefa.

Quando uma tarefa é excluída, todas as suas observações e arquivos também são removidos.

## 8. Perguntas Frequentes

### Quem pode ver minhas tarefas?
Todos os usuários da sua contabilidade podem ver todas as tarefas registradas.

### Por que não consigo excluir uma tarefa?
Apenas o criador da tarefa (pessoa que a criou) pode excluí-la. Se você precisa excluir uma tarefa que não criou, entre em contato com o criador.

### Como posso atribuir múltiplos responsáveis?
Ao criar ou editar uma tarefa, você pode selecionar vários responsáveis no campo "Responsáveis". O primeiro responsável selecionado será considerado o principal.

### Posso editar uma tarefa depois de criada?
Sim, você pode editar qualquer campo de uma tarefa através da página de detalhes.

### Como sei se uma tarefa está atrasada?
Tarefas atrasadas são exibidas com um badge vermelho no status. Elas são identificadas automaticamente pelo sistema quando a data de vencimento já passou e a tarefa não foi concluída.

### Quem recebe notificações sobre as tarefas?
Atualmente, o sistema não envia notificações automáticas. Todos os responsáveis devem acompanhar suas tarefas regularmente.

### Como posso filtrar apenas minhas tarefas?
Use a caixa de busca e digite seu nome para ver apenas as tarefas em que você é responsável.