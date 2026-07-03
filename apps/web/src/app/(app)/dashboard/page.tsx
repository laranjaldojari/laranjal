'use client';
import { Activity, FileStack, Landmark, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const INDICADORES = [
  { label: 'Servidores ativos', valor: '—', icon: Users, dica: 'Conecta ao módulo RH (R5)' },
  { label: 'Processos em trâmite', valor: '—', icon: FileStack, dica: 'Conecta ao Processo Eletrônico (R14)' },
  { label: 'Empenhos no mês', valor: '—', icon: Landmark, dica: 'Conecta ao módulo Finanças (R6)' },
  { label: 'Operações auditadas', valor: '—', icon: Activity, dica: 'Trilha de auditoria (ativa)' },
];

export default function DashboardPage() {
  const { usuario } = useAuth();
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{saudacao}, {usuario?.nome?.split(' ')[0]}.</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visão geral da administração municipal.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {INDICADORES.map((i) => (
          <Card key={i.label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{i.label}</CardTitle>
              <i.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="tabular text-3xl font-semibold">{i.valor}</p>
              <p className="mt-1 text-xs text-muted-foreground">{i.dica}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Próximos passos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          O esqueleto da plataforma está no ar: autenticação, navegação por todos os módulos e
          a base do design system. Os indicadores acima ganham dados reais conforme cada módulo
          é implementado nas próximas releases (RH, Finanças, Tributação…). Use <kbd className="rounded border bg-muted px-1.5 font-mono text-xs">⌘K</kbd> para navegar.
        </CardContent>
      </Card>
    </div>
  );
}
