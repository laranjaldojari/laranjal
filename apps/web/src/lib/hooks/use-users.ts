'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { ListaUsuarios } from './types';

export function useUsuarios(page: number, search: string) {
  return useQuery({
    queryKey: ['usuarios', page, search],
    queryFn: async () => (await api.get<ListaUsuarios>('/users', { params: { page, perPage: 10, search: search || undefined } })).data,
    placeholderData: (prev) => prev,
  });
}

export function useSalvarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id?: string; nome: string; email: string; cpf?: string; senha?: string; ativo?: boolean; secretariaId?: string }) => {
      if (v.id) return (await api.put(`/users/${v.id}`, { nome: v.nome, email: v.email, ativo: v.ativo, secretariaId: v.secretariaId })).data;
      return (await api.post('/users', { nome: v.nome, email: v.email, cpf: v.cpf, senha: v.senha, secretariaId: v.secretariaId })).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

export function useDefinirPapeis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, roleIds }: { id: string; roleIds: string[] }) => (await api.patch(`/users/${id}/papeis`, { roleIds })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

export function useExcluirUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/users/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}
