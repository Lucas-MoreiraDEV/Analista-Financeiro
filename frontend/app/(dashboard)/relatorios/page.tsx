'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { usePlano } from '@/hooks/usePlano'
import Header from '@/components/header'

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
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <Header />

    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Relatórios com IA</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Análise personalizada das suas finanças gerada por inteligência artificial.
        </p>
      </div>

      {/* Resumo rápido - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1 uppercase">Receitas</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-500">
            R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1 uppercase">Despesas</p>
          <p className="text-lg font-bold text-red-500">
            R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1 uppercase">Saldo</p>
          <p className={`text-lg font-bold ${totalReceitas - totalDespesas >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-500'}`}>
            R$ {(totalReceitas - totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Maiores gastos */}
      {categoriasSorted.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-500 rounded-full" />
            Maiores gastos por categoria
          </h2>
          <div className="flex flex-col gap-3">
            {categoriasSorted.slice(0, 4).map(([cat, val]) => (
              <div key={cat} className="flex justify-between items-center group">
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">{cat}</span>
                <span className="text-sm font-bold text-red-500">R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão gerar insights */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm ring-1 ring-purple-500/10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Insights inteligentes</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              A IA analisará suas {transacoes.length} transações para sugerir economias e hábitos saudáveis.
            </p>
          </div>
          <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-bold px-2 py-1 rounded uppercase tracking-wider">
            Pro
          </span>
        </div>

        {isPro ? (
          <button
            onClick={gerarInsights}
            disabled={loading || carregando || transacoes.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analisando suas finanças...
              </span>
            ) : transacoes.length === 0 ? (
              'Adicione transações primeiro'
            ) : (
              'Gerar insights com IA'
            )}
          </button>
        ) : (
          <a href="/upgrade"
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-500/20 active:scale-[0.98]"
          >
            🔒 Desbloqueie a IA — Seja PRO
          </a>
        )}
      </div>

      {/* Resultado dos insights */}
      {insights && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-purple-200 dark:border-purple-900/30 p-6 shadow-lg shadow-purple-500/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Análise do seu status financeiro
            </h2>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line border-t dark:border-gray-800 pt-4">
            {insights}
          </div>
        </div>
      )}

    </div>
  </div>
)
}