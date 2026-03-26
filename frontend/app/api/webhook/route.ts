import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function validarAssinatura(body: string, assinaturaRecebida: string): boolean {
  const secret = process.env.KIRVANO_WEBHOOK_SECRET!
  const assinaturaEsperada = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(assinaturaEsperada),
    Buffer.from(assinaturaRecebida)
  )
}

async function ativarPlano(body: any) {
  const email = body.customer?.email?.toLowerCase().trim()
  const saleId = body.sale_id

  if (!email || !saleId) return

  const { error } = await supabase
    .from('profiles')
    .update({
      plano: 'pro',
      plano_expira_em: null, // vitalício
      kirvano_order_id: saleId
    })
    .eq('email', email)

  if (error) throw new Error(error.message)
  console.log(`[WEBHOOK] Plano PRO ativado para: ${email}`)
}

async function cancelarPlano(body: any) {
  const email = body.customer?.email?.toLowerCase().trim()
  if (!email) return

  const { error } = await supabase
    .from('profiles')
    .update({ plano: 'free', plano_expira_em: null })
    .eq('email', email)

  if (error) throw new Error(error.message)
  console.log(`[WEBHOOK] Plano revertido para FREE: ${email}`)
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const assinatura = req.headers.get('x-kirvano-signature') ?? ''

  // 🔒 Valida assinatura apenas se o Kirvano enviar o header
  if (assinatura && !validarAssinatura(rawBody, assinatura)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  try {
    switch (body.event) {
      case 'SALE_APPROVED':
        await ativarPlano(body)
        break

      case 'SALE_REFUNDED':
      case 'SALE_CHARGEBACK':
      case 'SALE_CANCELLED':
        await cancelarPlano(body)
        break

      default:
        console.log(`[WEBHOOK] Evento ignorado: ${body.event}`)
    }
  } catch (err: any) {
    console.error('[WEBHOOK] Erro:', err.message)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}