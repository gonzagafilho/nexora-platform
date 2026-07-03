# @nexora/skills

Skills Engine independente da NEXORA Platform v0.5.0.

## Objetivo

Fornecer uma camada generica de skills com contrato, registry, executor, policy, eventos e adapters plugaveis.

## Arquitetura

- contracts: skill, executor e adapter contracts.
- registry: cadastro e governanca de skills.
- executor: pipeline de execucao com policy e eventos.
- policy: validacoes de tenant, permissoes, modulos, role e confirmacao.
- events: emitter interno e catalogo de eventos.
- adapters: noop e in-memory.
- skills: built-ins genericas sem acesso direto a banco.
- utils: normalizacao de nome e payload.

## Contratos

Skill Definition:

- name (category.action)
- description
- version
- category
- permissions
- confirmationRequired
- enabled
- inputSchema
- outputSchema
- execute(payload, context)

Adapter Contract:

- execute(skillName, payload, context)
- canExecute(skillName, context)
- listCapabilities()

## Registry

API:

- register
- unregister
- get
- has
- list
- listByCategory
- enable
- disable
- validate

## Executor

Fluxo:

- normaliza nome
- busca skill
- valida payload
- valida policy
- emite eventos de execucao
- executa via adapter ou skill.execute
- retorna ExecutionResult

## Policy

- tenantId obrigatorio
- userId quando skill exige permissao
- valida permissions
- valida enabledModules
- bloqueia skill disabled
- confirmationRequired
- bloqueio cross-tenant
- roles: owner, admin, manager, operator, viewer

## Events

Eventos internos:

- SkillRegistered
- SkillUnregistered
- SkillEnabled
- SkillDisabled
- SkillExecutionStarted
- SkillExecutionSucceeded
- SkillExecutionFailed
- SkillPermissionDenied
- SkillConfirmationRequired

## Built-in skills

- finance: createBolePix, getInvoice, listInvoices
- associate: find, list, details
- protocol: create, list, details
- project: list, details
- notification: email, push, whatsapp
- workflow: start, status
- report: generatePDF, exportExcel

## Adapters

- noopAdapter: fallback simples
- inMemorySkillAdapter: handlers em memoria

## Integracao futura

- AI Core chama skills por contrato.
- Orchestrator executa skills via executor.
- Apps fornecem adapters reais.
- Skills nao conhecem apps diretamente.

## Exemplo de uso

```js
const {
	createSkillRegistry,
	createSkillExecutor,
	createFinanceSkill
} = require("@nexora/skills");

const registry = createSkillRegistry();
createFinanceSkill().forEach((skill) => registry.register(skill));

const executor = createSkillExecutor({ registry });
```
