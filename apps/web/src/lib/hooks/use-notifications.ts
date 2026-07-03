'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export interface Notificacao {
  id: string; tipo: 'INFO' | 'SUCESSO' | 'ALERTA' | 'ERRO' | 'TAREFA';
  titulo: string; mensagem: string; link: string | null; lidaEm: string | null; createdAt: string;
}

export function useNotificacoes() {
  return useQuery({
    queryKey: ['notificacoes'],
    queryFn: async () => (await api.get<Notificacao[]>('/notificacoes')).data,
    refetchInterval: 30_000, // sondagem leve; WebSocket empurra em tempo real quando conectado
  });
}

export function useContadorNaoLidas() {
  return useQuery({
    queryKey: ['notificacoes', 'contador'],
    queryFn: async () => (await api.get<{ naoLidas: number }>('/notificacoes/contador')).data.naoLidas,
    refetchInterval: 30_000,
  });
}

export function useMarcarLidas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id?: string) =>
      id ? api.patch(`/notificacoes/${id}/lida`) : api.patch('/notificacoes/todas/lidas'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notificacoes'] }),
  });
}
