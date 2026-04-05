'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '@/components/header'

type Profile = {
  email: string
  plano: string
  plano_expira_em: string | null
  kirvano_order_id: string | null
  created_at: string
}

export default function Perfil() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('email, plano, plano_expira_em, kirvano_order_id, created_at')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }
    carregar()
  }, [])

  function diasRestantes(): number | null {
    if (!profile?.plano_expira_em) return null
    const diff = new Date(profile.plano_expira_em).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  function formatarData(data: string | null) {
    if (!data) return '—'
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
  }

  const isPro = profile?.plano === 'pro'
  const dias = diasRestantes()
  const iniciais = profile?.email?.slice(0, 2).toUpperCase() || 'U'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

        {/* Cabeçalho do perfil */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">

            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 dark:bg-green-900 border-2 border-green-200 dark:border-green-700 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                {iniciais}
              </span>
            </div>

            {/* Informações */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {profile?.email?.split('@')[0]}
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {profile?.email}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                  isPro
                    ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isPro ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {isPro ? 'Plano Pro' : 'Plano Free'}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  desde {formatarData(profile?.created_at || null)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status do plano */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
          <h2 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight mb-4">
            Status do plano
          </h2>

          {isPro ? (
            <div className="space-y-4">
              {/* Plano ativo */}
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/50 rounded-xl border border-green-100 dark:border-green-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-lg">✅</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-700 dark:text-green-400">Pro ativo</p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                      Acesso completo a todos os recursos
                    </p>
                  </div>
                </div>
              </div>

              {/* Dias restantes */}
              {dias !== null && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Expira em {formatarData(profile?.plano_expira_em || null)}
                    </span>
                    <span className={`text-xs font-bold ${
                      dias < 7 ? 'text-red-500' :
                      dias < 15 ? 'text-amber-500' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {dias} dias restantes
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        dias < 7 ? 'bg-red-500' :
                        dias < 15 ? 'bg-amber-400' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (dias / 30) * 100)}%` }}
                    />
                  </div>
                  {dias < 7 && (
                    <p className="text-xs text-red-500 mt-2 font-medium">
                      ⚠️ Seu plano expira em breve — renove para não perder o acesso.
                    </p>
                  )}
                </div>
              )}

              {/* Recursos ativos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { ico: '🤖', label: 'Relatórios com IA' },
                  { ico: '📄', label: 'Exportar PDF' },
                  { ico: '📊', label: 'Projeção financeira' },
                  { ico: '♾️', label: 'Lançamentos ilimitados' },
                  { ico: '🎯', label: 'Metas avançadas' },
                  { ico: '⚡', label: 'Suporte prioritário' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-base">{r.ico}</span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* Botão renovar */}
              {dias !== null && dias < 15 && (
                <a
                  href="/upgrade"
                  className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-3 rounded-xl transition"
                >
                  🔄 Renovar plano Pro
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Free */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-lg">🆓</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Plano Free</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Até 50 lançamentos por mês
                    </p>
                  </div>
                </div>
              </div>

              {/* Recursos bloqueados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { ico: '🔒', label: 'Relatórios com IA' },
                  { ico: '🔒', label: 'Exportar PDF' },
                  { ico: '🔒', label: 'Projeção financeira' },
                  { ico: '🔒', label: 'Lançamentos ilimitados' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg opacity-50">
                    <span className="text-base">{r.ico}</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-500 line-through">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA upgrade */}
              <a
                href="/upgrade"
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-3 rounded-xl transition"
              >
                ⚡ Fazer upgrade para Pro — R$ 19,90/mês
              </a>
            </div>
          )}
        </div>

        {/* Informações da conta */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
          <h2 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight mb-4">
            Informações da conta
          </h2>
          <div className="space-y-3">
            {[
              { label: 'E-mail', valor: profile?.email || '—' },
              { label: 'Plano atual', valor: isPro ? 'Pro' : 'Free' },
              { label: 'Membro desde', valor: formatarData(profile?.created_at || null) },
              { label: 'ID do pedido', valor: profile?.kirvano_order_id || '—' },
            ].map((info, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 gap-1 sm:gap-0">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  {info.label}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-right">
                  {info.valor}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Zona de perigo */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-100 dark:border-red-900/30 p-5 sm:p-6 shadow-sm">
          <h2 className="text-xs sm:text-sm font-bold text-red-500 uppercase tracking-tight mb-4">
            Zona de perigo
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sair da conta</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Encerra a sessão atual no dispositivo
              </p>
            </div>
            <button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                window.location.href = '/login'
              }}
              className="w-full sm:w-auto px-5 py-2.5 border border-red-200 dark:border-red-800 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition"
            >
              Sair
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}