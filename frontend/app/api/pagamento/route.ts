import { NextRequest, NextResponse } from 'next/server'

const LINKS = {
  mensal: 'https://pay.kirvano.com/4059c2cc-c634-4331-a857-0b2fe51d6705',
  anual: 'https://pay.kirvano.com/03f5c147-0a51-4f9f-adff-38e687f82fbe'
}

export async function POST(req: NextRequest) {
  try {
    const { plano, userId, email } = await req.json()

    if (!plano || !userId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const url = LINKS[plano]

    // 🔥 opcional (RECOMENDADO)
    // salvar tentativa de pagamento
    // await supabase.from('pagamentos').insert({
    //   user_id: userId,
    //   plano,
    //   status: 'pending'
    // })

    return NextResponse.json({ url })

  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}