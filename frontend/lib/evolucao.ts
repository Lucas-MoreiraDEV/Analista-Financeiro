type Transacao = {
  tipo: 'receita' | 'despesa'
  valor: number
  data: string
}

export type PontoEvolucao = {
  label: string
  saldo: number
  receita: number
  despesa: number
  mes: number
  ano: number
}

export function calcularEvolucao(transacoes: Transacao[], meses = 6): PontoEvolucao[] {
  return Array.from({ length: meses }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (meses - 1 - i))

    const mes = d.getMonth()
    const ano = d.getFullYear()
    const label = d.toLocaleString('pt-BR', { month: 'short' })

    const transacoesMes = transacoes.filter(t => {
      const dt = new Date(t.data)
      return dt.getUTCMonth() === mes && dt.getUTCFullYear() === ano
    })

    const receita = transacoesMes
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + Number(t.valor), 0)

    const despesa = transacoesMes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + Number(t.valor), 0)

    return { label, saldo: receita - despesa, receita, despesa, mes, ano }
  })
}