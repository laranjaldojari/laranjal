'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProcessos, useAbrirProcesso, useDepartamentos, STATUS_PROC, type Processo } from '@/lib/hooks/use-processos';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';


export default function ProcessosPage() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const { data, isLoading } = useProcessos(page, busca);
  const [criando, setCriando] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Processo Eletrônico</h1>
          <p className="mt-1 text-sm text-muted-foreground">Protocolos e sua tramitação entre setores.</p>
        </div>
        <Can recurso="processos.protocolos" acao="CADASTRAR">
          <Button onClick={() => setCriando(true)}><Plus /> Abrir processo</Button>
        </Can>
      </header>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por assunto, número ou interessado" value={busca} onChange={(e) => { setBusca(e.target.value); setPage(1); }} />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocolo</TableHead><TableHead>Assunto</TableHead>
              <TableHead>Interessado</TableHead><TableHead>Setor atual</TableHead><TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
            ))}
            {data?.itens.map((p) => {
              const st = STATUS_PROC[p.status] ?? { label: p.status, variant: 'muted' };
              return (
                <TableRow key={p.id} className="cursor-pointer">
                  <TableCell className="font-mono text-sm tabular"><Link href={`/processos/${p.id}`} className="hover:underline">{p.numero}</Link></TableCell>
                  <TableCell className="max-w-xs"><Link href={`/processos/${p.id}`} className="line-clamp-1 hover:underline">{p.assunto}</Link></TableCell>
                  <TableCell className="text-sm">{p.interessado}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.setorAtual?.nome ?? '—'}</TableCell>
                  <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                </TableRow>
              );
            })}
            {data && data.itens.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Nenhum processo.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.meta.totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{data.meta.total} processos</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <span className="flex items-center px-2 text-muted-foreground">{page} / {data.meta.totalPaginas}</span>
            <Button variant="outline" size="sm" disabled={page >= data.meta.totalPaginas} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
          </div>
        </div>
      )}

      {criando && <AbrirDialog onClose={() => setCriando(false)} />}
    </div>
  );
}

function AbrirDialog({ onClose }: { onClose: () => void }) {
  const abrir = useAbrirProcesso();
  const { data: setores } = useDepartamentos();
  const [f, setF] = useState({ assunto: '', tipo: 'Requerimento', interessado: '', descricao: '', setorAtualId: '' });
  async function submeter() {
    try { await abrir.mutateAsync({ ...f, setorAtualId: f.setorAtualId || undefined }); toast.success('Processo aberto.'); onClose(); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível abrir.'); }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Abrir processo</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Assunto</Label><Input value={f.assunto} onChange={(e) => setF({ ...f, assunto: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Tipo</Label><Input value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Interessado</Label><Input value={f.interessado} onChange={(e) => setF({ ...f, interessado: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5"><Label>Descrição</Label><Input value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} /></div>
          <div className="space-y-1.5">
            <Label>Setor inicial</Label>
            <Select value={f.setorAtualId} onChange={(e) => setF({ ...f, setorAtualId: e.target.value })}>
              <option value="">— Definir depois —</option>
              {setores?.map((s) => <option key={s.id} value={s.id}>{s.secretariaSigla} · {s.nome}</option>)}
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submeter} disabled={abrir.isPending}>{abrir.isPending && <Loader2 className="animate-spin" />} Abrir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
