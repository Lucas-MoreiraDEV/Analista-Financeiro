'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { usePlano } from '@/hooks/usePlano'

type Transacao = {
  tipo: 'receita' | 'despesa'
  valor: number
  categoria: string
  descricao: string
  data: string
}


type Meta = {
  categoria: string
  limite: number
}

export default function Relatorios() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [metas, setMetas] = useState<Meta[]>([])
  const [insights, setInsights] = useState('')
  const [loading, setLoading] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const supabase = createClient()
  const { isPro } = usePlano()

  useEffect(() => {
    async function carregar() {
      const { data: t } = await supabase
        .from('transacoes')
        .select('*')
        .order('data', { ascending: false })

      const { data: m } = await supabase
        .from('metas')
        .select('categoria, limite')

      setTransacoes(t || [])
      setMetas(m || [])
      setCarregando(false)
    }
    carregar()
  }, [])

  async function gerarInsights() {
    setLoading(true)
    setInsights('')

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transacoes, metas })
      })

      const data = await res.json()

      if (data.error) {
        setInsights('Erro ao gerar insights. Verifique sua API key.')
      } else {
        setInsights(data.insights)
      }
    } catch {
      setInsights('Erro de conexao. Tente novamente.')
    }

    setLoading(false)
  }

  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const porCategoria = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + Number(t.valor)
      return acc
    }, {} as Record<string, number>)

  const categoriasSorted = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex items-center gap-6">
        <h1 className="text-lg font-bold text-green-600">FinanceApp</h1>
        <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-700">Dashboard</a>
        <a href="/transacoes" className="text-sm text-gray-400 hover:text-gray-700">Transacoes</a>
        <a href="/metas" className="text-sm text-gray-400 hover:text-gray-700">Metas</a>
        <a href="/relatorios" className="text-sm text-gray-700 font-medium">Relatorios IA</a>
      </nav>

      <div className="max-w-2xl mx-auto p-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Relatorios com IA</h1>
          <p className="text-sm text-gray-400 mt-1">
            Analise personalizada das suas financas gerada pelo Claude
          </p>
        </div>

        {/* Resumo rapido */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-400 mb-1">Receitas</p>
            <p className="text-lg font-bold text-green-600">R$ {totalReceitas.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-400 mb-1">Despesas</p>
            <p className="text-lg font-bold text-red-500">R$ {totalDespesas.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-400 mb-1">Saldo</p>
            <p className={`text-lg font-bold ${totalReceitas - totalDespesas >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              R$ {(totalReceitas - totalDespesas).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Maiores gastos */}
        {categoriasSorted.length > 0 && (
          <div className="bg-white rounded-xl border p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Maiores gastos</h2>
            <div className="flex flex-col gap-3">
              {categoriasSorted.slice(0, 4).map(([cat, val]) => (
                <div key={cat} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{cat}</span>
                  <span className="text-sm font-medium text-red-500">R$ {val.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botao gerar insights */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Insights personalizados</h2>
              <p className="text-xs text-gray-400 mt-1">
                O Claude vai analisar suas {transacoes.length} transacoes e gerar recomendacoes
              </p>
            </div>
            <span className="text-xs bg-purple-50 text-purple-600 font-medium px-2 py-1 rounded-full">
              Pro
            </span>
          </div>

          {isPro ? (
            <button
              onClick={gerarInsights}
              disabled={loading || carregando || transacoes.length === 0}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analisando suas financas...' :
              transacoes.length === 0 ? 'Adicione transacoes primeiro' :
              'Gerar insights com IA'}
            </button>
          ) : (
            
              <a href="/upgrade"
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              🔒 Desbloqueie a IA — Seja PRO
            </a>
          )}
        </div>

        {/* Resultado dos insights */}
        {insights && (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Analise do seu status
            </h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {insights}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}