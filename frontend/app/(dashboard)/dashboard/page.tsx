'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'

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

  async function sair() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const saldo = totalReceitas - totalDespesas

  // Gastos por categoria
  const porCategoria = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + Number(t.valor)
      return acc
    }, {} as Record<string, number>)

  const categoriasSorted = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])

  const maxCategoria = categoriasSorted[0]?.[1] || 1

  // Ultimos 6 meses
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
        const d = new Date(t.data)
        return t.tipo === 'receita' && d.getMonth() === m.mes && d.getFullYear() === m.ano
      })
      .reduce((acc, t) => acc + Number(t.valor), 0)

    const desp = transacoes
      .filter(t => {
        const d = new Date(t.data)
        return t.tipo === 'despesa' && d.getMonth() === m.mes && d.getFullYear() === m.ano
      })
      .reduce((acc, t) => acc + Number(t.valor), 0)

    return { ...m, rec, desp }
  })

  const maxMensal = Math.max(...dadosMensais.flatMap(m => [m.rec, m.desp]), 1)

  const ultimasTransacoes = transacoes.slice(0, 5)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <Header />

      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">

        {/* Cards principais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-5">
            <p className="text-xs text-gray-400 mb-1">Saldo atual</p>
            <p className={`text-3xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              R$ {saldo.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-2">{transacoes.length} transacoes no total</p>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <p className="text-xs text-gray-400 mb-1">Total receitas</p>
            <p className="text-3xl font-bold text-green-600">R$ {totalReceitas.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-2">
              {transacoes.filter(t => t.tipo === 'receita').length} lancamentos
            </p>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <p className="text-xs text-gray-400 mb-1">Total despesas</p>
            <p className="text-3xl font-bold text-red-500">R$ {totalDespesas.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-2">
              {transacoes.filter(t => t.tipo === 'despesa').length} lancamentos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Grafico de barras mensais */}
          <div className="col-span-1 md:col-span-2 bg-white rounded-xl border p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Receitas x Despesas (6 meses)</h2>
            <div className="flex items-end gap-3 h-36">
              {dadosMensais.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 items-end" style={{ height: '100px' }}>
                    <div
                      className="flex-1 bg-green-100 rounded-t"
                      style={{ height: `${(m.rec / maxMensal) * 100}%`, minHeight: m.rec > 0 ? '4px' : '0' }}
                    />
                    <div
                      className="flex-1 bg-red-100 rounded-t"
                      style={{ height: `${(m.desp / maxMensal) * 100}%`, minHeight: m.desp > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{m.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-100" />
                <span className="text-xs text-gray-400">Receitas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-100" />
                <span className="text-xs text-gray-400">Despesas</span>
              </div>
            </div>
          </div>

          {/* Saude financeira */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Saude financeira</h2>
            {totalReceitas === 0 ? (
              <p className="text-xs text-gray-400">Adicione transacoes para ver sua saude financeira.</p>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">Comprometido</span>
                    <span className="text-xs font-medium text-gray-700">
                      {Math.min(100, Math.round((totalDespesas / totalReceitas) * 100))}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (totalDespesas / totalReceitas) > 0.8 ? 'bg-red-500' :
                        (totalDespesas / totalReceitas) > 0.6 ? 'bg-amber-400' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (totalDespesas / totalReceitas) * 100)}%` }}
                    />
                  </div>
                </div>
                <p className={`text-sm font-medium ${
                  (totalDespesas / totalReceitas) > 0.8 ? 'text-red-500' :
                  (totalDespesas / totalReceitas) > 0.6 ? 'text-amber-500' : 'text-green-600'
                }`}>
                  {(totalDespesas / totalReceitas) > 0.8 ? 'Atencao: gastos altos' :
                   (totalDespesas / totalReceitas) > 0.6 ? 'Moderado' : 'Financas saudaveis'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Voce esta gastando {Math.round((totalDespesas / totalReceitas) * 100)}% da sua renda
                </p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Ultimas transacoes */}
          <div className="col-span-2 bg-white rounded-xl border overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b">
              <h2 className="text-sm font-semibold text-gray-700">Ultimas transacoes</h2>
              <a href="/transacoes" className="text-xs text-green-600 hover:underline">Ver todas</a>
            </div>
            {ultimasTransacoes.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Nenhuma transacao ainda</p>
            ) : (
              ultimasTransacoes.map(t => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3 border-b last:border-0 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.tipo === 'receita' ? 'bg-green-500' : 'bg-red-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.categoria}</p>
                      <p className="text-xs text-gray-400">{t.descricao || 'Sem descricao'} · {t.data}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.tipo === 'receita' ? '+' : '-'} R$ {Number(t.valor).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Gastos por categoria */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Gastos por categoria</h2>
            {categoriasSorted.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhuma despesa ainda.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {categoriasSorted.slice(0, 5).map(([cat, val]) => (
                  <div key={cat}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">{cat}</span>
                      <span className="text-xs font-medium text-gray-700">R$ {val.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-red-400"
                        style={{ width: `${(val / maxCategoria) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}