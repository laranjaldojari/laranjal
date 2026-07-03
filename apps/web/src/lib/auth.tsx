'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';
import { tokenStore } from './token-store';
import type { LoginInput } from './validations/auth';

export interface Usuario { id: string; nome: string; email: string }

interface AuthContextValue {
  usuario: Usuario | null;
  permissoes: string[];
  carregando: boolean;
  entrar: (dados: LoginInput) => Promise<void>;
  sair: () => void;
  /** RBAC no cliente: o usuário pode executar a ação sobre o recurso? */
  pode: (recurso: string, acao: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function lerToken(cru: string): { usuario: Usuario; permissoes: string[] } | null {
  try {
    const p = JSON.parse(atob(cru.split('.')[1]));
    if (p.exp * 1000 < Date.now()) return null;
    return {
      usuario: { id: p.sub, nome: p.nome ?? p.email, email: p.email },
      permissoes: p.permissoes ?? [],
    };
  } catch { return null; }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [permissoes, setPermissoes] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const cru = tokenStore.access;
    const sessao = cru ? lerToken(cru) : null;
    if (sessao) { setUsuario(sessao.usuario); setPermissoes(sessao.permissoes); }
    else tokenStore.clear();
    setCarregando(false);
  }, []);

  async function entrar(dados: LoginInput) {
    const { data } = await api.post('/auth/login', dados);
    tokenStore.set(data.accessToken, data.refreshToken);
    const sessao = lerToken(data.accessToken);
    setUsuario(data.usuario);
    setPermissoes(sessao?.permissoes ?? []);
    router.push('/dashboard');
  }

  function sair() {
    tokenStore.clear();
    setUsuario(null);
    setPermissoes([]);
    router.push('/login');
  }

  const pode = useMemo(() => {
    const set = new Set(permissoes);
    const admin = set.has('*:ADMINISTRAR');
    return (recurso: string, acao: string) => admin || set.has(`${recurso}:${acao}`);
  }, [permissoes]);

  return (
    <AuthContext.Provider value={{ usuario, permissoes, carregando, entrar, sair, pode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
