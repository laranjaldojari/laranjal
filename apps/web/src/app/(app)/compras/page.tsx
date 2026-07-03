'use client';
import Link from 'next/link';
import { Building2, FileText, Gavel, FileSignature, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';

const AREAS = [
  { titulo: 'Fornecedores', desc: 'Cadastro e regularidade', href: '/compras/fornecedores', icon: Building2, recurso: 'compras.fornecedores' },
  { titulo: 'Solicitações', desc: 'Pedidos de compra e aprovação', href: '/compras/solicitacoes', icon: FileText, recurso: 'compras.solicitacoes' },
  { titulo: 'Processos', desc: 'Licitações, dispensas e inexigibilidades', href: '/compras/processos', icon: Gavel, recurso: 'compras.processos' },
  { titulo: 'Contratos', desc: 'Vigência, valores e aditivos', href: '/compras/contratos', icon: FileSignature, recurso: 'compras.contratos' },
];

export default function ComprasHub() {
  const { pode } = useAuth();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Compras Públicas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Contratações sob a Lei 14.133/2021 — do pedido ao contrato.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {AREAS.filter((a) => pode(a.recurso, 'VISUALIZAR')).map((a) => (
          <Link key={a.href} href={a.href}>
            <Card className="flex items-center gap-4 p-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><a.icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1"><p className="font-medium">{a.titulo}</p><p className="truncate text-sm text-muted-foreground">{a.desc}</p></div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
