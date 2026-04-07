import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: NextRequest) {
  try {
    const { conteudoCsv } = await request.json()

    if (!conteudoCsv) {
      return NextResponse.json({ error: 'CSV vazio' }, { status: 400 })
    }

    // Limita o tamanho para não explodir o contexto
    const csvTruncado = conteudoCsv.slice(0, 8000)

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Você é um especialista em finanças pessoais. Analise este extrato bancário em CSV e extraia as transações.

REGRAS:
1. Identifique as colunas de data, descrição e valor automaticamente
2. Valores negativos ou com sinal "-" são DESPESAS
3. Valores positivos são RECEITAS
4. Categorize cada transação em uma destas categorias exatas:
   - Alimentação, Transporte, Moradia, Saúde, Lazer, Educação, Salário, Freelance, Investimentos, Outros
5. Ignore linhas de cabeçalho, saldo e totais
6. Retorne APENAS JSON válido, sem texto extra

FORMATO DE SAÍDA (array JSON):
[
  {
    "data": "2024-03-15",
    "descricao": "Supermercado Extra",
    "valor": 150.50,
    "tipo": "despesa",
    "categoria": "Alimentação"
  }
]

CSV DO EXTRATO:
${csvTruncado}`
        }
      ]
    })

    const texto = msg.content[0].type === 'text' ? msg.content[0].text : ''

    // Extrai o JSON da resposta
    const jsonMatch = texto.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Não foi possível interpretar o CSV' }, { status: 400 })
    }

    const transacoes = JSON.parse(jsonMatch[0])

    return NextResponse.json({ transacoes })

  } catch (error: any) {
    console.error('[IMPORTAR CSV]', error?.message)
    return NextResponse.json({ error: 'Erro ao processar CSV' }, { status: 500 })
  }
}