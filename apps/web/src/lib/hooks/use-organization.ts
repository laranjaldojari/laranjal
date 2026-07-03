'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { Secretaria, DepartamentoNo } from './types';

export function useSecretarias() {
  return useQuery({ queryKey: ['secretarias'], queryFn: async () => (await api.get<Secretaria[]>('/secretarias')).data });
}

export function useSalvarSecretaria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id?: string; nome: string; sigla: string; responsavel?: string }) =>
      v.id ? (await api.put(`/secretarias/${v.id}`, v)).data : (await api.post('/secretarias', v)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretarias'] }),
  });
}

export function useExcluirSecretaria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/secretarias/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretarias'] }),
  });
}

export function useOrganograma(secretariaId?: string) {
  return useQuery({
    queryKey: ['organograma', secretariaId],
    queryFn: async () => (await api.get<DepartamentoNo[]>('/departamentos', { params: { secretariaId } })).data,
    enabled: !!secretariaId,
  });
}

export function useSalvarDepartamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { nome: string; secretariaId: string; paiId?: string }) => (await api.post('/departamentos', v)).data,
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['organograma', v.secretariaId] }),
  });
}
