'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import { calcularComparativo } from '@/lib/comparativo'
import ComparativoMesCard from '@/components/comparativomes'
import { calcularEvolucao } from '@/lib/evolucao'
import EvolucaoPatrimonial from '@/components/EvolucaoPatrimonial'
import { calcularProjecao } from '@/lib/projecao'
import ProjecaoMesCard from '@/components/ProjecaoMes'

type Transacao = {
  id: string
  tipo: 'receita' | 'despesa'
  valor: number
  categoria: string
  descricao: string
  data: string
}

export default function Dashboard() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('transacoes')
        .select('*')
        .order('data', { ascending: false })
      setTransacoes(data || [])
      setLoading(false)
    }
    carregar()
  }, [])

  const totalReceitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + Number(t.valor), 0)
  const totalDespesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + Number(t.valor), 0)
  const saldo = totalReceitas - totalDespesas

  const porCategoria = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => { acc[t.categoria] = (acc[t.categoria] || 0) + Number(t.valor); return acc }, {} as Record<string, number>)
  const categoriasSorted = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])
  const maxCategoria = categoriasSorted[0]?.[1] || 1

  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i))
    return { label: d.toLocaleString('pt-BR', { month: 'short' }), mes: d.getMonth(), ano: d.getFullYear() }
  })

  const dadosMensais = meses.map(m => {
    const rec = transacoes.filter(t => { const d = new Date(t.data); return t.tipo === 'receita' && d.getUTCMonth() === m.mes && d.getUTCFullYear() === m.ano }).reduce((acc, t) => acc + Number(t.valor), 0)
    const desp = transacoes.filter(t => { const d = new Date(t.data); return t.tipo === 'despesa' && d.getUTCMonth() === m.mes && d.getUTCFullYear() === m.ano }).reduce((acc, t) => acc + Number(t.valor), 0)
    return { ...m, rec, desp }
  })

  const maxMensal = Math.max(...dadosMensais.flatMap(m => [m.rec, m.desp]), 1)
  const ultimasTransacoes = transacoes.slice(0, 5)

  const comparativo = calcularComparativo(transacoes)
  const evolucao = calcularEvolucao(transacoes)
  const projecao = calcularProjecao(transacoes)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

        {/* LINHA 1 — Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Saldo atual</p>
            <p className={`text-2xl sm:text-3xl font-bold truncate ${saldo >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-500'}`}>
              {saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-xs text-gray-400 mt-1">{transacoes.length} transacoes</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Total receitas</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-500 truncate">
              {totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-xs text-gray-400 mt-1">{transacoes.filter(t => t.tipo === 'receita').length} lancamentos</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Total despesas</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-500 truncate">
              {totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-xs text-gray-400 mt-1">{transacoes.filter(t => t.tipo === 'despesa').length} lancamentos</p>
          </div>
        </div>

        {/* LINHA 2 — Grafico 6 meses + Saude financeira */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 shadow-sm">
            <h2 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-tight">Receitas vs Despesas (6 meses)</h2>
            <div className="flex items-end gap-2 sm:gap-4 h-32 sm:h-40">
              {dadosMensais.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-0.5 sm:gap-1 items-end h-[80px] sm:h-[100px]">
                    <div className="flex-1 bg-green-500/20 dark:bg-green-500/30 border-t-2 border-green-500 rounded-t-sm transition-all duration-500" style={{ height: `${(m.rec / maxMensal) * 100}%`, minHeight: m.rec > 0 ? '4px' : '0' }} />
                    <div className="flex-1 bg-red-500/20 dark:bg-red-500/30 border-t-2 border-red-500 rounded-t-sm transition-all duration-500" style={{ height: `${(m.desp / maxMensal) * 100}%`, minHeight: m.desp > 0 ? '4px' : '0' }} />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-medium text-gray-400 uppercase">{m.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-green-500/30 border-t border-green-500" /><span className="text-xs text-gray-400">Receitas</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-red-500/30 border-t border-red-500" /><span className="text-xs text-gray-400">Despesas</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 shadow-sm">
            <h2 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-tight">Saude financeira</h2>
            {totalReceitas === 0 ? (
              <p className="text-xs text-gray-400 italic">Adicione transacoes para ver sua saude financeira.</p>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Comprometido</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{Math.min(100, Math.round((totalDespesas / totalReceitas) * 100))}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${(totalDespesas / totalReceitas) > 0.8 ? 'bg-red-500' : (totalDespesas / totalReceitas) > 0.6 ? 'bg-amber-400' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (totalDespesas / totalReceitas) * 100)}%` }} />
                  </div>
                </div>
                <p className={`text-sm font-bold ${(totalDespesas / totalReceitas) > 0.8 ? 'text-red-500' : (totalDespesas / totalReceitas) > 0.6 ? 'text-amber-500' : 'text-green-600'}`}>
                  {(totalDespesas / totalReceitas) > 0.8 ? 'Atencao: gastos altos' : (totalDespesas / totalReceitas) > 0.6 ? 'Moderado' : 'Financas saudaveis'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Gastando {Math.round((totalDespesas / totalReceitas) * 100)}% da renda
                </p>
              </>
            )}
          </div>
        </div>

        {/* LINHA 3 — Evolucao patrimonial + Projecao */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <EvolucaoPatrimonial dados={evolucao} />
          </div>
          <div>
            <ProjecaoMesCard dados={projecao} />
          </div>
        </div>

        {/* LINHA 4 — Ultimas transacoes + Comparativo + Categorias */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="flex justify-between items-center px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">Ultimas transacoes</h2>
              <a href="/transacoes" className="text-xs font-medium text-green-600 dark:text-green-500 hover:underline">Ver todas</a>
            </div>
            {ultimasTransacoes.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Nenhuma transacao ainda</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {ultimasTransacoes.map(t => (
                  <div key={t.id} className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{t.categoria}</p>
                        <p className="text-xs text-gray-400 truncate">{t.descricao || 'Sem descricao'} · {new Date(t.data).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold flex-shrink-0 ml-2 ${t.tipo === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      {t.tipo === 'receita' ? '+' : '-'} {Number(t.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <ComparativoMesCard dados={comparativo} />
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 shadow-sm">
              <h2 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-tight">Gastos por categoria</h2>
              {categoriasSorted.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Nenhuma despesa ainda.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {categoriasSorted.slice(0, 5).map(([cat, val]) => (
                    <div key={cat}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{cat}</span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-red-400" style={{ width: `${(val / maxCategoria) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}