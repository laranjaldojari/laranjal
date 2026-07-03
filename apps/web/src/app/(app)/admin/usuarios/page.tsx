'use client';
import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUsuarios, useSalvarUsuario, useExcluirUsuario, useDefinirPapeis } from '@/lib/hooks/use-users';
import { usePapeis } from '@/lib/hooks/use-rbac';
import { useSecretarias } from '@/lib/hooks/use-organization';
import type { Usuario } from '@/lib/hooks/types';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function UsuariosPage() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const { data, isLoading, isFetching } = useUsuarios(page, busca);
  const [editando, setEditando] = useState<Usuario | null | undefined>(undefined); // undefined=fechado, null=novo
  const [papeisDe, setPapeisDe] = useState<Usuario | null>(null);

  const excluir = useExcluirUsuario();

  async function confirmarExclusao(u: Usuario) {
    if (!confirm(`Excluir o usuário ${u.nome}?`)) return;
    try { await excluir.mutateAsync(u.id); toast.success('Usuário excluído.'); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível excluir.'); }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
          <p className="mt-1 text-sm text-muted-foreground">Servidores com acesso à plataforma.</p>
        </div>
        <Can recurso="admin.usuarios" acao="CADASTRAR">
          <Button onClick={() => setEditando(null)}><Plus /> Novo usuário</Button>
        </Can>
      </header>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por nome ou e-mail" value={busca}
          onChange={(e) => { setBusca(e.target.value); setPage(1); }} />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Papéis</TableHead>
              <TableHead>Secretaria</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
            ))}
            {data?.itens.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="font-medium">{u.nome}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.length ? u.roles.map((r) => <Badge key={r.roleId} variant="secondary">{r.nome}</Badge>)
                      : <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.secretaria?.nome ?? '—'}</TableCell>
                <TableCell>{u.ativo ? <Badge variant="success">Ativo</Badge> : <Badge variant="muted">Inativo</Badge>}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Can recurso="admin.usuarios" acao="ADMINISTRAR">
                      <Button variant="ghost" size="icon" title="Papéis" onClick={() => setPapeisDe(u)}><ShieldCheck /></Button>
                    </Can>
                    <Can recurso="admin.usuarios" acao="EDITAR">
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditando(u)}><Pencil /></Button>
                    </Can>
                    <Can recurso="admin.usuarios" acao="EXCLUIR">
                      <Button variant="ghost" size="icon" title="Excluir" onClick={() => confirmarExclusao(u)}><Trash2 /></Button>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data && data.itens.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Nenhum usuário encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.meta.totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{data.meta.total} usuários {isFetching && <Loader2 className="ml-1 inline h-3 w-3 animate-spin" />}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <span className="flex items-center px-2 text-muted-foreground">{page} / {data.meta.totalPaginas}</span>
            <Button variant="outline" size="sm" disabled={page >= data.meta.totalPaginas} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
          </div>
        </div>
      )}

      {editando !== undefined && <UsuarioDialog usuario={editando} onClose={() => setEditando(undefined)} />}
      {papeisDe && <PapeisDialog usuario={papeisDe} onClose={() => setPapeisDe(null)} />}
    </div>
  );
}

function UsuarioDialog({ usuario, onClose }: { usuario: Usuario | null; onClose: () => void }) {
  const editar = !!usuario;
  const salvar = useSalvarUsuario();
  const { data: secretarias } = useSecretarias();
  const [form, setForm] = useState({
    nome: usuario?.nome ?? '', email: usuario?.email ?? '', cpf: usuario?.cpf ?? '',
    senha: '', ativo: usuario?.ativo ?? true, secretariaId: usuario?.secretaria?.id ?? '',
  });

  async function submeter() {
    try {
      await salvar.mutateAsync({ id: usuario?.id, ...form, secretariaId: form.secretariaId || undefined });
      toast.success(editar ? 'Usuário atualizado.' : 'Usuário criado.');
      onClose();
    } catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível salvar.'); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editar ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
          <DialogDescription>Dados de acesso do servidor.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>E-mail</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          {!editar && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>CPF</Label><Input value={form.cpf} placeholder="Somente números" onChange={(e) => setForm({ ...form, cpf: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Senha inicial</Label><Input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} /></div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Secretaria</Label>
            <Select value={form.secretariaId} onChange={(e) => setForm({ ...form, secretariaId: e.target.value })}>
              <option value="">— Nenhuma —</option>
              {secretarias?.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submeter} disabled={salvar.isPending}>
            {salvar.isPending && <Loader2 className="animate-spin" />} Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PapeisDialog({ usuario, onClose }: { usuario: Usuario; onClose: () => void }) {
  const { data: papeis } = usePapeis();
  const definir = useDefinirPapeis();
  const [sel, setSel] = useState<Set<string>>(new Set(usuario.roles.map((r) => r.roleId)));

  function alternar(id: string) {
    setSel((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  async function salvar() {
    try { await definir.mutateAsync({ id: usuario.id, roleIds: [...sel] }); toast.success('Papéis atualizados.'); onClose(); }
    catch (e: any) { toast.error(e.response?.data?.erro?.message ?? 'Não foi possível salvar.'); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Papéis de {usuario.nome}</DialogTitle>
          <DialogDescription>Os papéis definem o que o usuário pode acessar.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          {papeis?.map((p) => (
            <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-accent">
              <input type="checkbox" checked={sel.has(p.id)} onChange={() => alternar(p.id)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
              <span className="text-sm">{p.nome}</span>
            </label>
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
