/**
 * ÚNICO ponto que toca o armazenamento de tokens. Centralizar aqui permite
 * migrar para cookies httpOnly (recomendação de produção — RNF-SEG-3) com
 * alteração em um só arquivo. Nesta base, persiste em localStorage para que
 * a sessão sobreviva ao reload enquanto o endpoint de refresh não existe.
 */
const ACCESS = 'ljari.access';
const REFRESH = 'ljari.refresh';

export const tokenStore = {
  get access() { return typeof window === 'undefined' ? null : localStorage.getItem(ACCESS); },
  get refresh() { return typeof window === 'undefined' ? null : localStorage.getItem(REFRESH); },
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS, access);
    localStorage.setItem(REFRESH, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};
