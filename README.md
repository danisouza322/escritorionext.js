# ContabilidadePRO - Atualização de Perfil e Avatar

## Funcionalidade: Edição de Perfil do Usuário

### Fluxo Implementado

- O usuário pode editar seu nome e foto de perfil na rota `/dashboard/perfil`.
- O upload da foto é feito via formulário, com preview imediato.
- Após salvar, a foto é persistida no banco (campo `fotoPerfil` na tabela `usuarios`).
- **A foto anterior é excluída automaticamente do servidor ao salvar uma nova, evitando acúmulo de arquivos órfãos.**
- O backend e a sessão do NextAuth propagam o campo `fotoPerfil` para o frontend.
- O avatar do header exibe a foto de perfil imediatamente após o upload, sem necessidade de logout ou reload manual.

### Arquitetura

- **Contexto Global de Usuário (`UserContext`)**: Garante atualização instantânea do avatar em toda a aplicação.
- **Atualização da Sessão**: O formulário chama `useSession().update()` e também atualiza o contexto global com a nova URL da foto.
- **Fallback**: Se o usuário não tiver foto, o avatar exibe a inicial do nome.

### Principais Arquivos

- `src/components/perfil/perfil-form.tsx`: Formulário de edição de perfil, upload de foto e atualização do contexto global.
- `src/components/user-dropdown.tsx`: Avatar do usuário, consumindo o contexto global.
- `src/context/UserContext.tsx`: Contexto global de usuário.
- `src/app/dashboard/layout.tsx`: Envolve o dashboard com o provider do contexto global.
- `src/lib/auth.ts`: Propagação do campo `fotoPerfil` na sessão do NextAuth.
- `src/app/api/usuario/perfil/route.ts`: Endpoint para atualização de nome e foto de perfil, com exclusão automática da foto anterior.

### Observações

- O campo `fotoPerfil` deve estar presente no banco e na sessão.
- O contexto global é atualizado após o upload, garantindo UX instantânea.
- O avatar nunca fica desatualizado após alteração de foto.
- O servidor mantém apenas a foto mais recente do usuário, evitando arquivos órfãos.

---

## Como funciona o fluxo de atualização do avatar?

1. O usuário faz upload de uma nova foto em `/dashboard/perfil`.
2. O backend salva a foto, exclui a anterior (se houver) e retorna a URL.
3. O formulário atualiza a sessão e o contexto global com a nova URL.
4. O avatar consome o contexto e exibe a nova foto imediatamente.
5. Se não houver foto, exibe a inicial do nome.

---

## Manutenção

- Para alterar o comportamento do avatar, edite `user-dropdown.tsx`.
- Para alterar o fluxo de atualização, edite `perfil-form.tsx` e `UserContext.tsx`.
- Para garantir que o campo `fotoPerfil` está sempre atualizado, mantenha a lógica de update no backend e na sessão.
- Para alterar o diretório de armazenamento ou lógica de exclusão, edite `api/usuario/perfil/route.ts`.
