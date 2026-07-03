# @nexora/ai-core

AI Core independente da NEXORA Platform v0.3.0.

## Arquitetura

O pacote foi separado para reutilizar os conceitos de IA sem acoplamento a app, banco, framework web ou runtime especifico.

Camadas:

- `assistant`: engine principal e validacoes de entrada/saida.
- `copilot`: construcao de prompt, conversa e execucao.
- `planner`: deteccao de intent, resolucao de contexto e plano de resposta.
- `providers`: registry e adapters de providers.
- `memory`: bridge de memoria apenas por interface.
- `contracts`: contratos e normalizacao.
- `errors`: erros de dominio para IA e provider.
- `config`: defaults e versao do pacote.

## API publica

```js
const {
	createAssistant,
	createCopilot,
	createProviderRegistry,
	createPromptBuilder,
	createConversation,
	createMemoryBridge,
	createIntentDetector,
	createResponsePlanner,
	AI_CORE_VERSION
} = require("@nexora/ai-core");
```

## Providers

O registry suporta providers com interface simples:

- `name: string`
- `execute(prompt, context): Promise<{ text, usage, metadata }>`
- `health(): Promise<{ status, ... }>`
- `capabilities(): string[]`

Implementados nesta fase:

- `mockProvider`
- `openaiProvider` (adapter)

Estrutura pronta para adicionar sem alterar o Assistant Engine:

- `anthropicProvider`
- `geminiProvider`
- `ollamaProvider`
- `azureOpenAIProvider`
- `deepseekProvider`

O `openaiProvider` nao depende de SDK OpenAI. Ele recebe uma funcao `invoke`:

```js
const registry = createProviderRegistry();

const openai = registry.createOpenAIProvider({
	invoke: async ({ prompt, context, config }) => {
		return {
			text: "Resposta via adapter",
			model: "gpt-adapter",
			usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
			raw: { prompt, context, config }
		};
	}
});

registry.registerProvider(openai);
```

## Assistant

`createAssistant()` implementa engine generica.

Entrada:

- `context`
- `message`
- `provider`
- `memory`
- `skills`
- `project`

Saida:

- `response`
- `metadata`
- `usage`
- `plan`

Exemplo:

```js
const { createAssistant, createProviderRegistry } = require("@nexora/ai-core");

const registry = createProviderRegistry();
const provider = registry.getProvider("mock");

const assistant = createAssistant({ provider });

const result = await assistant.run({
	message: "Crie um plano de atendimento",
	context: { tenantId: "t-1", userId: "u-1" },
	skills: ["finance"],
	project: "associacoes"
});
```

## Copilot

`createCopilot()` combina:

- Prompt Builder
- Conversation
- Capabilities
- Response
- Validation

## Planner

`createIntentDetector()` e `createResponsePlanner()` formam o nucleo inicial de planejamento.

Sem orquestrador nesta versao.

## Memory Bridge

Interface sem acesso direto a banco:

- `resolveContext()`
- `resolveMemory()`
- `saveMemory()`

## Scripts

- `pnpm --filter @nexora/ai-core lint`
- `pnpm --filter @nexora/ai-core test`
- `pnpm --filter @nexora/ai-core build`
- `pnpm --filter @nexora/ai-core independence`
