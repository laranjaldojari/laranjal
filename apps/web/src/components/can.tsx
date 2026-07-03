'use client';
import { useAuth } from '@/lib/auth';

/**
 * Renderiza os filhos apenas se o usuário tiver a permissão (recurso, acao).
 * Ex.: <Can recurso="admin.usuarios" acao="CADASTRAR"><Button/></Can>
 * Observação: o RBAC no cliente é conveniência de UX; a autorização real é
 * sempre reforçada no servidor (PermissionsGuard).
 */
export function Can({
  recurso, acao, children, fallback = null,
}: { recurso: string; acao: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  const { pode } = useAuth();
  return <>{pode(recurso, acao) ? children : fallback}</>;
}
