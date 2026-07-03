'use client';
import { useEffect, useState } from 'react';
import { Plus, CornerDownRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSecretarias, useOrganograma, useSalvarDepartamento } from '@/lib/hooks/use-organization';
import type { DepartamentoNo } from '@/lib/hooks/types';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function OrganogramaPage() {
  const { data: secretarias } = useSecretarias();
  const [secretariaId, setSecretariaId] = useState('');
  const { data: arvore, isLoading } = useOrganograma(secretariaId);
  const [novoEm, setNovoEm] = useState<{ paiId?: string } | null>(null);

  useEffect(() => {
    if (!secretariaId && secretarias?.length) setSecretariaId(secretarias[0].id);
  }, [secretarias, secretariaId]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organograma</h1>
          <p className="mt-1 text-sm text-muted-foreground">Hierarquia de departamentos por secretaria.</p>
        </div>
        <Can recurso="admin.secretarias" acao="CADASTRAR">
          <Button onClick={() => setNovoEm({})} disabled={!secretariaId}><Plus /> Departamento</Button>
        </Can>
      </header>

      <div className="max-w-sm space-y-1.5">
        <Label>Secretaria</Label>
        <Select value={secretariaId} onChange={(e) => setSecretariaId(e.target.value)}>
          <option value="">Selecione…</option>
          {secretarias?.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </Select>
      </div>

      <Card className="p-4">
        {isLoading && <Skeleton className="h-24 w-full" />}
        {arvore && arvore.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum departamento nesta secretaria ainda.</p>
        )}
        {arvore && <NoLista nos={arvore} nivel={0} onAdd={(paiId) => setNovoEm({ paiId })} />}
      </Card>

      {novoEm && secretariaId && (
        <DepartamentoDialog secretariaId={secretariaId} paiId={novoEm.paiId} onClose={() => setNovoEm(null)} />
      )}
    </div>
  );
}

function NoLista({ nos, nivel, onAdd }: { nos: DepartamentoNo[]; nivel: number; onAdd: (paiId: string) => void }) {
  return (
    <ul className={nivel > 0 ? 'ml-5 border-l pl-3' : ''}>
      {nos.map((no) => (
        <li key={no.id} className="py-1">
          <div className="group flex items-center gap-2">
            {nivel > 0 && <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground" />}
            <span className="text-sm">{no.nome}</span>
            <Can recurso="admin.secretarias" acao="CADASTRAR">
              <button onClick={() => onAdd(no.id)} className="text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100" title="Adicionar subordinado">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </Can>
          </div>
          {no.filhos.length > 0 && <NoLista nos={no.filhos} nivel={nivel + 1} onAdd={onAdd} />}
        </li>
      ))}
    </ul>
  );
}

function DepartamentoDialog({ secretariaId, paiId, onClose }: { secretariaId: string; paiId?: string; onClose: () => void }) {
  const salvar = useSalvarDepartamento();
  const [nome, setNome] = useState('');
  async function submeter() {
    try { await salvar.mutateAsync({ nome, secretariaId, paiId }); toast.success('Departamento criado.'); onClose(); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível salvar.'); }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{paiId ? 'Novo departamento subordinado' : 'Novo departamento'}</DialogTitle></DialogHeader>
        <div className="space-y-1.5"><Label>Nome</Label><Input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} /></div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submeter} disabled={salvar.isPending || !nome}>{salvar.isPending && <Loader2 className="animate-spin" />} Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
