import { NextRequest, NextResponse } from 'next/server'
import { gerarInsights } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const { transacoes, metas } = await request.json()
    const insights = await gerarInsights(transacoes, metas)
    return NextResponse.json({ insights })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Erro ao gerar insights' },
      { status: 500 }
    )
  }
}