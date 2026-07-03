/** Gera número sequencial por ano: "2026/000123". */
export function formatarNumero(ano: number, seq: number): string {
  return `${ano}/${String(seq).padStart(6, '0')}`;
}
