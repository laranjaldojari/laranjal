'use client';
import { useCatalogoPermissoes } from '@/lib/hooks/use-rbac';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PermissoesPage() {
  const { data, isLoading } = useCatalogoPermissoes();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Permissões</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Catálogo de recursos e ações. Cada tela expõe suas próprias permissões; os perfis as combinam.
        </p>
      </header>
      <div className="space-y-2">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        {data && Object.entries(data.porRecurso).map(([recurso, acoes]) => (
          <Card key={recurso} className="p-4">
            <p className="mb-2 font-mono text-sm font-medium">{recurso}</p>
            <div className="flex flex-wrap gap-1.5">
              {acoes.map((a) => <Badge key={a.id} variant="secondary">{a.acao}</Badge>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
