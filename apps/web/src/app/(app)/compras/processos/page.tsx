'use client';
import { useState } from 'react';
import { Plus, Search, Gavel, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProcessos, useSalvarProcesso, useExcluirProcesso, useFornecedores, moeda, type Processo } from '@/lib/hooks/use-compras';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const MODALIDADES = ['PREGAO', 'CONCORRENCIA', 'CONCURSO', 'LEILAO', 'DIALOGO_COMPETITIVO', 'DISPENSA', 'INEXIGIBILIDADE'];
const rotulo = (m: string) => m.charAt(0) + m.slice(1).toLowerCase().replace(/_/g, ' ');
const STATUS: Record<string, any> = { ABERTO: 'default', EM_ANDAMENTO: 'warning', HOMOLOGADO: 'success', FRACASSADO: 'destructive', DESERTO: 'muted', REVOGADO: 'muted', ANULADO: 'destructive' };

export default function ProcessosPage() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const { data, isLoading } = useProcessos(page, busca);
  const [criando, setCriando] = useState(false);
  const [homologando, setHomologando] = useState<Processo | null>(null);
  const excluir = useExcluirProcesso();

  async function remover(p: Processo) {
    if (!confirm(`Excluir o processo ${p.numero}?`)) return;
    try { await excluir.mutateAsync(p.id); toast.success('Excluído.'); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível excluir.'); }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Processos de contratação</h1>
          <p className="mt-1 text-sm text-muted-foreground">Licitações, dispensas e inexigibilidades (Lei 14.133/2021).</p>
        </div>
        <Can recurso="compras.processos" acao="CADASTRAR"><Button onClick={() => setCriando(true)}><Plus /> Novo processo</Button></Can>
      </header>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por objeto ou número" value={busca} onChange={(e) => { setBusca(e.target.value); setPage(1); }} />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead><TableHead>Objeto</TableHead><TableHead>Modalidade</TableHead>
              <TableHead>Status</TableHead><TableHead>Valor</TableHead><TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
            ))}
            {data?.itens.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-sm tabular">{p.numero}</TableCell>
                <TableCell className="max-w-xs"><span className="line-clamp-1">{p.objeto}</span></TableCell>
                <TableCell><Badge variant="secondary">{rotulo(p.modalidade)}</Badge></TableCell>
                <TableCell><Badge variant={STATUS[p.status] ?? 'muted'}>{rotulo(p.status)}</Badge></TableCell>
                <TableCell className="tabular text-sm">{moeda(p.valorHomologado ?? p.valorEstimado)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {p.status !== 'HOMOLOGADO' && (
                      <Can recurso="compras.processos" acao="APROVAR"><Button variant="ghost" size="icon" title="Homologar" onClick={() => setHomologando(p)}><Gavel /></Button></Can>
                    )}
                    <Can recurso="compras.processos" acao="EXCLUIR"><Button variant="ghost" size="icon" onClick={() => remover(p)}><Trash2 /></Button></Can>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data && data.itens.length === 0 && (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">Nenhum processo.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {criando && <ProcessoDialog onClose={() => setCriando(false)} />}
      {homologando && <HomologarDialog processo={homologando} onClose={() => setHomologando(null)} />}
    </div>
  );
}

function ProcessoDialog({ onClose }: { onClose: () => void }) {
  const salvar = useSalvarProcesso();
  const [f, setF] = useState({ objeto: '', modalidade: 'PREGAO', valorEstimado: 0 });
  async function submeter() {
    try { await salvar.mutateAsync({ ...f, valorEstimado: Number(f.valorEstimado) || undefined }); toast.success('Processo criado.'); onClose(); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível salvar.'); }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo processo</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Objeto</Label><Input value={f.objeto} onChange={(e) => setF({ ...f, objeto: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Modalidade</Label><Select value={f.modalidade} onChange={(e) => setF({ ...f, modalidade: e.target.value })}>{MODALIDADES.map((m) => <option key={m} value={m}>{rotulo(m)}</option>)}</Select></div>
            <div className="space-y-1.5"><Label>Valor estimado</Label><Input type="number" value={f.valorEstimado} onChange={(e) => setF({ ...f, valorEstimado: e.target.value as any })} /></div>
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

function HomologarDialog({ processo, onClose }: { processo: Processo; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: fornecedores } = useFornecedores(1, '');
  const [f, setF] = useState({ fornecedorVencedorId: '', valorHomologado: Number(processo.valorEstimado ?? 0) });
  const [salvando, setSalvando] = useState(false);
  async function submeter() {
    if (!f.fornecedorVencedorId) return toast.error('Selecione o fornecedor vencedor.');
    setSalvando(true);
    try {
      await api.post(`/processos-contratacao/${processo.id}/homologar`, { fornecedorVencedorId: f.fornecedorVencedorId, valorHomologado: Number(f.valorHomologado) });
      await qc.invalidateQueries({ queryKey: ['processos'] });
      toast.success('Processo homologado.'); onClose();
    } catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível homologar.'); }
    finally { setSalvando(false); }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Homologar {processo.numero}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Fornecedor vencedor</Label>
            <Select value={f.fornecedorVencedorId} onChange={(e) => setF({ ...f, fornecedorVencedorId: e.target.value })}>
              <option value="">Selecione…</option>
              {fornecedores?.itens.map((fo) => <option key={fo.id} value={fo.id}>{fo.razaoSocial}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Valor homologado</Label><Input type="number" value={f.valorHomologado} onChange={(e) => setF({ ...f, valorHomologado: e.target.value as any })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submeter} disabled={salvando}>{salvando && <Loader2 className="animate-spin" />} Homologar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
