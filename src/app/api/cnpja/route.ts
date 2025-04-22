import { NextResponse } from 'next/server';

/**
 * Formata uma data no padrão brasileiro (dd/mm/aaaa)
 */
function formatarDataBR(dataStr: string): string {
  try {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch (e) {
    return dataStr;
  }
}

/**
 * API para consultar dados de empresas através do CNPJ utilizando a API CNPJA
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documento = searchParams.get('documento');
  
  if (!documento) {
    return NextResponse.json(
      { error: 'Documento (CNPJ) não fornecido' },
      { status: 400 }
    );
  }
  
  // Formata o CNPJ para o formato esperado pela API - apenas números
  const cnpj = documento.replace(/[^\d]/g, '');
  
  // Verifica se o CNPJ tem 14 dígitos
  if (cnpj.length !== 14) {
    return NextResponse.json(
      { error: 'CNPJ inválido. Deve conter 14 dígitos' },
      { status: 400 }
    );
  }

  // Acessa a chave da API do ambiente
  const apiKey = process.env.CNPJA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Chave de API não configurada no servidor' },
      { status: 500 }
    );
  }

  try {
    // Formata o CNPJ para o formato esperado pela API CNPJA (com a máscara correta)
    const formattedCnpj = `${cnpj.slice(0, 8)}${cnpj.slice(8, 12)}${cnpj.slice(12, 14)}`;
    
    // Define a URL da API CNPJA
    const url = `https://api.cnpja.com/office/${formattedCnpj}?simples=true&simplesHistory=true&registrations=BR`;
    
    // Faz a requisição para a API CNPJA
    const response = await fetch(url, {
      headers: {
        'Authorization': apiKey
      }
    });
    
    // Verifica se a requisição foi bem sucedida
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na consulta CNPJA:', errorData);
      
      return NextResponse.json(
        { error: `Erro na consulta: ${errorData.message || response.statusText}` },
        { status: response.status }
      );
    }
    
    // Obtém os dados da empresa
    const data = await response.json();
    
    // Log para debug
    console.log('Dados retornados da API CNPJA:', JSON.stringify(data, null, 2));
    console.log('Simples Nacional:', data?.company?.simples?.optant === true ? 'SIM' : 'NÃO');
    
    // Formata os dados para retornar para o cliente
    const formattedData = {
      nome: data.company?.name || '',
      documento: documento,
      tipo: 'pessoa_juridica',
      email: data.emails?.[0]?.address || '',
      telefone: data.phones?.[0] ? `${data.phones[0].area}${data.phones[0].number}` : '',
      endereco: data.address?.street ? `${data.address.street}, ${data.address.number}` : '',
      complemento: data.address?.details || '',
      bairro: data.address?.district || '',
      cidade: data.address?.city || '',
      estado: data.address?.state || '',
      cep: data.address?.zip || '',
      status: data.status?.text || '',
      data_abertura: data.founded ? formatarDataBR(data.founded) : '',
      natureza_juridica: data.legalNature?.text || '',
      atividade_principal: data.mainActivity?.text || '',
      atividades_secundarias: data.sideActivities?.map((activity: any) => activity.text).join(', ') || '',
      simples_nacional: data.company?.simples?.optant === true ? 'sim' : 'nao',
      mei: data.company?.simei?.optant === true ? 'sim' : 'nao',
      capital_social: data.capital || '',
      raw: data // Inclui todos os dados brutos para uso avançado, se necessário
    };
    
    // Retorna os dados formatados
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Erro ao consultar CNPJ:', error);
    return NextResponse.json(
      { error: 'Erro ao consultar dados da empresa. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}