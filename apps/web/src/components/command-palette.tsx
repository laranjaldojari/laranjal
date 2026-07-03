'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { MODULOS, GRUPOS } from '@/lib/modules';

/**
 * Pesquisa global e navegação por teclado (assinatura da interface).
 * Abre com Ctrl/Cmd-K e leva a qualquer módulo. Atende RFT-5 e o requisito
 * de "atalhos de teclado" da especificação.
 */
export function CommandPalette() {
  const [aberto, setAberto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setAberto((v) => !v); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function ir(href: string) { setAberto(false); router.push(href); }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Buscar módulos, telas…</span>
        <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-xs sm:inline">⌘K</kbd>
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[15vh]" onClick={() => setAberto(false)}>
          <Command
            className="w-full max-w-lg overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            loop
          >
            <div className="flex items-center gap-2 border-b px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Command.Input autoFocus placeholder="O que você procura?" className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">Nada encontrado.</Command.Empty>
              {GRUPOS.map((grupo) => (
                <Command.Group key={grupo} heading={grupo} className="px-1 py-1 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                  {MODULOS.filter((m) => m.grupo === grupo).map((m) => (
                    <Command.Item
                      key={m.href}
                      value={m.titulo}
                      onSelect={() => ir(m.href)}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                      <m.icon className="h-4 w-4" />
                      {m.titulo}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </div>
      )}
    </>
  );
}
