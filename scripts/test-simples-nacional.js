// Script para testar o funcionamento do campo Simples Nacional
// Este script simula o comportamento da API CNPJA e do formulário

// Simula a atualização do select de um formulário React-Hook-Form
function testarAtualizacaoSimples() {
  console.log("Iniciando teste de atualização do campo Simples Nacional");
  
  // Simula resposta da API CNPJA
  const mockApiResponse = {
    nome: "Empresa Teste LTDA",
    simples_nacional: "sim" // Valor retornado da API
  };
  
  // Estado simulado do formulário
  let formState = {
    values: {
      simples_nacional: "nao" // Valor inicial do formulário
    },
    isDirty: false
  };
  
  // Função que simula setValue do React Hook Form
  function setValue(name, value, options = {}) {
    console.log(`Tentativa de atualizar ${name} para ${value}`);
    formState.values[name] = value;
    
    if (options.shouldDirty) {
      formState.isDirty = true;
    }
    
    return formState.values[name] === value;
  }
  
  // Simula a lógica de atualização que ocorre após a consulta de CNPJ
  console.log("Estado inicial do formulário:", formState.values);
  
  console.log("\nSimulando consulta à API CNPJA...");
  console.log("Resposta da API:", mockApiResponse);
  
  console.log("\nAtualizando formulário com dados da API...");
  const simples = mockApiResponse.simples_nacional === 'sim' ? 'sim' : 'nao';
  
  // Tenta atualizar o valor com a técnica original
  setValue("simples_nacional", simples, { shouldDirty: true });
  
  console.log("\nEstado do formulário após atualização:", formState.values);
  
  // Verificação
  if (formState.values.simples_nacional === mockApiResponse.simples_nacional) {
    console.log("\n✅ TESTE PASSOU: O valor foi atualizado corretamente");
  } else {
    console.log("\n❌ TESTE FALHOU: O valor não foi atualizado corretamente");
    console.log(`Esperado: "${mockApiResponse.simples_nacional}", Obtido: "${formState.values.simples_nacional}"`);
  }
}

// Executa o teste
testarAtualizacaoSimples();