'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Transacao = {
  id: string
  tipo: 'receita' | 'despesa'
  valor: number
  categoria: string
  descricao: string
  data: string
}

const categorias = {
  receita: ['Salario', 'Freelance', 'Investimentos', 'Outros'],
  despesa: ['Alimentacao', 'Transporte', 'Moradia', 'Saude', 'Lazer', 'Outros']
}

export default function Transacoes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [salvando, setSalvando] = useState(false)

  const supabase = createClient()

  async function carregarTransacoes() {
    const { data: rows } = await supabase
      .from('transacoes')
      .select('*')
      .order('data', { ascending: false })

    setTransacoes(rows || [])
    setLoading(false)
  }

  useEffect(() => {
    carregarTransacoes()
  }, [])

  async function salvarTransacao(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('transacoes').insert({
      user_id: user?.id,
      tipo,
      valor: parseFloat(valor),
      categoria,
      descricao,
      data
    })

    if (!error) {
      setShowForm(false)
      setValor('')
      setCategoria('')
      setDescricao('')
      carregarTransacoes()
    }

    setSalvando(false)
  }

  async function deletarTransacao(id: string) {
    await supabase.from('transacoes').delete().eq('id', id)
    carregarTransacoes()
  }

  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor, 0)

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0)

  const saldo = totalReceitas - totalDespesas

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Transacoes</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            {showForm ? 'Cancelar' : '+ Nova transacao'}
          </button>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-xs text-gray-500 mb-1">Saldo</p>
            <p className={`text-xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              R$ {saldo.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-xs text-gray-500 mb-1">Receitas</p>
            <p className="text-xl font-bold text-green-600">R$ {totalReceitas.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-xs text-gray-500 mb-1">Despesas</p>
            <p className="text-xl font-bold text-red-500">R$ {totalDespesas.toFixed(2)}</p>
          </div>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nova transacao</h2>
            <form onSubmit={salvarTransacao} className="flex flex-col gap-4">

              {/* Tipo */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setTipo('despesa'); setCategoria('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    tipo === 'despesa'
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => { setTipo('receita'); setCategoria('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    tipo === 'receita'
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  Receita
                </button>
              </div>

              {/* Valor */}
              <div>
                <label className="text-sm font-medium text-gray-700">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  required
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0,00"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="text-sm font-medium text-gray-700">Categoria</label>
                <select
                  value={categoria}
                  onChange={e => setCategoria(e.target.value)}
                  required
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione...</option>
                  {categorias[tipo].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Descricao */}
              <div>
                <label className="text-sm font-medium text-gray-700">Descricao</label>
                <input
                  type="text"
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Supermercado"
                />
              </div>

              {/* Data */}
              <div>
                <label className="text-sm font-medium text-gray-700">Data</label>
                <input
                  type="date"
                  value={data}
                  onChange={e => setData(e.target.value)}
                  required
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                type="submit"
                disabled={salvando}
                className="bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : 'Salvar transacao'}
              </button>
            </form>
          </div>
        )}

        {/* Lista de transacoes */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {loading ? (
            <p className="text-center text-gray-400 py-8 text-sm">Carregando...</p>
          ) : transacoes.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">Nenhuma transacao ainda</p>
          ) : (
            transacoes.map(t => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 border-b last:border-0 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${t.tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.categoria}</p>
                    <p className="text-xs text-gray-400">{t.descricao} · {t.data}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                  </span>
                  <button
                    onClick={() => deletarTransacao(t.id)}
                    className="text-gray-300 hover:text-red-400 transition text-xs"
                  >
                    X
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  )
}