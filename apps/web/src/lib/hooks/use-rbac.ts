'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { Role, Catalogo } from './types';

export function usePapeis() {
  return useQuery({ queryKey: ['papeis'], queryFn: async () => (await api.get<Role[]>('/roles')).data });
}

export function useCatalogoPermissoes() {
  return useQuery({ queryKey: ['permissoes'], queryFn: async () => (await api.get<Catalogo>('/permissions')).data });
}

export function useSalvarPapel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id?: string; nome: string; descricao?: string }) =>
      v.id ? (await api.put(`/roles/${v.id}`, v)).data : (await api.post('/roles', v)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['papeis'] }),
  });
}

export function useDefinirPermissoes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, permissionIds }: { id: string; permissionIds: string[] }) =>
      (await api.put(`/roles/${id}/permissoes`, { permissionIds })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['papeis'] }),
  });
}

export function useExcluirPapel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/roles/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['papeis'] }),
  });
}
