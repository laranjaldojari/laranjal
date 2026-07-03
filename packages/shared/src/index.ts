// Tipos e constantes compartilhados entre a API e o frontend.
// (Populado gradualmente conforme os módulos precisarem de contratos comuns.)
export const ACOES_PERMISSAO = [
  'VISUALIZAR', 'CADASTRAR', 'EDITAR', 'EXCLUIR', 'APROVAR',
  'PUBLICAR', 'ASSINAR', 'EXPORTAR', 'IMPRIMIR', 'ADMINISTRAR',
] as const;
export type AcaoPermissao = (typeof ACOES_PERMISSAO)[number];
