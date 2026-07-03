'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Landmark } from 'lucide-react';
import { MODULOS, GRUPOS } from '@/lib/modules';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();
  const { pode } = useAuth();
  // Mostra o Painel sempre; demais módulos só se o usuário puder visualizar.
  const visiveis = MODULOS.filter((m) => m.recurso === 'dashboard' || pode(m.recurso, 'VISUALIZAR'));
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      {/* Identidade */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Landmark className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Laranjal do Jari</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Plataforma Municipal</p>
        </div>
      </div>

      {/* Navegação agrupada */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Módulos">
        {GRUPOS.map((grupo) => {
          const itens = visiveis.filter((m) => m.grupo === grupo);
          if (itens.length === 0) return null;
          return (
          <div key={grupo} className="mb-5">
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">{grupo}</p>
            <ul className="space-y-0.5">
              {itens.map((m) => {
                const ativo = pathname === m.href || pathname.startsWith(m.href + '/');
                return (
                  <li key={m.href}>
                    <Link
                      href={m.href}
                      aria-current={ativo ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                        ativo
                          ? 'bg-primary/15 font-medium text-white'
                          : 'text-sidebar-foreground/75 hover:bg-white/5 hover:text-white',
                      )}
                    >
                      <m.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{m.titulo}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          );
        })}
      </nav>
    </aside>
  );
}
