'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { usePlano } from '@/hooks/usePlano'

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
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold text-green-600">FinanceApp</h1>
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-700">Dashboard</a>
          <a href="/transacoes" className="text-sm text-gray-400 hover:text-gray-700">Transações</a>
          <a href="/metas" className="text-sm text-gray-700 font-medium">Metas</a>
          <a href="/relatorios" className="text-sm text-gray-400 hover:text-gray-700">Relatorio IA</a>
          <a href="/upgrade" className="text-sm text-gray-400 hover:text-gray-700">Planos</a>

        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Metas</h1>
            <p className="text-sm text-gray-400 capitalize">{nomeMes}</p>
          </div>
          {isPro ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            {showForm ? 'Cancelar' : '+ Nova meta'}
          </button>) : (
              <a href="/upgrade"
              className="flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              🔒 Desbloqueie as metas — Seja PRO
            </a>
          )}   
        </div>

        {/* Resumo geral */}
        {metas.length > 0 && (
          <div className="bg-white rounded-xl border p-5 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Orcamento total do mes</span>
              <span className="text-sm font-medium text-gray-700">
                R$ {totalGasto.toFixed(2)} / R$ {totalLimites.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  totalGasto / totalLimites > 0.9 ? 'bg-red-500' :
                  totalGasto / totalLimites > 0.7 ? 'bg-amber-400' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (totalGasto / totalLimites) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              R$ {(totalLimites - totalGasto).toFixed(2)} restantes no mes
            </p>
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nova meta</h2>
            <form onSubmit={salvarMeta} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Categoria</label>
                <select
                  value={categoria}
                  onChange={e => setCategoria(e.target.value)}
                  required
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione...</option>
                  {categorias.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Limite mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={limite}
                  onChange={e => setLimite(e.target.value)}
                  required
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 500,00"
                />
              </div>

              <button
                type="submit"
                disabled={salvando}
                className="bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : 'Salvar meta'}
              </button>
            </form>
          </div>
        )}

        {/* Lista de metas */}
        <div className="flex flex-col gap-4">
          {metas.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center">
              <p className="text-gray-400 text-sm">Nenhuma meta definida para este mes.</p>
              <p className="text-gray-400 text-xs mt-1">Crie metas para controlar seus gastos por categoria.</p>
            </div>
          ) : (
            metas.map(meta => {
              const gasto = gastoCategoria(meta.categoria)
              const pct = Math.min(100, (gasto / meta.limite) * 100)
              const cor = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-400' : 'bg-green-500'
              const corTexto = pct > 90 ? 'text-red-500' : pct > 70 ? 'text-amber-500' : 'text-green-600'
              const restante = meta.limite - gasto

              return (
                <div key={meta.id} className="bg-white rounded-xl border p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{meta.categoria}</p>
                      <p className={`text-xs mt-0.5 ${corTexto}`}>
                        {pct > 90 ? 'Limite quase atingido!' :
                         pct > 70 ? 'Atencao com os gastos' : 'Dentro do limite'}
                      </p>
                    </div>
                    <button
                      onClick={() => deletarMeta(meta.id)}
                      className="text-gray-300 hover:text-red-400 transition text-xs"
                    >
                      Remover
                    </button>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${cor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-400">
                    <span>R$ {gasto.toFixed(2)} gasto</span>
                    <span>
                      {restante >= 0
                        ? `R$ ${restante.toFixed(2)} restante`
                        : `R$ ${Math.abs(restante).toFixed(2)} acima do limite`}
                    </span>
                    <span>Limite: R$ {Number(meta.limite).toFixed(2)}</span>
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