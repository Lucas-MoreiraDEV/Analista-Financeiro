import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function validarAssinatura(body: string, assinatura: string): boolean {
  const secret = process.env.KIRVANO_WEBHOOK_SECRET!
  const esperada = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(esperada),
    Buffer.from(assinatura)
  )
}

function detectarPlano(body: any): 'mensal' | 'anual' {
  const offerName = body.products?.[0]?.offer_name?.toLowerCase() || ''
  const utmMedium = body.utm?.utm_medium?.toLowerCase() || ''
  if (offerName.includes('anual') || utmMedium === 'anual') return 'anual'
  return 'mensal'
}

function calcularExpiracao(plano: 'mensal' | 'anual'): Date {
  const agora = new Date()
  if (plano === 'anual') {
    agora.setFullYear(agora.getFullYear() + 1)
  } else {
    agora.setMonth(agora.getMonth() + 1)
  }
  return agora
}

async function ativarPlano(body: any) {
  const saleId = body.sale_id
  const userId = body.utm?.utm_source // user_id passado via UTM
  const plano = detectarPlano(body)
  const expiracao = calcularExpiracao(plano)

  console.log(`[WEBHOOK] sale_id: ${saleId} | user_id: ${userId} | plano: ${plano}`)

  if (!saleId) {
    console.error('[WEBHOOK] sale_id ausente')
    return
  }

  if (!userId) {
    console.error('[WEBHOOK] user_id ausente no UTM — usuario nao identificado')
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      plano: 'pro',
      plano_expira_em: expiracao.toISOString(),
      kirvano_order_id: saleId
    })
    .eq('id', userId)

  if (error) {
    console.error('[WEBHOOK] Erro ao ativar plano:', error.message)
    throw new Error(error.message)
  }

  console.log(`[WEBHOOK] Plano PRO ativado! user_id: ${userId} | expira: ${expiracao.toISOString()}`)
}

async function cancelarPlano(body: any) {
  const saleId = body.sale_id
  if (!saleId) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('kirvano_order_id', saleId)
    .single()

  if (!profile) {
    console.log(`[WEBHOOK] Usuario nao encontrado para cancelamento: ${saleId}`)
    return
  }

  await supabase
    .from('profiles')
    .update({ plano: 'free', plano_expira_em: null })
    .eq('id', profile.id)

  console.log(`[WEBHOOK] Plano revertido para FREE: ${profile.email}`)
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const assinatura = req.headers.get('x-kirvano-signature') ?? ''

  if (assinatura && !validarAssinatura(rawBody, assinatura)) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Body invalido' }, { status: 400 })
  }

  console.log(`[WEBHOOK] Evento: ${body.event}`)

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
        console.log(`[WEBHOOK] Ignorado: ${body.event}`)
    }
  } catch (err: any) {
    console.error('[WEBHOOK] Erro:', err.message)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}