'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export interface SetorRef { id: string; nome: string }
export interface Tramitacao { id: string; deSetor?: SetorRef | null; paraSetor?: SetorRef | null; despacho?: string | null; createdAt: string }
export interface Ato { id: string; tipo: string; conteudo: string; assinadoEm?: string | null; assinaturaHash?: string | null; createdAt: string }
export interface Processo {
  id: string; numero: string; assunto: string; descricao?: string | null; tipo: string; interessado: string;
  status: string; sigiloso: boolean; setorAtual?: SetorRef | null;
  tramitacoes?: Tramitacao[]; atos?: Ato[]; createdAt: string;
}
export interface Meta { page: number; perPage: number; total: number; totalPaginas: number }

export function useProcessos(page: number, search: string) {
  return useQuery({ queryKey: ['processos-el', page, search], queryFn: async () => (await api.get<{ itens: Processo[]; meta: Meta }>('/processos', { params: { page, perPage: 10, search: search || undefined } })).data, placeholderData: (p) => p });
}
export function useProcesso(id: string) {
  return useQuery({ queryKey: ['processo-el', id], queryFn: async () => (await api.get<Processo>(`/processos/${id}`)).data, enabled: !!id });
}
export function useDepartamentos() {
  return useQuery({ queryKey: ['departamentos-todos'], queryFn: async () => (await api.get<{ id: string; nome: string; secretariaSigla: string }[]>('/departamentos/todos')).data });
}

function useProcMutation<T>(fn: (v: T) => Promise<any>, id?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['processos-el'] });
      if (id) qc.invalidateQueries({ queryKey: ['processo-el', id] });
    },
  });
}

export const useAbrirProcesso = () => useProcMutation(async (v: any) => (await api.post('/processos', v)).data);
export const useTramitar = (id: string) => useProcMutation(async (v: { paraSetorId: string; despacho?: string }) => (await api.post(`/processos/${id}/tramitar`, v)).data, id);
export const useAdicionarAto = (id: string) => useProcMutation(async (v: { tipo: string; conteudo: string }) => (await api.post(`/processos/${id}/atos`, v)).data, id);
export const useAssinarAto = (id: string) => useProcMutation(async (atoId: string) => (await api.post(`/processos/atos/${atoId}/assinar`)).data, id);
export const useStatusProcesso = (id: string) => useProcMutation(async (status: string) => (await api.patch(`/processos/${id}/status`, { status })).data, id);

export const STATUS_PROC: Record<string, { label: string; variant: any }> = {
  ABERTO: { label: 'Aberto', variant: 'default' },
  EM_TRAMITACAO: { label: 'Em tramitação', variant: 'warning' },
  SOBRESTADO: { label: 'Sobrestado', variant: 'muted' },
  ARQUIVADO: { label: 'Arquivado', variant: 'muted' },
  CONCLUIDO: { label: 'Concluído', variant: 'success' },
};
