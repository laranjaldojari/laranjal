'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export interface Fornecedor { id: string; razaoSocial: string; nomeFantasia?: string | null; cnpj: string; email?: string | null; telefone?: string | null; regularFiscal: boolean }
export interface SolicitacaoItem { descricao: string; unidade: string; quantidade: number; valorUnitario?: number | null }
export interface Solicitacao { id: string; numero: string; objeto: string; status: string; valorEstimado?: string | number | null; secretaria?: { sigla?: string; nome?: string } | null; itens?: SolicitacaoItem[]; _count?: { itens: number } }
export interface Processo { id: string; numero: string; objeto: string; modalidade: string; status: string; valorEstimado?: string | number | null; valorHomologado?: string | number | null; fornecedorVencedor?: { razaoSocial: string } | null }
export interface Contrato { id: string; numero: string; objeto: string; valor: string | number; dataInicio: string; dataFim: string; situacao: string; fornecedor?: { razaoSocial: string } | null; aditivos?: any[] }
export interface Meta { page: number; perPage: number; total: number; totalPaginas: number }
interface Lista<T> { itens: T[]; meta: Meta }

const inval = (qc: ReturnType<typeof useQueryClient>, k: string) => () => qc.invalidateQueries({ queryKey: [k] });

// ---- Fornecedores ----
export function useFornecedores(page: number, search: string) {
  return useQuery({ queryKey: ['fornecedores', page, search], queryFn: async () => (await api.get<Lista<Fornecedor>>('/fornecedores', { params: { page, perPage: 10, search: search || undefined } })).data, placeholderData: (p) => p });
}
export function useSalvarFornecedor() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (v: any) => v.id ? (await api.put(`/fornecedores/${v.id}`, v)).data : (await api.post('/fornecedores', v)).data, onSuccess: inval(qc, 'fornecedores') });
}
export function useExcluirFornecedor() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (id: string) => (await api.delete(`/fornecedores/${id}`)).data, onSuccess: inval(qc, 'fornecedores') });
}

// ---- Solicitações ----
export function useSolicitacoes(page: number, search: string) {
  return useQuery({ queryKey: ['solicitacoes', page, search], queryFn: async () => (await api.get<Lista<Solicitacao>>('/solicitacoes-compra', { params: { page, perPage: 10, search: search || undefined } })).data, placeholderData: (p) => p });
}
export function useSalvarSolicitacao() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (v: any) => (await api.post('/solicitacoes-compra', v)).data, onSuccess: inval(qc, 'solicitacoes') });
}
export function useAcaoSolicitacao() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async ({ id, acao }: { id: string; acao: 'enviar' | 'aprovar' | 'reprovar' }) => (await api.post(`/solicitacoes-compra/${id}/${acao}`)).data, onSuccess: inval(qc, 'solicitacoes') });
}
export function useExcluirSolicitacao() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (id: string) => (await api.delete(`/solicitacoes-compra/${id}`)).data, onSuccess: inval(qc, 'solicitacoes') });
}

// ---- Processos ----
export function useProcessos(page: number, search: string) {
  return useQuery({ queryKey: ['processos', page, search], queryFn: async () => (await api.get<Lista<Processo>>('/processos-contratacao', { params: { page, perPage: 10, search: search || undefined } })).data, placeholderData: (p) => p });
}
export function useSalvarProcesso() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (v: any) => (await api.post('/processos-contratacao', v)).data, onSuccess: inval(qc, 'processos') });
}
export function useExcluirProcesso() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (id: string) => (await api.delete(`/processos-contratacao/${id}`)).data, onSuccess: inval(qc, 'processos') });
}

// ---- Contratos ----
export function useContratos(page: number, search: string) {
  return useQuery({ queryKey: ['contratos', page, search], queryFn: async () => (await api.get<Lista<Contrato>>('/contratos', { params: { page, perPage: 10, search: search || undefined } })).data, placeholderData: (p) => p });
}
export function useSalvarContrato() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (v: any) => (await api.post('/contratos', v)).data, onSuccess: inval(qc, 'contratos') });
}
export function useExcluirContrato() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (id: string) => (await api.delete(`/contratos/${id}`)).data, onSuccess: inval(qc, 'contratos') });
}

// ---- utilitário ----
export const moeda = (v?: string | number | null) =>
  v == null ? '—' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
