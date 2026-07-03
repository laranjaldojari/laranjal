# Frontend — Plataforma Municipal de Laranjal do Jari

Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + TanStack Query.

## Rodar
```bash
pnpm --filter @ljari/web dev   # http://localhost:3333
```
Requer a API rodando em `http://localhost:3000` (ajuste `API_URL` se necessário).

## Identidade visual
- Verde institucional `#16734A`; tema claro e escuro.
- Tipografia: IBM Plex Sans (UI) + IBM Plex Mono (códigos/valores).
- Assinatura: command palette (⌘K) para pesquisa global e navegação.

## Estrutura
```
src/
  app/
    (auth)/login/      tela de login (RHF + Zod)
    (app)/             área autenticada (guarda de rota)
      layout.tsx       shell: sidebar + topbar
      dashboard/       painel inicial
    layout.tsx         fontes + providers
    globals.css        tokens de design (claro/escuro)
  components/
    ui/                primitivos (button, input, label, card)
    app-sidebar, app-topbar, command-palette, theme-toggle, providers
  lib/
    api.ts             axios + interceptors (Bearer, 401)
    auth.tsx           contexto de sessão
    token-store.ts     ponto único de armazenamento de token
    modules.ts         catálogo de módulos da navegação
    validations/       schemas Zod
```

## Segurança (notas)
Os tokens são persistidos em `localStorage` nesta base para que a sessão
sobreviva ao reload. Em produção, migrar para **cookies httpOnly + refresh
rotativo** (RNF-SEG-3) — alteração isolada em `token-store.ts`.
