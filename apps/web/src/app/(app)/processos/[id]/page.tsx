'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send, FileSignature, PenLine, CheckCircle2, Archive, Loader2, CornerDownRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  useProcesso, useTramitar, useAdicionarAto, useAssinarAto, useStatusProcesso, useDepartamentos,
  STATUS_PROC,
} from '@/lib/hooks/use-processos';

import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const dataHora = (d: string) => new Date(d).toLocaleString('pt-BR');

export default function ProcessoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const { data: p, isLoading } = useProcesso(id);
  const status = useStatusProcesso(id);
  const [tramitar, setTramitar] = useState(false);
  const [novoAto, setNovoAto] = useState(false);

  if (isLoading || !p) {
    return <div className="mx-auto max-w-4xl space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full" /></div>;
  }
  const st = STATUS_PROC[p.status] ?? { label: p.status, variant: 'muted' };
  const encerrado = p.status === 'ARQUIVADO' || p.status === 'CONCLUIDO';

  async function mudarStatus(novo: string) {
    try { await status.mutateAsync(novo); toast.success('Status atualizado.'); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível atualizar.'); }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/processos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar aos processos
      </Link>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm tabular text-muted-foreground">{p.numero}</span>
              <Badge variant={st.variant}>{st.label}</Badge>
              {p.sigiloso && <Badge variant="destructive">Sigiloso</Badge>}
            </div>
            <CardTitle className="mt-1">{p.assunto}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{p.tipo} · Interessado: {p.interessado}</p>
          </div>
          {!encerrado && (
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <Can recurso="processos.protocolos" acao="EDITAR"><Button size="sm" variant="outline" onClick={() => setTramitar(true)}><Send /> Tramitar</Button></Can>
              <Can recurso="processos.protocolos" acao="EDITAR"><Button size="sm" variant="outline" onClick={() => setNovoAto(true)}><PenLine /> Ato</Button></Can>
              <Can recurso="processos.protocolos" acao="EDITAR"><Button size="sm" variant="outline" onClick={() => mudarStatus('CONCLUIDO')}><CheckCircle2 /> Concluir</Button></Can>
              <Can recurso="processos.protocolos" acao="EDITAR"><Button size="sm" variant="ghost" onClick={() => mudarStatus('ARQUIVADO')}><Archive /> Arquivar</Button></Can>
            </div>
          )}
        </CardHeader>
        {p.descricao && <CardContent className="text-sm text-muted-foreground">{p.descricao}</CardContent>}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Atos */}
        <Card>
          <CardHeader><CardTitle className="text-base">Despachos e pareceres</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(!p.atos || p.atos.length === 0) && <p className="text-sm text-muted-foreground">Nenhum ato registrado.</p>}
            {p.atos?.map((a) => (
              <div key={a.id} className="rounded-md border p-3">
                <div className="mb-1 flex items-center justify-between">
                  <Badge variant="secondary">{a.tipo === 'PARECER' ? 'Parecer' : 'Despacho'}</Badge>
                  {a.assinadoEm ? (
                    <span className="flex items-center gap-1 text-xs text-success"><ShieldCheck className="h-3.5 w-3.5" /> Assinado</span>
                  ) : (
                    <Can recurso="processos.protocolos" acao="ASSINAR"><AssinarBtn id={id} atoId={a.id} /></Can>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm">{a.conteudo}</p>
                {a.assinaturaHash && <p className="mt-2 break-all font-mono text-[10px] text-muted-foreground">hash: {a.assinaturaHash.slice(0, 32)}…</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tramitações */}
        <Card>
          <CardHeader><CardTitle className="text-base">Tramitação</CardTitle></CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-l pl-5">
              <li className="relative">
                <span className="absolute -left-[1.42rem] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <p className="text-sm font-medium">Processo aberto</p>
                <p className="text-xs text-muted-foreground">{dataHora(p.createdAt)}</p>
              </li>
              {p.tramitacoes?.map((t) => (
                <li key={t.id} className="relative">
                  <span className="absolute -left-[1.42rem] top-1 h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                  <p className="flex items-center gap-1.5 text-sm">
                    {t.deSetor?.nome ?? 'Origem'} <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground" /> <span className="font-medium">{t.paraSetor?.nome}</span>
                  </p>
                  {t.despacho && <p className="text-xs text-muted-foreground">“{t.despacho}”</p>}
                  <p className="text-xs text-muted-foreground">{dataHora(t.createdAt)}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {tramitar && <TramitarDialog id={id} setorAtualId={p.setorAtual?.id} onClose={() => setTramitar(false)} />}
      {novoAto && <AtoDialog id={id} onClose={() => setNovoAto(false)} />}
    </div>
  );
}

function AssinarBtn({ id, atoId }: { id: string; atoId: string }) {
  const assinar = useAssinarAto(id);
  return (
    <button
      onClick={async () => { try { await assinar.mutateAsync(atoId); toast.success('Ato assinado.'); } catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Falha ao assinar.'); } }}
      className="flex items-center gap-1 text-xs text-primary hover:underline"
      disabled={assinar.isPending}
    >
      <FileSignature className="h-3.5 w-3.5" /> Assinar
    </button>
  );
}

function TramitarDialog({ id, setorAtualId, onClose }: { id: string; setorAtualId?: string; onClose: () => void }) {
  const tramitar = useTramitar(id);
  const { data: setores } = useDepartamentos();
  const [f, setF] = useState({ paraSetorId: '', despacho: '' });
  async function submeter() {
    if (!f.paraSetorId) return toast.error('Selecione o setor de destino.');
    try { await tramitar.mutateAsync(f); toast.success('Processo encaminhado.'); onClose(); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível tramitar.'); }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Encaminhar processo</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Setor de destino</Label>
            <Select value={f.paraSetorId} onChange={(e) => setF({ ...f, paraSetorId: e.target.value })}>
              <option value="">Selecione…</option>
              {setores?.filter((s) => s.id !== setorAtualId).map((s) => <option key={s.id} value={s.id}>{s.secretariaSigla} · {s.nome}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Despacho (opcional)</Label><Input value={f.despacho} onChange={(e) => setF({ ...f, despacho: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submeter} disabled={tramitar.isPending}>{tramitar.isPending && <Loader2 className="animate-spin" />} Encaminhar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AtoDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const adicionar = useAdicionarAto(id);
  const [f, setF] = useState({ tipo: 'DESPACHO', conteudo: '' });
  async function submeter() {
    if (f.conteudo.trim().length < 3) return toast.error('Escreva o conteúdo do ato.');
    try { await adicionar.mutateAsync(f); toast.success('Ato registrado.'); onClose(); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível registrar.'); }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo ato</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
              <option value="DESPACHO">Despacho</option>
              <option value="PARECER">Parecer</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Conteúdo</Label>
            <textarea
              value={f.conteudo} onChange={(e) => setF({ ...f, conteudo: e.target.value })} rows={5}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submeter} disabled={adicionar.isPending}>{adicionar.isPending && <Loader2 className="animate-spin" />} Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
