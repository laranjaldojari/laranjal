'use client';
import { Bell, LogOut, CheckCheck } from 'lucide-react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useAuth } from '@/lib/auth';
import { iniciais } from '@/lib/utils';
import { useNotificacoes, useContadorNaoLidas, useMarcarLidas } from '@/lib/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { CommandPalette } from './command-palette';

export function AppTopbar() {
  const { usuario, sair } = useAuth();
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 md:px-6">
      <div className="flex-1"><CommandPalette /></div>

      <NotificacoesMenu />
      <ThemeToggle />

      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <button className="flex items-center gap-2 rounded-full pl-1 pr-2 outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Menu do usuário">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {usuario ? iniciais(usuario.nome) : '–'}
            </span>
          </button>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content align="end" sideOffset={8} className="z-50 min-w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-lg animate-fade-in">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{usuario?.nome}</p>
              <p className="truncate text-xs text-muted-foreground">{usuario?.email}</p>
            </div>
            <Dropdown.Separator className="my-1 h-px bg-border" />
            <Dropdown.Item onSelect={sair} className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent">
              <LogOut className="h-4 w-4" /> Sair
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
    </header>
  );
}

function NotificacoesMenu() {
  const { data: notificacoes } = useNotificacoes();
  const { data: naoLidas = 0 } = useContadorNaoLidas();
  const marcar = useMarcarLidas();

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button className="relative rounded-md p-2 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Notificações (${naoLidas} não lidas)`}>
          <Bell className="h-4 w-4" />
          {naoLidas > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {naoLidas > 9 ? '9+' : naoLidas}
            </span>
          )}
        </button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content align="end" sideOffset={8} className="z-50 w-80 rounded-md border bg-popover p-0 text-popover-foreground shadow-lg animate-fade-in">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-medium">Notificações</span>
            {naoLidas > 0 && (
              <button onClick={() => marcar.mutate(undefined)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <CheckCheck className="h-3.5 w-3.5" /> Marcar todas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {(!notificacoes || notificacoes.length === 0) && (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nenhuma notificação.</p>
            )}
            {notificacoes?.map((n) => (
              <a
                key={n.id}
                href={n.link ?? '#'}
                onClick={() => !n.lidaEm && marcar.mutate(n.id)}
                className={`block border-b px-3 py-2.5 text-sm transition-colors last:border-0 hover:bg-accent ${n.lidaEm ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-2">
                  {!n.lidaEm && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                  <div className={n.lidaEm ? 'pl-3.5' : ''}>
                    <p className="font-medium">{n.titulo}</p>
                    <p className="text-xs text-muted-foreground">{n.mensagem}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
