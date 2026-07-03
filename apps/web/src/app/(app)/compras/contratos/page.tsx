'use client';
import { useState } from 'react';
import { Plus, Search, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useContratos, useSalvarContrato, useExcluirContrato, useFornecedores, moeda, type Contrato } from '@/lib/hooks/use-compras';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const SIT: Record<string, any> = { VIGENTE: 'success', ENCERRADO: 'muted', RESCINDIDO: 'destructive', SUSPENSO: 'warning' };
const dataBR = (d: string) => new Date(d).toLocaleDateString('pt-BR');

export default function ContratosPage() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const { data, isLoading } = useContratos(page, busca);
  const [criando, setCriando] = useState(false);
  const excluir = useExcluirContrato();

  async function remover(c: Contrato) {
    if (!confirm(`Excluir o contrato ${c.numero}?`)) return;
    try { await excluir.mutateAsync(c.id); toast.success('Excluído.'); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível excluir.'); }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contratos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Vigência, valores e situação dos contratos firmados.</p>
        </div>
        <Can recurso="compras.contratos" acao="CADASTRAR"><Button onClick={() => setCriando(true)}><Plus /> Novo contrato</Button></Can>
      </header>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por objeto ou número" value={busca} onChange={(e) => { setBusca(e.target.value); setPage(1); }} />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead><TableHead>Objeto</TableHead><TableHead>Fornecedor</TableHead>
              <TableHead>Valor</TableHead><TableHead>Vigência</TableHead><TableHead>Situação</TableHead><TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
            ))}
            {data?.itens.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-sm tabular">{c.numero}</TableCell>
                <TableCell className="max-w-[16rem]"><span className="line-clamp-1">{c.objeto}</span></TableCell>
                <TableCell className="text-sm">{c.fornecedor?.razaoSocial ?? '—'}</TableCell>
                <TableCell className="tabular text-sm">{moeda(c.valor)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{dataBR(c.dataInicio)} – {dataBR(c.dataFim)}</TableCell>
                <TableCell><Badge variant={SIT[c.situacao] ?? 'muted'}>{c.situacao.charAt(0) + c.situacao.slice(1).toLowerCase()}</Badge></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Can recurso="compras.contratos" acao="EXCLUIR"><Button variant="ghost" size="icon" onClick={() => remover(c)}><Trash2 /></Button></Can>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data && data.itens.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">Nenhum contrato.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.meta.totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{data.meta.total} contratos</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <span className="flex items-center px-2 text-muted-foreground">{page} / {data.meta.totalPaginas}</span>
            <Button variant="outline" size="sm" disabled={page >= data.meta.totalPaginas} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
          </div>
        </div>
      )}

      {criando && <ContratoDialog onClose={() => setCriando(false)} />}
    </div>
  );
}

function ContratoDialog({ onClose }: { onClose: () => void }) {
  const salvar = useSalvarContrato();
  const { data: fornecedores } = useFornecedores(1, '');
  const [f, setF] = useState({ objeto: '', fornecedorId: '', valor: 0, dataInicio: '', dataFim: '' });
  async function submeter() {
    if (!f.fornecedorId) return toast.error('Selecione o fornecedor.');
    try { await salvar.mutateAsync({ ...f, valor: Number(f.valor) }); toast.success('Contrato criado.'); onClose(); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível salvar.'); }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo contrato</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Objeto</Label><Input value={f.objeto} onChange={(e) => setF({ ...f, objeto: e.target.value })} /></div>
          <div className="space-y-1.5">
            <Label>Fornecedor</Label>
            <Select value={f.fornecedorId} onChange={(e) => setF({ ...f, fornecedorId: e.target.value })}>
              <option value="">Selecione…</option>
              {fornecedores?.itens.map((fo) => <option key={fo.id} value={fo.id}>{fo.razaoSocial}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label>Valor</Label><Input type="number" value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value as any })} /></div>
            <div className="space-y-1.5"><Label>Início</Label><Input type="date" value={f.dataInicio} onChange={(e) => setF({ ...f, dataInicio: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Término</Label><Input type="date" value={f.dataFim} onChange={(e) => setF({ ...f, dataFim: e.target.value })} /></div>
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
