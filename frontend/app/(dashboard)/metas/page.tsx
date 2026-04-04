'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { usePlano } from '@/hooks/usePlano'
import Header from '@/components/header'

type Meta = {
  id: string
  categoria: string
  limite: number
  mes: number
  ano: number
}

type Transacao = {
  categoria: string
  valor: number
  tipo: string
  data: string
}

const categorias = [
  'Alimentacao', 'Transporte', 'Moradia',
  'Saude', 'Lazer', 'Outros'
]

export default function Metas() {
  const [metas, setMetas] = useState<Meta[]>([])
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [showForm, setShowForm] = useState(false)
  const [categoria, setCategoria] = useState('')
  const [limite, setLimite] = useState('')
  const [salvando, setSalvando] = useState(false)
  const supabase = createClient()
  const { isPro } = usePlano()

  const mesAtual = new Date().getMonth() + 1
  const anoAtual = new Date().getFullYear()
  const nomeMes = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  useEffect(() => {
    async function carregar() {
      const { data: metasData } = await supabase
        .from('metas')
        .select('*')
        .eq('mes', mesAtual)
        .eq('ano', anoAtual)

      const { data: transacoesData } = await supabase
        .from('transacoes')
        .select('categoria, valor, tipo, data')
        .eq('tipo', 'despesa')

      setMetas(metasData || [])
      setTransacoes(transacoesData || [])
    }
    carregar()
  }, [])

  async function salvarMeta(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)

    const { data: { user } } = await supabase.auth.getUser()

    // Verifica se já existe meta para essa categoria nesse mês
    const existente = metas.find(m => m.categoria === categoria)

    if (existente) {
      await supabase
        .from('metas')
        .update({ limite: parseFloat(limite) })
        .eq('id', existente.id)
    } else {
      await supabase.from('metas').insert({
        user_id: user?.id,
        categoria,
        limite: parseFloat(limite),
        mes: mesAtual,
        ano: anoAtual
      })
    }

    const { data: metasData } = await supabase
      .from('metas')
      .select('*')
      .eq('mes', mesAtual)
      .eq('ano', anoAtual)

    setMetas(metasData || [])
    setShowForm(false)
    setCategoria('')
    setLimite('')
    setSalvando(false)
  }

  async function deletarMeta(id: string) {
    await supabase.from('metas').delete().eq('id', id)
    setMetas(metas.filter(m => m.id !== id))
  }

  function gastoCategoria(cat: string) {
    return transacoes
      .filter(t => {
        const d = new Date(t.data)
        return t.categoria === cat &&
          d.getMonth() + 1 === mesAtual &&
          d.getFullYear() === anoAtual
      })
      .reduce((acc, t) => acc + Number(t.valor), 0)
  }

  const totalLimites = metas.reduce((acc, m) => acc + Number(m.limite), 0)
  const totalGasto = metas.reduce((acc, m) => acc + gastoCategoria(m.categoria), 0)

  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <Header />

    <div className="max-w-2xl mx-auto p-4 md:p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Metas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{nomeMes}</p>
        </div>
        
        {isPro ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm ${
              showForm 
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {showForm ? 'Cancelar' : '+ Nova meta'}
          </button>
        ) : (
          <a href="/upgrade"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-purple-700 transition shadow-md"
          >
            🔒 Desbloqueie as metas — Seja PRO
          </a>
        )}   
      </div>

      {/* Resumo geral */}
      {metas.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6 shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orçamento total do mês</span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
              R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ {totalLimites.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalGasto / totalLimites > 0.9 ? 'bg-red-500' :
                totalGasto / totalLimites > 0.7 ? 'bg-amber-400' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, (totalGasto / totalLimites) * 100)}%` }}
            />
          </div>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-3">
            R$ {(totalLimites - totalGasto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} restantes no mês
          </p>
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Nova meta</h2>
          <form onSubmit={salvarMeta} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
              <select
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                required
                className="mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="">Selecione...</option>
                {categorias.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Limite mensal (R$)</label>
              <input
                type="number"
                step="0.01"
                value={limite}
                onChange={e => setLimite(e.target.value)}
                required
                className="mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
                placeholder="Ex: 500,00"
              />
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 shadow-md mt-2"
            >
              {salvando ? 'Salvando...' : 'Salvar meta'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de metas */}
      <div className="flex flex-col gap-4">
        {metas.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-10 text-center shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Nenhuma meta definida para este mês.</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 italic">Crie metas para controlar seus gastos por categoria.</p>
          </div>
        ) : (
          metas.map(meta => {
            const gasto = gastoCategoria(meta.categoria)
            const pct = Math.min(100, (gasto / meta.limite) * 100)
            const cor = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-400' : 'bg-green-500'
            const corTexto = pct > 90 ? 'text-red-500' : pct > 70 ? 'text-amber-500' : 'text-green-600 dark:text-green-500'
            const restante = meta.limite - gasto

            return (
              <div key={meta.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{meta.categoria}</p>
                    <p className={`text-xs font-semibold mt-1 uppercase tracking-tight ${corTexto}`}>
                      {pct > 90 ? 'Limite quase atingido!' :
                       pct > 70 ? 'Atenção com os gastos' : 'Dentro do limite'}
                    </p>
                  </div>
                  <button
                    onClick={() => deletarMeta(meta.id)}
                    className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors text-[10px] font-bold uppercase tracking-widest"
                  >
                    Remover
                  </button>
                </div>

                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${cor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="flex flex-col">
                    <span className="text-gray-400 dark:text-gray-500 uppercase font-medium">Gasto</span>
                    <span className="text-gray-700 dark:text-gray-300 font-bold">R$ {gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 dark:text-gray-500 uppercase font-medium">Restante</span>
                    <span className={`font-bold ${restante >= 0 ? 'text-gray-700 dark:text-gray-300' : 'text-red-500'}`}>
                       {restante >= 0
                        ? `R$ ${restante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : `R$ ${Math.abs(restante).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} acima`}
                    </span>
                  </div>
                  <div className="flex flex-col col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-2 sm:pt-0 mt-1 sm:mt-0">
                    <span className="text-gray-400 dark:text-gray-500 uppercase font-medium">Limite total</span>
                    <span className="text-gray-700 dark:text-gray-300 font-bold">R$ {Number(meta.limite).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  </div>
  )
}