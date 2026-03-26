'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Upgrade() {
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()

  async function assinar(plano: 'mensal' | 'anual') {
    try {
      setLoading(plano)

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Você precisa estar logado')
        setLoading(null)
        return
      }

      const res = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plano,
          userId: user.id,
          email: user.email
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao gerar pagamento')
      }

      if (!data.url) {
        throw new Error('URL de pagamento não retornada')
      }

      // 🔥 redireciona
      window.location.href = data.url

    } catch (err: any) {
      alert(err.message)
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center gap-6">
        <h1 className="text-lg font-bold text-green-600">FinanceApp</h1>
        <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-700">Dashboard</a>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade para Pro</h1>
          <p className="text-gray-500">Desbloqueie relatorios com IA e muito mais</p>
        </div>

        <div className="grid grid-cols-2 gap-4">

          {/* Mensal */}
          <div className="bg-white rounded-xl border p-6 flex flex-col">
            <p className="text-sm text-gray-500 mb-1">Plano mensal</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">R$ 19,90</p>
            <p className="text-xs text-gray-400 mb-6">por mes</p>
            <ul className="text-sm text-gray-600 space-y-2 mb-8 flex-1">
              <li>+ Transacoes ilimitadas</li>
              <li>+ Relatorios com IA</li>
              <li>+ Metas avancadas</li>
              <li>+ Suporte prioritario</li>
            </ul>
            <button
              onClick={() => assinar('mensal')}
              disabled={loading !== null}
              className="w-full border-2 border-green-600 text-green-600 py-2 rounded-lg font-medium hover:bg-green-50 transition disabled:opacity-50"
            >
              {loading === 'mensal' ? 'Aguarde...' : 'Assinar mensal'}
            </button>
          </div>

          {/* Anual */}
          <div className="bg-white rounded-xl border-2 border-green-600 p-6 relative flex flex-col">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">
              Melhor valor
            </span>
            <p className="text-sm text-gray-500 mb-1">Plano anual</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">R$ 159,00</p>
            <p className="text-xs text-green-600 font-medium mb-6">economize R$ 79,80</p>
            <ul className="text-sm text-gray-600 space-y-2 mb-8 flex-1">
              <li>+ Tudo do plano mensal</li>
              <li>+ 2 meses gratis</li>
              <li>+ Acesso antecipado</li>
              <li>+ Suporte VIP</li>
            </ul>
            <button
              onClick={() => assinar('anual')}
              disabled={loading !== null}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading === 'anual' ? 'Aguarde...' : 'Assinar anual'}
            </button>
          </div>

        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Pagamento seguro via Pix. Cancele quando quiser.
        </p>
      </div>
    </div>
  )
}