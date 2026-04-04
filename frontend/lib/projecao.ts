type Transacao = {
  tipo: 'receita' | 'despesa'
  valor: number
  data: string
}

export type ProjecaoMes = {
  receitaProjetada: number
  despesaProjetada: number
  saldoProjetado: number
  receitaAtual: number
  despesaAtual: number
  saldoAtual: number
  diasPassados: number
  diasTotais: number
  percentualMes: number
  tendencia: 'otima' | 'boa' | 'atencao' | 'critica'
}

export function calcularProjecao(transacoes: Transacao[]): ProjecaoMes {
  const agora = new Date()
  const mesAtual = agora.getMonth()
  const anoAtual = agora.getFullYear()

  // Dias do mês atual
  const diasTotais = new Date(anoAtual, mesAtual + 1, 0).getDate()
  const diasPassados = agora.getDate()
  const percentualMes = diasPassados / diasTotais

  // Valores do mês atual até hoje
  const transacoesMesAtual = transacoes.filter(t => {
    const d = new Date(t.data)
    return d.getUTCMonth() === mesAtual && d.getUTCFullYear() === anoAtual
  })

  const receitaAtual = transacoesMesAtual
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const despesaAtual = transacoesMesAtual
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  // Média dos últimos 3 meses (excluindo mês atual)
  const medias = Array.from({ length: 3 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (i + 1))
    const mes = d.getMonth()
    const ano = d.getFullYear()

    const t = transacoes.filter(tx => {
      const dt = new Date(tx.data)
      return dt.getUTCMonth() === mes && dt.getUTCFullYear() === ano
    })

    return {
      receita: t.filter(tx => tx.tipo === 'receita').reduce((a, tx) => a + Number(tx.valor), 0),
      despesa: t.filter(tx => tx.tipo === 'despesa').reduce((a, tx) => a + Number(tx.valor), 0),
    }
  })

  const mediaReceita = medias.reduce((a, m) => a + m.receita, 0) / 3
  const mediaDespesa = medias.reduce((a, m) => a + m.despesa, 0) / 3

  // Projeção: usa média histórica se tiver dados, senão extrapola o mês atual
  const receitaProjetada = mediaReceita > 0
    ? mediaReceita
    : percentualMes > 0 ? receitaAtual / percentualMes : 0

  const despesaProjetada = mediaDespesa > 0
    ? mediaDespesa
    : percentualMes > 0 ? despesaAtual / percentualMes : 0

  const saldoProjetado = receitaProjetada - despesaProjetada
  const saldoAtual = receitaAtual - despesaAtual

  const ratio = receitaProjetada > 0 ? despesaProjetada / receitaProjetada : 1

  const tendencia =
    ratio < 0.5 ? 'otima' :
    ratio < 0.7 ? 'boa' :
    ratio < 0.9 ? 'atencao' : 'critica'

  return {
    receitaProjetada,
    despesaProjetada,
    saldoProjetado,
    receitaAtual,
    despesaAtual,
    saldoAtual,
    diasPassados,
    diasTotais,
    percentualMes,
    tendencia,
  }
}