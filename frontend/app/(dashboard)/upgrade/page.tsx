'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '@/components/header'

const OFERTAS = {
  mensal: {
    baseUrl: 'https://pay.kirvano.com/4059c2cc-c634-4331-a857-0b2fe51d6705'
  },
  anual: {
    baseUrl: 'https://pay.kirvano.com/03f5c147-0a51-4f9f-adff-38e687f82fbe'
  }
}

type Profile = {
  plano: string
  plano_expira_em: string | null
}

export default function Upgrade() {
  const [loading, setLoading] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [carregando, setCarregando] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function carregarUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data } = await supabase
        .from('profiles')
        .select('plano, plano_expira_em')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setCarregando(false)
    }
    carregarUser()
  }, [])

  function assinar(plano: 'mensal' | 'anual') {
    setLoading(plano)
    const url = `${OFERTAS[plano].baseUrl}?utm_source=${userId}&utm_medium=${plano}`
    window.location.href = url
  }

  function diasRestantes(): number | null {
    if (!profile?.plano_expira_em) return null
    const diff = new Date(profile.plano_expira_em).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const isPro = profile?.plano === 'pro'
  const dias = diasRestantes()

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  // Usuário já é Pro
  if (isPro) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-lg mx-auto p-6 pt-12">
          <div className="bg-white rounded-2xl border-2 border-green-500 p-8 text-center">

            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>

            <div className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              PLANO PRO ATIVO
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Voce ja e Pro!
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Voce tem acesso completo a todos os recursos do FinanceApp.
            </p>

            {dias !== null && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Seu plano expira em</p>
                <p className="text-2xl font-bold text-gray-900">{dias} dias</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(profile!.plano_expira_em!).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </p>

                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                  <div
                    className={`h-1.5 rounded-full transition-all ${dias < 7 ? 'bg-red-500' : dias < 15 ? 'bg-amber-400' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (dias / 30) * 100)}%` }}
                  />
                </div>

                {dias < 7 && (
                  <p className="text-xs text-red-500 mt-2 font-medium">
                    Seu plano expira em breve — renove para nao perder o acesso.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2 text-left mb-6">
              {['Transacoes ilimitadas', 'Relatorios com IA', 'Metas avancadas', 'Suporte prioritario'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500 font-bold">✓</span>
                  {f}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              
                <a href="/dashboard"
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm text-center hover:bg-green-700 transition"
              >
                Ir para o dashboard
              </a>
              {dias !== null && dias < 15 && (
                <button
                  onClick={() => assinar('mensal')}
                  className="flex-1 border border-green-600 text-green-600 py-2.5 rounded-lg font-medium text-sm hover:bg-green-50 transition"
                >
                  Renovar plano
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Usuário free — mostra os planos
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade para Pro</h1>
          <p className="text-gray-500">Desbloqueie relatorios com IA e muito mais</p>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="bg-white rounded-xl border p-6 flex flex-col">
            <p className="text-sm text-gray-500 mb-1">Plano mensal</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">R$ 19,90</p>
            <p className="text-xs text-gray-400 mb-6">por mes · cancela quando quiser</p>
            <ul className="text-sm text-gray-600 space-y-2 mb-8 flex-1">
              <li>+ Transacoes ilimitadas</li>
              <li>+ Relatorios com IA</li>
              <li>+ Metas avancadas</li>
              <li>+ Suporte prioritario</li>
            </ul>
            <button
              onClick={() => assinar('mensal')}
              disabled={loading !== null || !userId}
              className="w-full border-2 border-green-600 text-green-600 py-2 rounded-lg font-medium hover:bg-green-50 transition disabled:opacity-50"
            >
              {loading === 'mensal' ? 'Aguarde...' : 'Assinar mensal'}
            </button>
          </div>

          <div className="bg-white rounded-xl border-2 border-green-600 p-6 relative flex flex-col">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">
              Melhor valor
            </span>
            <p className="text-sm text-gray-500 mb-1">Plano anual</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">R$ 159,00</p>
            <p className="text-xs text-green-600 font-medium mb-6">economize R$ 79,80 por ano</p>
            <ul className="text-sm text-gray-600 space-y-2 mb-8 flex-1">
              <li>+ Tudo do plano mensal</li>
              <li>+ 2 meses gratis</li>
              <li>+ Acesso antecipado</li>
              <li>+ Suporte VIP</li>
            </ul>
            <button
              onClick={() => assinar('anual')}
              disabled={loading !== null || !userId}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading === 'anual' ? 'Aguarde...' : 'Assinar anual'}
            </button>
          </div>

        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Pagamento seguro via Pix ou cartao. Cancele quando quiser.
        </p>
      </div>
    </div>
  )
}