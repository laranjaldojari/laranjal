import axios from 'axios';
import { tokenStore } from './token-store';

/**
 * Cliente HTTP central. Base "/api" é reescrita para a API NestJS (ver
 * next.config.mjs). Injeta o Bearer token e trata 401 globalmente.
 */
export const api = axios.create({ baseURL: '/api/v1', timeout: 15_000 });

api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // 401 → sessão inválida/expirada. (Refresh rotativo entra quando o
    // endpoint /auth/refresh for implementado em etapa futura.)
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      tokenStore.clear();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
