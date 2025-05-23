import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formataCNPJ(cnpj: string) {
  if (!cnpj) return "";
  
  return cnpj
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(\d{2})$/, "$1");
}

export function formataCPF(cpf: string) {
  if (!cpf) return "";
  
  return cpf
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1-$2")
    .replace(/(\d{2})$/, "$1");
}

export function formataDocumento(documento: string, tipo: string) {
  return tipo === "pessoa_fisica" ? formataCPF(documento) : formataCNPJ(documento);
}

export function formataData(data: Date | string) {
  if (!data) return "";
  
  // Para evitar problemas de hidratação com SSR, vamos usar uma abordagem mais direta
  try {
    const date = new Date(data);
    
    // Verificar se é uma data válida
    if (isNaN(date.getTime())) return "";
    
    // Forçar UTC para evitar diferenças entre servidor/cliente
    const dia = String(date.getUTCDate()).padStart(2, '0');
    const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
    const ano = date.getUTCFullYear();
    
    return `${dia}/${mes}/${ano}`;
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "";
  }
}

export function formataTelefone(telefone: string) {
  if (!telefone) return "";
  
  const numeroLimpo = telefone.replace(/\D/g, "");
  
  if (numeroLimpo.length === 11) {
    return numeroLimpo
      .replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  
  return numeroLimpo
    .replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

export function getTipoUsuarioLabel(tipo: string) {
  const tipos = {
    admin: "Administrador",
    contador: "Contador",
    assistente: "Assistente",
  };
  
  return tipos[tipo as keyof typeof tipos] || tipo;
}

export function getTipoClienteLabel(tipo: string) {
  const tipos = {
    pessoa_fisica: "Pessoa Física",
    pessoa_juridica: "Pessoa Jurídica",
  };
  
  return tipos[tipo as keyof typeof tipos] || tipo;
}

export function getTipoTarefaLabel(tipo: string) {
  const tipos = {
    fiscal: "Fiscal",
    contabil: "Contábil",
    departamento_pessoal: "Departamento Pessoal", 
    administrativa: "Administrativa",
    outro: "Outro",
  };
  
  return tipos[tipo as keyof typeof tipos] || tipo;
}

export function getStatusTarefaLabel(status: string) {
  const statusList = {
    pendente: "Pendente",
    em_andamento: "Em Andamento",
    concluida: "Concluída",
    atrasada: "Atrasada",
    cancelada: "Cancelada",
  };
  
  return statusList[status as keyof typeof statusList] || status;
}

export function getTipoDocumentoLabel(tipo: string) {
  const tipos = {
    fiscal: "Fiscal",
    contabil: "Contábil",
    departamento_pessoal: "Departamento Pessoal",
    juridico: "Jurídico",
    outro: "Outro",
  };
  
  return tipos[tipo as keyof typeof tipos] || tipo;
}
