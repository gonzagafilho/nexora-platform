# @nexora/memory

Memory Engine independente da NEXORA Platform v0.4.0.

## Objetivo

Fornecer um motor de memoria generico, sem dependencias de framework web, banco ou app legado.

## Arquitetura

- `contracts`: contrato de adapter e record.
- `adapters`: implementacoes plugaveis (`inMemory`, `noop`).
- `engine`: API principal, policy, normalizacao e contexto.
- `retrieval`: busca textual, tags, ranking e context window.
- `bridge`: integracao por contrato com AI Core.

## Contratos

Memory Record (resumo):

- `id`, `tenantId`, `userId`, `projectKey`, `appId`
- `scope`, `type`, `title`, `content`, `tags`, `importance`
- `source`, `visibility`, `metadata`
- `createdAt`, `updatedAt`, `expiresAt`

Adapter Contract:

- `create(record)`
- `update(id, patch, context)`
- `delete(id, context)`
- `findById(id, context)`
- `search(query, context)`
- `list(context)`

## Retrieval

Implementado nesta fase:

- busca textual (`title` e `content`)
- busca por tags
- filtros por `scope` e `type`
- ranking por `importance` + relevancia textual + recencia
- context window com limite de itens e caracteres

## Policy

- bloqueia acesso sem `tenantId`
- impede cross-tenant
- aplica isolamento por `projectKey`/`appId`
- ignora memorias expiradas
- respeita `visibility`: `private`, `internal`, `public`

## Bridge com AI Core

`createAIMemoryBridge()` expoe:

- `resolveContext({ message, projectKey, appId, tenantId, userId })`
- `resolveMemory(query, context)`
- `saveMemory(record, context)`

Sem acoplamento direto ao `@nexora/ai-core`.

## Exemplo

```js
const {
	createMemoryEngine,
	createInMemoryAdapter
} = require("@nexora/memory");

const adapter = createInMemoryAdapter();
const memory = createMemoryEngine({ adapter });

await memory.remember(
	{
		projectKey: "associacoes",
		appId: "associacoes",
		scope: "conversation",
		type: "fact",
		title: "Preferencia de atendimento",
		content: "Cliente prefere contato por email",
		visibility: "private"
	},
	{
		tenantId: "tenant-01",
		userId: "user-01",
		projectKey: "associacoes",
		appId: "associacoes"
	}
);
```
