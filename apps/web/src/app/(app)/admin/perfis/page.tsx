'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, SlidersHorizontal, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { usePapeis, useCatalogoPermissoes, useSalvarPapel, useDefinirPermissoes, useExcluirPapel } from '@/lib/hooks/use-rbac';
import type { Role } from '@/lib/hooks/types';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function PerfisPage() {
  const { data: papeis, isLoading } = usePapeis();
  const [editando, setEditando] = useState<Role | null | undefined>(undefined);
  const [permsDe, setPermsDe] = useState<Role | null>(null);
  const excluir = useExcluirPapel();

  async function confirmarExclusao(r: Role) {
    if (!confirm(`Excluir o papel ${r.nome}?`)) return;
    try { await excluir.mutateAsync(r.id); toast.success('Papel excluído.'); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível excluir.'); }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Perfis</h1>
          <p className="mt-1 text-sm text-muted-foreground">Papéis e os conjuntos de permissões que eles concedem.</p>
        </div>
        <Can recurso="admin.perfis" acao="CADASTRAR">
          <Button onClick={() => setEditando(null)}><Plus /> Novo perfil</Button>
        </Can>
      </header>

      <div className="space-y-2">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        {papeis?.map((r) => (
          <Card key={r.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{r.nome}</p>
                {r.sistema && <Badge variant="muted"><Lock className="mr-1 h-3 w-3" /> sistema</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{r.descricao ?? 'Sem descrição'}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{r.permissoes.length} permissões</span>
              <span>{r.qtdUsuarios} usuários</span>
            </div>
            <div className="flex gap-1">
              <Can recurso="admin.perfis" acao="ADMINISTRAR">
                <Button variant="outline" size="sm" onClick={() => setPermsDe(r)}><SlidersHorizontal /> Permissões</Button>
              </Can>
              <Can recurso="admin.perfis" acao="EDITAR">
                <Button variant="ghost" size="icon" onClick={() => setEditando(r)}><Pencil /></Button>
              </Can>
              {!r.sistema && (
                <Can recurso="admin.perfis" acao="EXCLUIR">
                  <Button variant="ghost" size="icon" onClick={() => confirmarExclusao(r)}><Trash2 /></Button>
                </Can>
              )}
            </div>
          </Card>
        ))}
      </div>

      {editando !== undefined && <PapelDialog papel={editando} onClose={() => setEditando(undefined)} />}
      {permsDe && <PermissoesDialog papel={permsDe} onClose={() => setPermsDe(null)} />}
    </div>
  );
}

function PapelDialog({ papel, onClose }: { papel: Role | null; onClose: () => void }) {
  const salvar = useSalvarPapel();
  const [form, setForm] = useState({ nome: papel?.nome ?? '', descricao: papel?.descricao ?? '' });
  async function submeter() {
    try { await salvar.mutateAsync({ id: papel?.id, ...form }); toast.success('Perfil salvo.'); onClose(); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível salvar.'); }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{papel ? 'Editar perfil' : 'Novo perfil'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Descrição</Label><Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submeter} disabled={salvar.isPending}>{salvar.isPending && <Loader2 className="animate-spin" />} Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissoesDialog({ papel, onClose }: { papel: Role; onClose: () => void }) {
  const { data: catalogo } = useCatalogoPermissoes();
  const definir = useDefinirPermissoes();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [pronto, setPronto] = useState(false);

  // Pré-marca as permissões atuais do papel assim que o catálogo carrega.
  useEffect(() => {
    if (!catalogo || pronto) return;
    const atuais = catalogo.itens.filter((p) => papel.permissoes.includes(`${p.recurso}:${p.acao}`)).map((p) => p.id);
    setSel(new Set(atuais));
    setPronto(true);
  }, [catalogo, pronto, papel.permissoes]);

  function alternar(id: string) {
    setSel((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  async function salvar() {
    try { await definir.mutateAsync({ id: papel.id, permissionIds: [...sel] }); toast.success('Permissões atualizadas.'); onClose(); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível salvar.'); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Permissões — {papel.nome}</DialogTitle>
          <DialogDescription>Marque as ações permitidas para cada recurso.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {catalogo && Object.entries(catalogo.porRecurso).map(([recurso, acoes]) => (
            <div key={recurso}>
              <p className="mb-1.5 font-mono text-xs font-medium text-muted-foreground">{recurso}</p>
              <div className="flex flex-wrap gap-1.5">
                {acoes.map((a) => {
                  const marcado = sel.has(a.id);
                  return (
                    <button key={a.id} onClick={() => alternar(a.id)}
                      className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${marcado ? 'border-primary bg-primary/12 text-primary' : 'border-input text-muted-foreground hover:bg-accent'}`}>
                      {a.acao}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} disabled={definir.isPending}>{definir.isPending && <Loader2 className="animate-spin" />} Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
