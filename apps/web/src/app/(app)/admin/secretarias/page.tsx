'use client';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSecretarias, useSalvarSecretaria, useExcluirSecretaria } from '@/lib/hooks/use-organization';
import type { Secretaria } from '@/lib/hooks/types';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function SecretariasPage() {
  const { data, isLoading } = useSecretarias();
  const [editando, setEditando] = useState<Secretaria | null | undefined>(undefined);
  const excluir = useExcluirSecretaria();

  async function confirmarExclusao(s: Secretaria) {
    if (!confirm(`Excluir a secretaria ${s.nome}?`)) return;
    try { await excluir.mutateAsync(s.id); toast.success('Secretaria excluída.'); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível excluir.'); }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Secretarias</h1>
          <p className="mt-1 text-sm text-muted-foreground">Estrutura administrativa do município.</p>
        </div>
        <Can recurso="admin.secretarias" acao="CADASTRAR">
          <Button onClick={() => setEditando(null)}><Plus /> Nova secretaria</Button>
        </Can>
      </header>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sigla</TableHead><TableHead>Nome</TableHead>
              <TableHead>Responsável</TableHead><TableHead>Estrutura</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
            ))}
            {data?.map((s) => (
              <TableRow key={s.id}>
                <TableCell><Badge variant="secondary">{s.sigla}</Badge></TableCell>
                <TableCell className="font-medium">{s.nome}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.responsavel ?? '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.qtdDepartamentos} deptos · {s.qtdUsuarios} usuários</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Can recurso="admin.secretarias" acao="EDITAR">
                      <Button variant="ghost" size="icon" onClick={() => setEditando(s)}><Pencil /></Button>
                    </Can>
                    <Can recurso="admin.secretarias" acao="EXCLUIR">
                      <Button variant="ghost" size="icon" onClick={() => confirmarExclusao(s)}><Trash2 /></Button>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data && data.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Nenhuma secretaria cadastrada.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editando !== undefined && <SecretariaDialog secretaria={editando} onClose={() => setEditando(undefined)} />}
    </div>
  );
}

function SecretariaDialog({ secretaria, onClose }: { secretaria: Secretaria | null; onClose: () => void }) {
  const salvar = useSalvarSecretaria();
  const [form, setForm] = useState({ nome: secretaria?.nome ?? '', sigla: secretaria?.sigla ?? '', responsavel: secretaria?.responsavel ?? '' });
  async function submeter() {
    try { await salvar.mutateAsync({ id: secretaria?.id, ...form }); toast.success('Secretaria salva.'); onClose(); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível salvar.'); }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{secretaria ? 'Editar secretaria' : 'Nova secretaria'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5"><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Sigla</Label><Input value={form.sigla} className="uppercase" onChange={(e) => setForm({ ...form, sigla: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5"><Label>Responsável</Label><Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submeter} disabled={salvar.isPending}>{salvar.isPending && <Loader2 className="animate-spin" />} Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
