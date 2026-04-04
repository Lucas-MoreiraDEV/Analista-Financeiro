type Transacao = {
  tipo: 'receita' | 'despesa'
  valor: number
  data: string
}

export type ComparativoMes = {
  receitaAtual: number
  receitaAnterior: number
  despesaAtual: number
  despesaAnterior: number
  variacaoReceita: number   // percentual
  variacaoDespesa: number   // percentual
  variacaoSaldo: number     // percentual
}

export function calcularComparativo(transacoes: Transacao[]): ComparativoMes {
  const agora = new Date()
  const mesAtual = agora.getMonth()
  const anoAtual = agora.getFullYear()

  // Mês anterior (considera virada de ano)
  const dataMesAnterior = new Date(anoAtual, mesAtual - 1, 1)
  const mesAnterior = dataMesAnterior.getMonth()
  const anoAnterior = dataMesAnterior.getFullYear()

  function somarPorMes(tipo: 'receita' | 'despesa', mes: number, ano: number) {
    return transacoes
      .filter(t => {
        const d = new Date(t.data)
        return (
          t.tipo === tipo &&
          d.getMonth() === mes &&
          d.getFullYear() === ano
        )
      })
      .reduce((acc, t) => acc + Number(t.valor), 0)
  }

  const receitaAtual    = somarPorMes('receita', mesAtual, anoAtual)
  const receitaAnterior = somarPorMes('receita', mesAnterior, anoAnterior)
  const despesaAtual    = somarPorMes('despesa', mesAtual, anoAtual)
  const despesaAnterior = somarPorMes('despesa', mesAnterior, anoAnterior)

  const saldoAtual    = receitaAtual - despesaAtual
  const saldoAnterior = receitaAnterior - despesaAnterior

  function variacao(atual: number, anterior: number): number {
    if (anterior === 0) return atual > 0 ? 100 : 0
    return ((atual - anterior) / anterior) * 100
  }

  return {
    receitaAtual,
    receitaAnterior,
    despesaAtual,
    despesaAnterior,
    variacaoReceita: variacao(receitaAtual, receitaAnterior),
    variacaoDespesa: variacao(despesaAtual, despesaAnterior),
    variacaoSaldo:   variacao(saldoAtual, saldoAnterior),
  }
}