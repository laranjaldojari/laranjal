# Plataforma Municipal Integrada — Prefeitura de Laranjal do Jari

ERP municipal modular, web, seguro e escalável. Este repositório nasce pela **fundação** (Etapa 1) e cresce módulo a módulo, todos seguindo a mesma arquitetura.

---

## Como rodar (desenvolvimento)

```bash
cp .env.example .env          # ajuste os segredos
pnpm install                  # instala o monorepo
pnpm infra:up                 # sobe Postgres, Redis, MinIO, Grafana...
pnpm --filter @ljari/api prisma:migrate   # cria as tabelas
pnpm --filter @ljari/api prisma:seed      # papéis, permissões e admin inicial
pnpm dev                      # API em :3000  (Swagger em /docs)
```

Login inicial: `admin@laranjaldojari.ap.gov.br` / `Mudar@123` (trocar no 1º acesso).

---

## Arquitetura

Monorepo (Turborepo + pnpm) com fronteiras claras:

```
apps/
  api/   NestJS — backend modular (Clean Architecture + DDD)
  web/   Next.js — frontend (Etapa 2)
packages/
  shared/  tipos, enums e contratos compartilhados front/back
infra/     observabilidade e proxy
```

### Camadas de cada módulo (NestJS)

Cada módulo (`auth`, `users`, e os futuros `rh`, `financas`, `saude`...) repete **exatamente** esta estrutura — é o que garante consistência ao longo dos anos:

```
modules/<modulo>/
  domain/          regras e contratos puros (entidades, interfaces de repositório)
  application/     casos de uso, DTOs, validação — orquestra o domínio
  infrastructure/  implementações concretas (Prisma, estratégias, fila)
  presentation/    controllers REST/WebSocket, Swagger
  <modulo>.module.ts
```

O **domínio nunca conhece o Prisma**: depende de uma interface (`I*Repository`) e a implementação é injetada via token (Dependency Injection / Repository Pattern). Por isso qualquer módulo pode, no futuro, virar microserviço sem reescrita.

### Decisões-chave já implementadas

| Tema | Decisão |
|------|---------|
| Senhas | Argon2id (não bcrypt) |
| Sessão | JWT de acesso curto (15 min) + refresh token rotativo; persiste-se só o **hash** do refresh |
| MFA | TOTP (otplib), opcional por usuário |
| Autorização | RBAC por papéis **+** permissões individuais; `DENY` individual vence qualquer `GRANT` |
| Permissão | par `(recurso, ação)` — ações: VISUALIZAR, CADASTRAR, EDITAR, EXCLUIR, APROVAR, PUBLICAR, ASSINAR, EXPORTAR, IMPRIMIR, ADMINISTRAR |
| Auditoria | `AuditInterceptor` grava automaticamente toda escrita (usuário, IP, user-agent, antes/depois) |
| Dados | CUID + `createdAt`/`updatedAt`/`deletedAt` (soft delete) em todas as tabelas |
| HTTP | Helmet + CSP, CORS restrito, rate limiting (5 tentativas/min no login) |
| Erros | filtro global padroniza o formato de resposta |
| Listagens | paginação, busca e ordenação padronizadas (`PaginationDto`) |

---

## Roadmap (entrega gradativa)

A plataforma é construída em ondas. **A Etapa 1 está neste repositório.**

- [x] **Etapa 1 — Fundação & Kernel de Identidade**
  Monorepo, infra Docker, schema nuclear, Auth (login/JWT/refresh/MFA),
  RBAC granular, Usuários, auditoria, segurança transversal.

- [x] **Etapa 2 — Frontend base & Design System**
  Next.js + Tailwind + shadcn/ui, tema claro/escuro, login (RHF+Zod) ligado à
  API, shell do app (sidebar por módulo + topbar), command palette (⌘K),
  TanStack Query + Axios. Ver `apps/web/README.md`.

- [x] **Etapa 3 — Administração completa**
  API: usuários (CRUD + papéis), perfis (CRUD + matriz de permissões),
  catálogo de permissões, secretarias e organograma + `GET /auth/me`.
  Front: telas ligadas à API com tabelas paginadas, formulários e RBAC
  no cliente (`pode()` / `<Can>`), sidebar filtrada por permissão.

- [x] **Etapa 4 — Núcleo transversal**
  Anexos (MinIO/S3 + versionamento), notificações em tempo real (WebSocket +
  persistência, sininho na UI), filas (BullMQ), exportação (CSV/XLSX/PDF, com
  geração assíncrona → MinIO → notificação) e motor de workflow configurável
  (tramitação/aprovação por papel, com auditoria e notificação de pendências).

- [ ] **Módulos de negócio** (um por onda, mesma arquitetura)
  - [x] **Compras Públicas** (Etapa 5) — fornecedores, solicitações com
    aprovação, processos de contratação (modalidades da Lei 14.133) e contratos.
  - [x] **Processo Eletrônico** (Etapa 6) — protocolos, tramitação entre setores
    (com notificação ao destino), despachos/pareceres e assinatura eletrônica de base.
  - [ ] RH *(adiado a pedido)*, Finanças, Tributação, Patrimônio, Almoxarifado,
    Frota, Saúde, Educação, Assistência Social, demais secretarias.

- [ ] **Onda final — Portais & integrações**
  Portal da Transparência (API pública), Portal do Cidadão, Diário Oficial,
  Processo Eletrônico; integrações gov.br / PIX / bancos.

Cada etapa segue o mesmo rito: **modelar domínio → schema → migration → backend → frontend → testes → documentação → segurança → integração.**

---

## Estrutura atual de arquivos

> Apenas o kernel da Etapa 1. Os módulos de negócio entram nas próximas ondas.

```
apps/api/src/
  config/configuration.ts
  shared/
    domain/base.entity.ts
    infrastructure/prisma/{prisma.service,prisma.module}.ts
    decorators/{public,permissions,current-user}.decorator.ts
    guards/{jwt-auth,permissions}.guard.ts
    interceptors/audit.interceptor.ts
    filters/http-exception.filter.ts
    dtos/pagination.dto.ts
  modules/
    auth/  (domain · application · infrastructure · presentation)
    users/ (domain · application · infrastructure · presentation)
  app.module.ts
  main.ts
  prisma/{schema.prisma, seed.ts}
```
