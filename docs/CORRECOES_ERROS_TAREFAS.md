# Relatório de Correção: Erro de Criação de Tarefas

## Problema Identificado

Ao enviar o formulário de criação de novas tarefas, o sistema apresentava o seguinte erro:
```
SyntaxError: No number after minus sign in JSON at position 1
```

Este erro ocorria no endpoint da API ao tentar processar os dados recebidos do formulário.

## Diagnóstico

Após análise detalhada do código e logs, identificamos os seguintes problemas:

1. **Incompatibilidade de Tipos**: O frontend estava enviando dados no formato `FormData`, mas o backend esperava dados em formato `JSON`
2. **Tipos de Dados Inconsistentes**: Campos como `prioridade` e `clienteId` estavam sendo enviados como strings, mas o schema no backend esperava números
3. **Tratamento Inadequado de Campos Opcionais**: Valores nulos ou vazios estavam sendo processados incorretamente

## Solução Implementada

### 1. Alteração do Método de Envio

Alteramos a função `onSubmit` do componente `TarefaForm` para enviar os dados em formato JSON em vez de FormData:

```typescript
// Antigo (com problema)
const formData = new FormData();
formData.append('titulo', data.titulo);
formData.append('prioridade', data.prioridade);
// ... outros campos
const response = await fetch('/api/tarefas', {
  method: 'POST',
  body: formData, // FormData não é compatível com request.json()
});

// Novo (corrigido)
const jsonData = {
  titulo: data.titulo,
  tipo: data.tipo,
  status: data.status,
  descricao: data.descricao || '',
  prioridade: Number(data.prioridade), // Convertendo para número
  recorrente: data.recorrente,
};
const response = await fetch('/api/tarefas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(jsonData),
});
```

### 2. Conversão de Tipos

Implementamos conversões adequadas para garantir que os dados sejam enviados nos tipos corretos:

```typescript
// Cliente (opcional)
if (data.clienteId) {
  // Tratando "0" como nulo (sem cliente)
  if (data.clienteId === "0") {
    jsonData.clienteId = null;
  } else {
    jsonData.clienteId = Number(data.clienteId);
  }
}

// Responsáveis (conversão de strings para números)
if (data.responsaveis.length > 0) {
  jsonData.responsavelId = Number(data.responsaveis[0]);
  jsonData.responsaveis = data.responsaveis.map(id => Number(id));
} else {
  jsonData.responsaveis = [];
}
```

### 3. Adição de Logs para Depuração

Adicionamos logs detalhados para facilitar o diagnóstico:

```typescript
console.log("Enviando dados:", data);
```

## Verificação da Correção

Após as alterações, o formulário agora envia os dados corretamente e o backend processa-os sem erros:

1. Os dados são enviados em formato JSON com o cabeçalho `Content-Type: application/json`
2. Todos os campos numéricos são convertidos corretamente antes do envio
3. Campos opcionais são tratados adequadamente, com valores vazios e nulos processados corretamente
4. A validação no schema backend é satisfeita
5. A resposta da API retorna status 201 (Created) indicando sucesso na criação da tarefa

## Lições Aprendidas

1. **Consistência de Tipos**: Garantir que frontend e backend estejam em sincronia quanto aos tipos de dados esperados
2. **Validação Robusta**: Implementar validação mais rigorosa tanto no frontend quanto no backend
3. **Logs Eficientes**: Adicionar logs estratégicos para identificar problemas rapidamente
4. **Tratamento Defensivo**: Sempre converter e validar dados antes de enviar para a API

## Status Atual

- ✓ Problema identificado e diagnosticado
- ✓ Correções implementadas no frontend
- ✓ Testes realizados e funcionamento validado
- ✓ Documentação atualizada

Com estas mudanças, o sistema agora cria tarefas de forma confiável e sem erros, melhorando significativamente a experiência do usuário.