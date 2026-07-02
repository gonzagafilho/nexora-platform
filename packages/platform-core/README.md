# @nexora/platform-core

Pacote reutilizavel que concentra os contratos base da NEXORA Platform, incluindo registro de apps, resolucao de contexto multi-app e servicos de status/dashboard desacoplados de framework web e banco de dados.

## Objetivo

- Entregar o primeiro core real reutilizavel da plataforma.
- Padronizar contratos de App para todos os produtos da NEXORA.
- Isolar logica de App Registry e Context Provider fora de implementacoes especificas.

## APIs Exportadas

- createAppRegistry
- createContextProvider
- createPlatformService
- NEXORA_PLATFORM_VERSION
- PLATFORM_APPS
- PLATFORM_CORE_MODULES
- PlatformError
- validateAppDefinition
- normalizeProjectKey
- getDefaultAppIdFromProjectKey

## Exemplo de Uso

```js
const {
	createAppRegistry,
	createContextProvider,
	createPlatformService
} = require("@nexora/platform-core");

const registry = createAppRegistry();
const contextProvider = createContextProvider({ registry });
const platformService = createPlatformService({ registry, contextProvider });

const context = contextProvider.buildContext({
	tenantId: "tenant-01",
	userId: "user-01",
	projectKey: "associacoes",
	enabledModules: ["core", "financial"]
});

const status = platformService.getStatus(context);
const dashboard = platformService.getAppDashboard("associacoes", context);
```

## Contrato de App

Cada App registrado deve conter:

- id
- projectKey
- name
- version
- icon
- description
- enabled
- modules
- permissions
- skills
- routes
- agentProfile

## Boundaries

- Sem dependencia direta de Express.
- Sem dependencia direta de MongoDB/Mongoose.
- Sem import de apps reais em runtime externo ao pacote.
- Integracoes de core sao expostas como adapters com status adapter-ready.
