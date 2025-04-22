# Guia para Desenvolvedores - Módulo de Tarefas

Este documento descreve implementações técnicas específicas e soluções para problemas comuns no módulo de tarefas.

## Implementação de Múltiplos Responsáveis

### Estrutura de Dados
- Utilizamos uma tabela intermediária `tarefas_responsaveis` para implementar a relação N:N entre tarefas e usuários
- Mantivemos o campo `responsavelId` na tabela `tarefas` para compatibilidade e para representar o responsável principal

### Carregamento de Dados
- Para carregar as tarefas com seus responsáveis, usamos o recurso `with` do Drizzle ORM:

```typescript
const [tarefa] = await db.query.tarefas.findMany({
  where: and(
    eq(tarefas.id, tarefaId),
    eq(tarefas.contabilidadeId, contabilidadeId)
  ),
  with: {
    cliente: true,
    responsavel: true,
    responsaveis: {
      with: {
        usuario: true,
      },
    },
  },
});
```

### Exibição na Interface
- Na interface, exibimos os responsáveis usando avatares com as iniciais do nome
- A propriedade `responsaveis` pode estar vazia ou indefinida, por isso sempre verificamos com:
  ```typescript
  {tarefa.responsaveis && tarefa.responsaveis.length > 0 ? (
    // Código para exibir responsáveis
  ) : (
    // Código para exibir "Nenhum responsável atribuído"
  )}
  ```

## Permissões de Exclusão

### Problema Resolvido
Implementamos um sistema de permissões onde apenas o criador da tarefa pode excluí-la, garantindo que outros usuários não possam remover tarefas que não criaram.

### Backend
No backend, verificamos se o usuário autenticado é o criador da tarefa antes de permitir a exclusão:

```typescript
// Verificar se o usuário é o criador da tarefa (apenas o criador pode excluir)
if (tarefaExistente.criadorId !== usuarioId) {
  return new NextResponse(
    "Apenas o criador da tarefa pode excluí-la",
    { status: 403 }
  );
}
```

### Frontend
No frontend, ocultamos o botão de exclusão para usuários que não são os criadores:

```typescript
// Verificar se o usuário é o criador da tarefa
const isCreator = session?.user?.id && Number(session.user.id) === tarefa.criadorId;

// Mostrar botão de exclusão apenas se o usuário for o criador
{isCreator && (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </AlertDialogTrigger>
    {/* Conteúdo do diálogo de confirmação */}
  </AlertDialog>
)}
```

### Tratamento de Erros
Implementamos um tratamento de erros adequado para quando um usuário tenta excluir uma tarefa que não criou:

```typescript
if (response.status === 403) {
  toast({
    title: "Acesso negado",
    description: "Apenas o criador da tarefa pode excluí-la",
    variant: "destructive",
  });
  return;
}
```

## Exclusão em Cascata

### Problema Resolvido
Implementamos a exclusão em cascata para garantir que todos os registros relacionados (responsáveis, observações, arquivos) sejam excluídos quando uma tarefa for removida.

### Implementação
A exclusão em cascata é realizada na rota DELETE:

```typescript
// 1. Excluir responsáveis relacionados
await db
  .delete(tarefasResponsaveis)
  .where(eq(tarefasResponsaveis.tarefaId, tarefaId));

// 2. Excluir observações relacionadas
await db
  .delete(observacoesTarefas)
  .where(eq(observacoesTarefas.tarefaId, tarefaId));

// 3. Excluir arquivos relacionados
await db
  .delete(arquivosTarefas)
  .where(eq(arquivosTarefas.tarefaId, tarefaId));

// 4. Finalmente, excluir a tarefa
await db
  .delete(tarefas)
  .where(eq(tarefas.id, tarefaId));
```

## Debug e Solução de Problemas

### Problema: Responsáveis não aparecem na interface
Se os responsáveis não estiverem aparecendo na interface, verifique:

1. Se a consulta no backend está incluindo a relação `responsaveis` com a opção `with`
2. Se a propriedade `responsaveis` está sendo verificada corretamente na interface antes de tentar acessá-la
3. Se existem responsáveis cadastrados para a tarefa no banco de dados

Para debug, você pode adicionar:
```typescript
console.log('Dados da tarefa:', tarefa);
```

### Problema: Erro 403 ao excluir
Se estiver recebendo erro 403 ao tentar excluir uma tarefa:

1. Verifique se o usuário logado é realmente o criador da tarefa
2. Confirme que o campo `criadorId` está corretamente preenchido na tabela `tarefas`
3. Verifique se a comparação `tarefaExistente.criadorId !== usuarioId` está sendo feita com o mesmo tipo de dados (ambos devem ser números)

## Boas Práticas

1. **Tipagem**: Sempre utilize tipagem forte para as estruturas de dados
2. **Validação**: Valide os dados no lado do servidor, não confie apenas na validação do cliente
3. **Proteção**: Sempre verifique as permissões antes de realizar operações sensíveis
4. **Tratamento de Erros**: Forneça mensagens de erro claras para o usuário
5. **Logs**: Adicione logs para facilitar a depuração

## Comandos Úteis

Para ver todas as tarefas com seus responsáveis:
```sql
SELECT t.id, t.titulo, u.nome as responsavel_principal, u2.nome as criador
FROM tarefas t
LEFT JOIN usuarios u ON t.responsavel_id = u.id
LEFT JOIN usuarios u2 ON t.criador_id = u2.id;
```

Para ver todos os responsáveis de uma tarefa:
```sql
SELECT t.id, t.titulo, u.nome as responsavel
FROM tarefas t
JOIN tarefas_responsaveis tr ON t.id = tr.tarefa_id
JOIN usuarios u ON tr.usuario_id = u.id
WHERE t.id = X;
```