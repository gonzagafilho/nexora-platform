# NEXORA Platform Architecture

Este documento consolida a arquitetura-alvo da plataforma para o monorepo.

## Camadas
- Gateway: entrada e roteamento
- Platform Core: contratos e governança
- AI Core: assistant, memory, skills e orchestrator
- Apps: produtos independentes por domínio
- Control Center: operação e observabilidade

## Regras-chave
- Core não depende de apps.
- Apps consomem contratos do core.
- Isolamento multi-tenant por padrão.
- Evolução incremental por fases com rollback definido.
