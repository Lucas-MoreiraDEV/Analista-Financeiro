'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '@/components/header'

// IDs das ofertas do Kirvano
const OFERTAS = {
  mensal: {
    id: '4059c2cc-c634-4331-a857-0b2fe51d6705', // offer_id do produto mensal
    baseUrl: 'https://pay.kirvano.com/4059c2cc-c634-4331-a857-0b2fe51d6705'
  },
  anual: {
    id: 'SEU-OFFER-ID-ANUAL',
    baseUrl: 'https://pay.kirvano.com/SEU-CHECKOUT-ID-ANUAL'
  }
}

export default function Upgrade() {
  const [loading, setLoading] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    async function carregarUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    carregarUser()
  }, [])

  function assinar(plano: 'mensal' | 'anual') {
    setLoading(plano)
    const oferta = OFERTAS[plano]

    // Passa o user_id via UTM — o Kirvano devolve no webhook
    const url = `${oferta.baseUrl}?utm_source=${userId}&utm_medium=${plano}`
    window.location.href = url
  }

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