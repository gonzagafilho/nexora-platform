# @nexora/orchestrator

Orchestrator Engine independente da NEXORA Platform v0.6.0.

## Objetivo

Orquestrar planos de execucao de forma generica, sem acoplamento a app, banco ou framework de producao.

## Arquitetura

- contracts: contratos de plan, step, tools e runtime context.
- planner: intent -> plan, normalizacao e validacao.
- executor: pipeline execution, retry/timeout/rollback.
- pipeline: pipeline model, store e status.
- policies: confirmacao, permissao e policy central.
- events: eventos internos e emitter.
- strategies: sequential e parallel.
- utils: id e duracao.

## Execution Plan

Execution Plan e tratado como DAG (Directed Acyclic Graph):

- cada step e um no
- dependsOn define arestas entre steps
- ciclos sao bloqueados no validator
- ordenacao topologica define ordem segura
- niveis de execucao agrupam steps paralelizaveis

Plan:

- id
- intent
- tenantId
- userId
- projectKey
- appId
- confirmationRequired
- status
- steps
- metadata
- createdAt

Step:

- id
- tool
- input
- dependsOn
- strategy
- retry
- timeoutMs
- rollback
- confirmationRequired
- status
- result
- error
- startedAt
- finishedAt
- durationMs

## Runtime Context

`createRuntimeContext()` valida tenantId e prepara defaults:

- role default: operator
- locale default: pt-BR

## Planner

`createExecutionPlanner().createPlan(...)`

- usa steps recebidos quando fornecidos
- ou mapeia intent/message para plan basico
- valida contrato final do plano

## Executor

`createPipelineExecutor().executePlan(plan, context)`

- cria pipeline
- aplica policies
- executa steps com ordenacao DAG
- suporta strategies sequential/parallel
- aplica retry, timeout e rollback basico
- emite eventos e salva pipeline no store

## DAG Utilities

- buildPlanGraph(plan)
- detectCycle(plan)
- topologicalSort(plan)
- getExecutionLevels(plan)

As strategies usam essas utilidades:

- sequential usa topologicalSort
- parallel usa getExecutionLevels

## Execution Journal

Cada pipeline expoe pipeline.journal para auditoria e observabilidade.

API:

- append(type, message, data)
- info(message, data)
- warn(message, data)
- error(message, data)
- list()
- clear()

Eventos registrados incluem:

- Pipeline Started
- Step Started
- Step Completed
- Step Failed
- Step Retried
- Step Rolled Back
- Pipeline Completed
- Pipeline Failed
- Confirmation Required
- Permission Denied

Uso principal:

- auditoria operacional
- debug de execucao
- trilha para explicabilidade futura
- integracao com Control Center

## Policies

- tenantId obrigatorio
- permissao basica por tool
- confirmationRequired
- role viewer bloqueia tools mutaveis
- enabledModules opcional
- bloqueio cross-tenant

## Events

- PipelineCreated
- PipelineStarted
- PipelineCompleted
- PipelineFailed
- PipelineCancelled
- StepStarted
- StepCompleted
- StepFailed
- StepRetried
- StepRolledBack
- ConfirmationRequired
- PermissionDenied

## Strategies

- sequential: executa em ordem
- parallel: executa independentes em paralelo e dependentes depois

## Integracao futura

- AI Core gera intencao/plano
- Orchestrator normaliza e executa pipeline
- Skills/Tools executam capacidades
- Memory fornece contexto
- Runtime mantera estado futuro
- Events/Audit receberao telemetria

Compatibilidade de Tool Contract:

- context.tools.execute(toolName, input, context)
- context.tools.listTools()

## Exemplo

```js
const {
	createOrchestrator
} = require("@nexora/orchestrator");

const orchestrator = createOrchestrator();

const result = await orchestrator.execute({
	intent: "listar protocolos",
	message: "listar protocolos",
	context: {
		tenantId: "tenant-01",
		userId: "user-01",
		permissions: ["protocol:read"],
		enabledModules: ["protocol"],
		tools: {
			async execute(toolName) {
				return { toolName, ok: true };
			},
			listTools() {
				return ["protocol.list"];
			}
		}
	}
});
```
