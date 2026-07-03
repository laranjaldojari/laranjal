'use client';
import { useState } from 'react';
import { Plus, Search, Send, Check, X, Trash2, Loader2, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { useSolicitacoes, useSalvarSolicitacao, useAcaoSolicitacao, useExcluirSolicitacao, moeda, type Solicitacao } from '@/lib/hooks/use-compras';
import { useSecretarias } from '@/lib/hooks/use-organization';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const STATUS: Record<string, { label: string; variant: any }> = {
  RASCUNHO: { label: 'Rascunho', variant: 'muted' },
  EM_APROVACAO: { label: 'Em aprovação', variant: 'warning' },
  APROVADA: { label: 'Aprovada', variant: 'success' },
  REPROVADA: { label: 'Reprovada', variant: 'destructive' },
  CONVERTIDA: { label: 'Convertida', variant: 'secondary' },
};

export default function SolicitacoesPage() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const { data, isLoading } = useSolicitacoes(page, busca);
  const [criando, setCriando] = useState(false);
  const acao = useAcaoSolicitacao();
  const excluir = useExcluirSolicitacao();

  async function executar(id: string, tipo: 'enviar' | 'aprovar' | 'reprovar') {
    try { await acao.mutateAsync({ id, acao: tipo }); toast.success('Solicitação atualizada.'); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Ação não permitida.'); }
  }
  async function remover(s: Solicitacao) {
    if (!confirm(`Excluir a solicitação ${s.numero}?`)) return;
    try { await excluir.mutateAsync(s.id); toast.success('Excluída.'); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível excluir.'); }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Solicitações de compra</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pedidos das secretarias e seu fluxo de aprovação.</p>
        </div>
        <Can recurso="compras.solicitacoes" acao="CADASTRAR">
          <Button onClick={() => setCriando(true)}><Plus /> Nova solicitação</Button>
        </Can>
      </header>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por objeto ou número" value={busca} onChange={(e) => { setBusca(e.target.value); setPage(1); }} />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead><TableHead>Objeto</TableHead>
              <TableHead>Valor est.</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
            ))}
            {data?.itens.map((s) => {
              const st = STATUS[s.status] ?? { label: s.status, variant: 'muted' };
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm tabular">{s.numero}</TableCell>
                  <TableCell className="max-w-xs"><span className="line-clamp-1">{s.objeto}</span></TableCell>
                  <TableCell className="tabular text-sm">{moeda(s.valorEstimado)}</TableCell>
                  <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {s.status === 'RASCUNHO' && (
                        <Can recurso="compras.solicitacoes" acao="EDITAR">
                          <Button variant="ghost" size="icon" title="Enviar para aprovação" onClick={() => executar(s.id, 'enviar')}><Send /></Button>
                        </Can>
                      )}
                      {s.status === 'EM_APROVACAO' && (
                        <Can recurso="compras.solicitacoes" acao="APROVAR">
                          <Button variant="ghost" size="icon" title="Aprovar" onClick={() => executar(s.id, 'aprovar')}><Check className="text-success" /></Button>
                          <Button variant="ghost" size="icon" title="Reprovar" onClick={() => executar(s.id, 'reprovar')}><X className="text-destructive" /></Button>
                        </Can>
                      )}
                      <Can recurso="compras.solicitacoes" acao="EXCLUIR">
                        <Button variant="ghost" size="icon" title="Excluir" onClick={() => remover(s)}><Trash2 /></Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {data && data.itens.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Nenhuma solicitação.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.meta.totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{data.meta.total} solicitações</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <span className="flex items-center px-2 text-muted-foreground">{page} / {data.meta.totalPaginas}</span>
            <Button variant="outline" size="sm" disabled={page >= data.meta.totalPaginas} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
          </div>
        </div>
      )}

      {criando && <SolicitacaoDialog onClose={() => setCriando(false)} />}
    </div>
  );
}

function SolicitacaoDialog({ onClose }: { onClose: () => void }) {
  const salvar = useSalvarSolicitacao();
  const { data: secretarias } = useSecretarias();
  const [cab, setCab] = useState({ objeto: '', justificativa: '', secretariaId: '' });
  const [itens, setItens] = useState([{ descricao: '', unidade: 'UN', quantidade: 1, valorUnitario: 0 }]);

  const setItem = (i: number, campo: string, valor: any) => setItens((arr) => arr.map((it, idx) => idx === i ? { ...it, [campo]: valor } : it));
  const addItem = () => setItens((arr) => [...arr, { descricao: '', unidade: 'UN', quantidade: 1, valorUnitario: 0 }]);
  const delItem = (i: number) => setItens((arr) => arr.filter((_, idx) => idx !== i));

  async function submeter() {
    if (!cab.secretariaId) return toast.error('Selecione a secretaria.');
    try {
      await salvar.mutateAsync({ ...cab, itens: itens.map((i) => ({ ...i, quantidade: Number(i.quantidade), valorUnitario: Number(i.valorUnitario) })) });
      toast.success('Solicitação criada em rascunho.');
      onClose();
    } catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível salvar.'); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Nova solicitação de compra</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Objeto</Label><Input value={cab.objeto} onChange={(e) => setCab({ ...cab, objeto: e.target.value })} /></div>
          <div className="space-y-1.5">
            <Label>Secretaria</Label>
            <Select value={cab.secretariaId} onChange={(e) => setCab({ ...cab, secretariaId: e.target.value })}>
              <option value="">Selecione…</option>
              {secretarias?.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Justificativa</Label><Input value={cab.justificativa} onChange={(e) => setCab({ ...cab, justificativa: e.target.value })} /></div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label>Itens</Label>
              <Button variant="outline" size="sm" onClick={addItem}><Plus /> Item</Button>
            </div>
            <div className="space-y-2">
              {itens.map((it, i) => (
                <div key={i} className="flex gap-2">
                  <Input className="flex-1" placeholder="Descrição" value={it.descricao} onChange={(e) => setItem(i, 'descricao', e.target.value)} />
                  <Input className="w-16" placeholder="Un" value={it.unidade} onChange={(e) => setItem(i, 'unidade', e.target.value)} />
                  <Input className="w-20" type="number" placeholder="Qtd" value={it.quantidade} onChange={(e) => setItem(i, 'quantidade', e.target.value)} />
                  <Input className="w-28" type="number" placeholder="Vlr unit." value={it.valorUnitario} onChange={(e) => setItem(i, 'valorUnitario', e.target.value)} />
                  <Button variant="ghost" size="icon" onClick={() => delItem(i)} disabled={itens.length === 1}><Minus /></Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submeter} disabled={salvar.isPending}>{salvar.isPending && <Loader2 className="animate-spin" />} Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
