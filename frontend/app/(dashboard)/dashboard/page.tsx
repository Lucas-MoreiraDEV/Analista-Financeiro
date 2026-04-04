'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import { calcularComparativo } from '@/lib/comparativo'
import ComparativoMesCard from '@/components/comparativomes'

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
  const [userName, setUserName] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserName(user.email?.split('@')[0] || '')

      const { data } = await supabase
        .from('transacoes')
        .select('*')
        .order('data', { ascending: false })

      setTransacoes(data || [])
      setLoading(false)
    }
    carregar()
  }, [])

  // Cálculos de Resumo
  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const saldo = totalReceitas - totalDespesas

  // Cálculos por Categoria
  const porCategoria = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + Number(t.valor)
      return acc
    }, {} as Record<string, number>)

  const categoriasSorted = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])
  const maxCategoria = categoriasSorted[0]?.[1] || 1

  // Gráfico de 6 meses
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return { 
      label: d.toLocaleString('pt-BR', { month: 'short' }), 
      mes: d.getMonth(), 
      ano: d.getFullYear() 
    }
  })

  const dadosMensais = meses.map(m => {
    const rec = transacoes
      .filter(t => { 
        const d = new Date(t.data); 
        return t.tipo === 'receita' && d.getUTCMonth() === m.mes && d.getUTCFullYear() === m.ano 
      })
      .reduce((acc, t) => acc + Number(t.valor), 0)
    
    const desp = transacoes
      .filter(t => { 
        const d = new Date(t.data); 
        return t.tipo === 'despesa' && d.getUTCMonth() === m.mes && d.getUTCFullYear() === m.ano 
      })
      .reduce((acc, t) => acc + Number(t.valor), 0)
    
    return { ...m, rec, desp }
  })

  const maxMensal = Math.max(...dadosMensais.flatMap(m => [m.rec, m.desp]), 1)
  const ultimasTransacoes = transacoes.slice(0, 5)

  // Comparativo
  const comparativo = calcularComparativo(transacoes)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Saldo atual</p>
            <p className={`text-3xl font-bold truncate ${saldo >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-500'}`}>
              R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Total receitas</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-500 truncate">R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Total despesas</p>
            <p className="text-3xl font-bold text-red-500 truncate">R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Meio: Gráfico vs Saúde */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-6 font-bold uppercase tracking-tight">Receitas vs. Despesas (6 meses)</h2>
            <div className="flex items-end gap-2 sm:gap-4 h-40">
              {dadosMensais.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 items-end h-[100px]">
                    <div 
                      className="flex-1 bg-green-500/20 dark:bg-green-500/30 border-t-2 border-green-500 rounded-t-sm transition-all duration-500" 
                      style={{ height: `${(m.rec / maxMensal) * 100}%`, minHeight: m.rec > 0 ? '4px' : '0' }} 
                    />
                    <div 
                      className="flex-1 bg-red-500/20 dark:bg-red-500/30 border-t-2 border-red-500 rounded-t-sm transition-all duration-500" 
                      style={{ height: `${(m.desp / maxMensal) * 100}%`, minHeight: m.desp > 0 ? '4px' : '0' }} 
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 font-bold uppercase tracking-tight">Saúde financeira</h2>
            {totalReceitas === 0 ? (
              <p className="text-xs text-gray-400 italic">Adicione transações para ver sua saúde financeira.</p>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Comprometido</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                      {Math.min(100, Math.round((totalDespesas / totalReceitas) * 100))}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${(totalDespesas / totalReceitas) > 0.8 ? 'bg-red-500' : (totalDespesas / totalReceitas) > 0.6 ? 'bg-amber-400' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, (totalDespesas / totalReceitas) * 100)}%` }}
                    />
                  </div>
                </div>
                <p className={`text-sm font-bold ${(totalDespesas / totalReceitas) > 0.8 ? 'text-red-500' : (totalDespesas / totalReceitas) > 0.6 ? 'text-amber-500' : 'text-green-600'}`}>
                  {(totalDespesas / totalReceitas) > 0.8 ? 'Atenção: gastos altos' : (totalDespesas / totalReceitas) > 0.6 ? 'Moderado' : 'Finanças saudáveis'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Últimas Transações vs Coluna Lateral (Comparativo + Categorias) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Tabela de Transações */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm h-fit">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 font-bold uppercase tracking-tight">Últimas transações</h2>
              <a href="/transacoes" className="text-xs font-medium text-green-600 dark:text-green-500 hover:text-green-700">Ver todas</a>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {ultimasTransacoes.map(t => (
                <div key={t.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${t.tipo === 'receita' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t.categoria}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.descricao || 'Sem descrição'} • {new Date(t.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${t.tipo === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                    {t.tipo === 'receita' ? '+' : '-'} R$ {Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna Direita: Comparativo e Categorias */}
          <div className="flex flex-col gap-6">
            {/* O Comparativo Mensal restaurado aqui */}
            <ComparativoMesCard dados={comparativo} />

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-5 font-bold uppercase tracking-tight">Gastos por categoria</h2>
              <div className="flex flex-col gap-4">
                {categoriasSorted.slice(0, 5).map(([cat, val]) => (
                  <div key={cat} className="group">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">{cat}</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-red-500/80" style={{ width: `${(val / maxCategoria) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}