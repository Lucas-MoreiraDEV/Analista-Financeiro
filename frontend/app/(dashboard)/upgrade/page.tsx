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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">Carregando informações...</p>
      </div>
    </div>
  )
}

// Usuário já é Pro
if (isPro) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />
      <div className="max-w-lg mx-auto p-6 pt-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-green-500 p-8 text-center shadow-xl shadow-green-500/5">

          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-4xl text-green-600 dark:text-green-400">✓</span>
          </div>

          <div className="inline-block bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-[10px] font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
            Plano Pro Ativo
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
            Você já é Pro!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Você tem acesso completo a todos os recursos premium do FinanceApp.
          </p>

          {dias !== null && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 mb-8 border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">Seu plano expira em</p>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100">{dias} dias</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                Válido até {new Date(profile!.plano_expira_em!).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </p>

              {/* Barra de progresso */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${dias < 7 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : dias < 15 ? 'bg-amber-400' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}
                  style={{ width: `${Math.min(100, (dias / 30) * 100)}%` }}
                />
              </div>

              {dias < 7 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400 font-bold">
                    ⚠️ Atenção: Seu plano expira em breve — renove para não perder o acesso.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-left mb-8">
            {['Transações ilimitadas', 'Relatórios com IA', 'Metas avançadas', 'Suporte prioritário'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                <span className="text-green-500">✓</span>
                {f}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
              <a href="/dashboard"
              className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-3 rounded-xl font-bold text-sm text-center hover:opacity-90 transition shadow-lg active:scale-95"
            >
              Ir para o Dashboard
            </a>
            {dias !== null && dias < 15 && (
              <button
                onClick={() => assinar('mensal')}
                className="flex-1 border-2 border-green-600 text-green-600 dark:text-green-400 py-3 rounded-xl font-bold text-sm hover:bg-green-50 dark:hover:bg-green-950/30 transition active:scale-95"
              >
                Renovar Plano
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Usuário Free — mostra os planos
return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <Header />

    <div className="max-w-4xl mx-auto p-6 lg:py-12">
      <div className="text-center mb-12">
        <span className="inline-block bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-[10px] font-black px-3 py-1 rounded-full mb-4 uppercase tracking-[0.2em]">
          Upgrade de Conta
        </span>
        <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 mb-3 tracking-tight">Evolua para o Pro</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-lg">
          Desbloqueie relatórios com IA, metas ilimitadas e controle total.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

        {/* Plano Mensal */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Plano Mensal</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">R$</span>
            <span className="text-4xl font-black text-gray-900 dark:text-gray-100">19,90</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-8 font-medium">Por mês • Cancele quando quiser</p>
          
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-4 mb-8 flex-1">
            {['Transações ilimitadas', 'Relatórios com IA', 'Metas avançadas', 'Suporte prioritário'].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-5 h-5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center text-[10px] font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={() => assinar('mensal')}
            disabled={loading !== null || !userId}
            className="w-full border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 py-3 rounded-xl font-bold hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading === 'mensal' ? 'Processando...' : 'Assinar Mensal'}
          </button>
        </div>

        {/* Plano Anual - Destaque */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border-4 border-green-500 p-8 relative flex flex-col shadow-2xl shadow-green-500/10 scale-105">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
            Melhor Custo-Benefício
          </div>
          
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest">Plano Anual</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">R$</span>
            <span className="text-5xl font-black text-gray-900 dark:text-gray-100">159,00</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 font-black mb-8 uppercase tracking-tight">Economize R$ 79,80 por ano</p>
          
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-4 mb-8 flex-1 font-medium">
            <li className="flex items-center gap-3 font-bold text-gray-900 dark:text-gray-100">
              <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
              Tudo do plano mensal
            </li>
            {['2 meses grátis', 'Acesso antecipado', 'Suporte VIP 24h'].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={() => assinar('anual')}
            disabled={loading !== null || !userId}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 active:scale-95 disabled:opacity-50"
          >
            {loading === 'anual' ? 'Processando...' : 'Assinar Anual'}
          </button>
        </div>

      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6 opacity-40 dark:opacity-20 grayscale">
          <span className="text-xs font-bold tracking-tighter">PIX</span>
          <span className="text-xs font-bold tracking-tighter">VISA</span>
          <span className="text-xs font-bold tracking-tighter">MASTERCARD</span>
        </div>
        <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-widest">
          Pagamento seguro com criptografia de 256 bits. Cancele online a qualquer momento.
        </p>
      </div>
    </div>
  </div>
)
}