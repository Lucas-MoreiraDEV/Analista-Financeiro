// lib/planos.ts
export const LIMITES = {
  free: {
    transacoes_por_mes: 7,
    ia: false,
    relatorios: false,
    metas: 2,
  },
  pro: {
    transacoes_por_mes: Infinity,
    ia: true,
    relatorios: true,
    metas: Infinity,
  }
}