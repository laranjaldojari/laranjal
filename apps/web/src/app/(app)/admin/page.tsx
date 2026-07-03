'use client';
import Link from 'next/link';
import { Users, ShieldCheck, KeyRound, Building2, Network, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';

const AREAS = [
  { titulo: 'Usuários', desc: 'Cadastro, papéis e acesso dos servidores', href: '/admin/usuarios', icon: Users, recurso: 'admin.usuarios' },
  { titulo: 'Perfis', desc: 'Papéis e seus conjuntos de permissões', href: '/admin/perfis', icon: ShieldCheck, recurso: 'admin.perfis' },
  { titulo: 'Permissões', desc: 'Catálogo de recursos e ações', href: '/admin/permissoes', icon: KeyRound, recurso: 'admin.permissoes' },
  { titulo: 'Secretarias', desc: 'Estrutura administrativa do município', href: '/admin/secretarias', icon: Building2, recurso: 'admin.secretarias' },
  { titulo: 'Organograma', desc: 'Departamentos e hierarquia', href: '/admin/organograma', icon: Network, recurso: 'admin.secretarias' },
];

export default function AdminHub() {
  const { pode } = useAuth();
  const visiveis = AREAS.filter((a) => pode(a.recurso, 'VISUALIZAR'));
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Administração</h1>
        <p className="mt-1 text-sm text-muted-foreground">Governe a plataforma: pessoas, acesso e estrutura.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {visiveis.map((a) => (
          <Link key={a.href} href={a.href}>
            <Card className="flex items-center gap-4 p-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <a.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{a.titulo}</p>
                <p className="truncate text-sm text-muted-foreground">{a.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
