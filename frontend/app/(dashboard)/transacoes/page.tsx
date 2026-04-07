'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '@/components/header'
import ImportarCSV from '@/components/ImportarCSV'
import { usePlano } from '@/hooks/usePlano'

type Transacao = {
  id: string
  tipo: 'receita' | 'despesa'
  valor: number
  categoria: string
  descricao: string
  data: string
}

const categorias = {
  receita: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
  despesa: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Outros']
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
  const { isPro } = usePlano()

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
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const saldo = totalReceitas - totalDespesas

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <main className="p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">

          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Transações
            </h1>
            {!isPro && transacoes.length >= 7 ? (
              <a
                href="/upgrade"
                className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition text-center"
              >
                🔒 Limite atingido — Seja Pro
              </a>
            ) : (
              <button
                onClick={() => setShowForm(!showForm)}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-bold transition ${
                  showForm
                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {showForm ? 'Cancelar' : '+ Nova transação'}
              </button>
            )}
          </div>

          {/* Aviso de limite free */}
          {!isPro && (
            <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
              {transacoes.length}/7 transações no plano gratuito
              {transacoes.length >= 5 && (
                <a href="/upgrade" className="text-purple-600 dark:text-purple-400 font-bold ml-1 hover:underline">
                  — Faça upgrade para Pro
                </a>
              )}
            </p>
          )}

          {/* Cards de resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Saldo</p>
              <p className={`text-xl font-bold truncate ${saldo >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-500'}`}>
                {saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Receitas</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-500 truncate">
                {totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Despesas</p>
              <p className="text-xl font-bold text-red-500 truncate">
                {totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>

          {/* Importar CSV */}
          <ImportarCSV
            isPro={isPro}
            onImportado={carregarTransacoes}
          />

          {/* Formulário nova transação */}
          {showForm && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-4">
                Nova transação
              </h2>
              <form onSubmit={salvarTransacao} className="flex flex-col gap-4">

                {/* Tipo */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setTipo('despesa'); setCategoria('') }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all ${
                      tipo === 'despesa'
                        ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-900 text-red-700 dark:text-red-400'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400'
                    }`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTipo('receita'); setCategoria('') }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all ${
                      tipo === 'receita'
                        ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-900 text-green-700 dark:text-green-400'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400'
                    }`}
                  >
                    Receita
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={valor}
                      onChange={e => setValor(e.target.value)}
                      required
                      className="mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Categoria</label>
                    <select
                      value={categoria}
                      onChange={e => setCategoria(e.target.value)}
                      required
                      className="mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      <option value="">Selecione...</option>
                      {categorias[tipo].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Descrição</label>
                  <input
                    type="text"
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    className="mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Ex: Supermercado"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Data</label>
                  <input
                    type="date"
                    value={data}
                    onChange={e => setData(e.target.value)}
                    required
                    className="mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={salvando}
                  className="bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : 'Salvar transação'}
                </button>
              </form>
            </div>
          )}

          {/* Lista de transações */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Carregando...</p>
              </div>
            ) : transacoes.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-600 py-12 text-sm italic">
                Nenhuma transação registrada ainda.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {transacoes.map(t => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        t.tipo === 'receita'
                          ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                          : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{t.categoria}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {t.descricao || 'Sem descrição'} · {new Date(t.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <span className={`text-sm font-bold ${
                        t.tipo === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                      }`}>
                        {t.tipo === 'receita' ? '+' : '-'} {Number(t.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <button
                        onClick={() => deletarTransacao(t.id)}
                        className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}