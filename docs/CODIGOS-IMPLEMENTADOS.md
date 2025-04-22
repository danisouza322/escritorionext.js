# Códigos-Chave Implementados

## RemoveClienteButton com Redirecionamento

```tsx
// src/components/cliente/remove-cliente-button.tsx
import { useRouter } from "next/navigation";

// ...

interface RemoveClienteButtonProps {
  id: number;
  nome: string;
  onSuccess?: () => void;
  redirectTo?: string; // Caminho para redirecionamento após remover
}

export default function RemoveClienteButton({ id, nome, onSuccess, redirectTo }: RemoveClienteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function removerCliente() {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      });

      // ...

      // Chamar callback se existir
      if (onSuccess) {
        onSuccess();
      }
      
      // Redirecionar se solicitado
      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (error) {
      // ...
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash className="h-4 w-4" />
          <span className="sr-only">Remover</span>
        </Button>
      </AlertDialogTrigger>
      {/* ... */}
    </AlertDialog>
  );
}
```

## Proteção para Clientes Inativos

```tsx
// src/app/dashboard/clientes/[id]/page.tsx

// Buscar cliente (somente ativos)
const cliente = await db.query.clientes.findFirst({
  where: and(
    eq(clientes.contabilidadeId, contabilidadeId),
    eq(clientes.id, clienteId),
    eq(clientes.ativo, true)
  ),
});

if (!cliente) {
  // Cliente não encontrado ou não está ativo
  return { redirect: "/dashboard/clientes" };
}
```

## Estatísticas com Clientes Ativos

```tsx
// src/app/dashboard/page.tsx

// Buscar estatísticas (apenas clientes ativos)
const totalClientes = await db.query.clientes.findMany({
  where: and(
    eq(clientes.contabilidadeId, contabilidadeId),
    eq(clientes.ativo, true)
  ),
}).then(res => res.length);

// Clientes recentes (apenas ativos)
const clientesRecentes = await db.query.clientes.findMany({
  where: and(
    eq(clientes.contabilidadeId, contabilidadeId),
    eq(clientes.ativo, true)
  ),
  orderBy: [desc(clientes.dataCriacao)],
  limit: 5,
});
```

## Botões de Ação Apenas com Ícones

```tsx
// src/components/cliente/cliente-list.tsx

<Link href={`/dashboard/clientes/${cliente.id}`}>
  <Button variant="ghost" size="sm" className="gap-1">
    <Eye className="h-4 w-4" />
    <span className="sr-only">Detalhes</span>
  </Button>
</Link>
<Button 
  variant="ghost" 
  size="sm" 
  className="gap-1"
  onClick={() => buscarDetalhesCliente(cliente.id)}
>
  <Pencil className="h-4 w-4" />
  <span className="sr-only">Editar</span>
</Button>
<RemoveClienteButton 
  id={cliente.id} 
  nome={cliente.nome}
  onSuccess={() => removerClienteDaLista(cliente.id)}
/>
```

## Uso de RemoveClienteButton com Redirecionamento

```tsx
// src/app/dashboard/clientes/[id]/page.tsx

<RemoveClienteButton 
  id={clienteId} 
  nome={cliente.nome}
  redirectTo="/dashboard/clientes"
/>
```