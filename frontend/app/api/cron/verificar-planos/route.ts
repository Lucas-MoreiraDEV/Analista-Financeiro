import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  // Protege a rota com secret
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  const agora = new Date().toISOString()

  // Busca todos os usuarios Pro com plano expirado
  const { data: expirados, error } = await supabase
    .from('profiles')
    .select('id, email, plano_expira_em')
    .eq('plano', 'pro')
    .lt('plano_expira_em', agora)
    .not('plano_expira_em', 'is', null)

  if (error) {
    console.error('[CRON] Erro ao buscar expirados:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!expirados || expirados.length === 0) {
    console.log('[CRON] Nenhum plano expirado')
    return NextResponse.json({ ok: true, expirados: 0 })
  }

  // Reverte para free
  const ids = expirados.map(p => p.id)
  await supabase
    .from('profiles')
    .update({ plano: 'free', plano_expira_em: null })
    .in('id', ids)

  console.log(`[CRON] ${expirados.length} planos revertidos para FREE`)
  expirados.forEach(p => console.log(` - ${p.email} expirou em ${p.plano_expira_em}`))

  return NextResponse.json({ ok: true, expirados: expirados.length })
}