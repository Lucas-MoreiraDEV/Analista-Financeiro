import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

type Transacao = {
  tipo: 'receita' | 'despesa'
  valor: number
  categoria: string
  descricao: string
  data: string
}

type Meta = {
  categoria: string
  limite: number
}

export async function gerarInsights(
  transacoes: Transacao[],
  metas: Meta[]
): Promise<string> {
  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor, 0)

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0)

  const porCategoria = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor
      return acc
    }, {} as Record<string, number>)

  const resumo = {
    totalReceitas,
    totalDespesas,
    saldo: totalReceitas - totalDespesas,
    porCategoria,
    metas,
    totalTransacoes: transacoes.length
  }

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Voce e um consultor financeiro pessoal. Analise os dados financeiros abaixo e gere exatamente 3 insights praticos e personalizados em portugues brasileiro. Seja direto, use numeros reais dos dados e sugira acoes concretas.

Dados financeiros do usuario:
${JSON.stringify(resumo, null, 2)}

Formato da resposta — use exatamente este formato:
1. [insight sobre o maior problema ou oportunidade]
2. [insight sobre uma categoria especifica de gasto]
3. [insight sobre como melhorar o saldo no proximo mes]

Seja objetivo, use os valores reais e fale diretamente com o usuario.`
      }
    ]
  })

  const content = msg.content[0]
  return content.type === 'text' ? content.text : ''
}