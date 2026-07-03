'use client';
import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useFornecedores, useSalvarFornecedor, useExcluirFornecedor, type Fornecedor } from '@/lib/hooks/use-compras';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function FornecedoresPage() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const { data, isLoading } = useFornecedores(page, busca);
  const [editando, setEditando] = useState<Fornecedor | null | undefined>(undefined);
  const excluir = useExcluirFornecedor();

  async function remover(f: Fornecedor) {
    if (!confirm(`Excluir o fornecedor ${f.razaoSocial}?`)) return;
    try { await excluir.mutateAsync(f.id); toast.success('Fornecedor excluído.'); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível excluir.'); }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fornecedores</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cadastro de empresas e sua regularidade fiscal.</p>
        </div>
        <Can recurso="compras.fornecedores" acao="CADASTRAR">
          <Button onClick={() => setEditando(null)}><Plus /> Novo fornecedor</Button>
        </Can>
      </header>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por razão social ou CNPJ" value={busca} onChange={(e) => { setBusca(e.target.value); setPage(1); }} />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razão social</TableHead><TableHead>CNPJ</TableHead>
              <TableHead>Regularidade</TableHead><TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
            ))}
            {data?.itens.map((f) => (
              <TableRow key={f.id}>
                <TableCell><div className="font-medium">{f.razaoSocial}</div>{f.nomeFantasia && <div className="text-xs text-muted-foreground">{f.nomeFantasia}</div>}</TableCell>
                <TableCell className="font-mono text-sm tabular">{f.cnpj}</TableCell>
                <TableCell>{f.regularFiscal ? <Badge variant="success">Regular</Badge> : <Badge variant="muted">Pendente</Badge>}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Can recurso="compras.fornecedores" acao="EDITAR"><Button variant="ghost" size="icon" onClick={() => setEditando(f)}><Pencil /></Button></Can>
                    <Can recurso="compras.fornecedores" acao="EXCLUIR"><Button variant="ghost" size="icon" onClick={() => remover(f)}><Trash2 /></Button></Can>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data && data.itens.length === 0 && (
              <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">Nenhum fornecedor encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.meta.totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{data.meta.total} fornecedores</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <span className="flex items-center px-2 text-muted-foreground">{page} / {data.meta.totalPaginas}</span>
            <Button variant="outline" size="sm" disabled={page >= data.meta.totalPaginas} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
          </div>
        </div>
      )}

      {editando !== undefined && <FornecedorDialog fornecedor={editando} onClose={() => setEditando(undefined)} />}
    </div>
  );
}

function FornecedorDialog({ fornecedor, onClose }: { fornecedor: Fornecedor | null; onClose: () => void }) {
  const salvar = useSalvarFornecedor();
  const [f, setF] = useState({
    razaoSocial: fornecedor?.razaoSocial ?? '', nomeFantasia: fornecedor?.nomeFantasia ?? '',
    cnpj: fornecedor?.cnpj ?? '', email: fornecedor?.email ?? '', telefone: fornecedor?.telefone ?? '',
    regularFiscal: fornecedor?.regularFiscal ?? false,
  });
  async function submeter() {
    try { await salvar.mutateAsync({ id: fornecedor?.id, ...f }); toast.success('Fornecedor salvo.'); onClose(); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível salvar.'); }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{fornecedor ? 'Editar fornecedor' : 'Novo fornecedor'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Razão social</Label><Input value={f.razaoSocial} onChange={(e) => setF({ ...f, razaoSocial: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Nome fantasia</Label><Input value={f.nomeFantasia} onChange={(e) => setF({ ...f, nomeFantasia: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>CNPJ</Label><Input value={f.cnpj} placeholder="Somente números" disabled={!!fornecedor} onChange={(e) => setF({ ...f, cnpj: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>E-mail</Label><Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Telefone</Label><Input value={f.telefone} onChange={(e) => setF({ ...f, telefone: e.target.value })} /></div>
          </div>
          <label className="flex items-center gap-3">
            <Switch checked={f.regularFiscal} onCheckedChange={(v) => setF({ ...f, regularFiscal: v })} />
            <span className="text-sm">Regularidade fiscal em dia</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submeter} disabled={salvar.isPending}>{salvar.isPending && <Loader2 className="animate-spin" />} Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
