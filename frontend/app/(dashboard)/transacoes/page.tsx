'use client'
import { useState, useEffect, useMemo } from 'react'
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
  tipo_lancamento: 'avulso' | 'fixo' | 'parcelado' | 'cartao'
  recorrente: boolean
  frequencia: string | null
  parcela_atual: number | null
  total_parcelas: number | null
  grupo_id: string | null
}

const categorias = {
  receita: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
  despesa: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Cartão', 'Outros']
}

const PERIODOS = [
  { label: 'Este mês', value: 'mes' },
  { label: 'Esta semana', value: 'semana' },
  { label: 'Últimos 3 meses', value: '3meses' },
  { label: 'Este ano', value: 'ano' },
  { label: 'Todos', value: 'todos' },
]

function filtrarPorPeriodo(transacoes: Transacao[], periodo: string, dataInicio: string, dataFim: string) {
  const hoje = new Date()

  if (periodo === 'personalizado') {
    const ini = new Date(dataInicio)
    const fim = new Date(dataFim)
    return transacoes.filter(t => {
      const d = new Date(t.data)
      return d >= ini && d <= fim
    })
  }

  return transacoes.filter(t => {
    const d = new Date(t.data)
    if (periodo === 'mes') {
      return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear()
    }
    if (periodo === 'semana') {
      const inicioSemana = new Date(hoje)
      inicioSemana.setDate(hoje.getDate() - hoje.getDay())
      return d >= inicioSemana
    }
    if (periodo === '3meses') {
      const tresMesesAtras = new Date(hoje)
      tresMesesAtras.setMonth(hoje.getMonth() - 3)
      return d >= tresMesesAtras
    }
    if (periodo === 'ano') {
      return d.getFullYear() === hoje.getFullYear()
    }
    return true
  })
}

export default function Transacoes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const { isPro } = usePlano()
  const supabase = createClient()

  // Filtros
  const [periodo, setPeriodo] = useState('mes')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [busca, setBusca] = useState('')

  // Formulário
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa')
  const [tipoLancamento, setTipoLancamento] = useState<'avulso' | 'fixo' | 'parcelado' | 'cartao'>('avulso')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [totalParcelas, setTotalParcelas] = useState('2')
  const [frequencia, setFrequencia] = useState('mensal')

  async function carregarTransacoes() {
    const { data: rows } = await supabase
      .from('transacoes')
      .select('*')
      .order('data', { ascending: false })
    setTransacoes(rows || [])
    setLoading(false)
  }

  useEffect(() => { carregarTransacoes() }, [])

  async function salvarTransacao(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const grupoId = crypto.randomUUID()
    const valorNum = parseFloat(valor)

    // Transação fixa — gera 12 meses
    if (tipoLancamento === 'fixo') {
      const lancamentos = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(data)
        d.setMonth(d.getMonth() + i)
        return {
          user_id: user.id, tipo, valor: valorNum,
          categoria, descricao, data: d.toISOString().split('T')[0],
          tipo_lancamento: 'fixo', recorrente: true,
          frequencia, grupo_id: grupoId,
        }
      })
      await supabase.from('transacoes').insert(lancamentos)
    }

    // Parcelado — gera N parcelas
    else if (tipoLancamento === 'parcelado') {
      const n = parseInt(totalParcelas)
      const valorParcela = valorNum / n
      const lancamentos = Array.from({ length: n }, (_, i) => {
        const d = new Date(data)
        d.setMonth(d.getMonth() + i)
        return {
          user_id: user.id, tipo, valor: Math.round(valorParcela * 100) / 100,
          categoria, descricao: `${descricao} (${i + 1}/${n})`,
          data: d.toISOString().split('T')[0],
          tipo_lancamento: 'parcelado', recorrente: false,
          parcela_atual: i + 1, total_parcelas: n,
          grupo_id: grupoId,
        }
      })
      await supabase.from('transacoes').insert(lancamentos)
    }

    // Cartão ou avulso
    else {
      await supabase.from('transacoes').insert({
        user_id: user.id, tipo, valor: valorNum,
        categoria, descricao, data,
        tipo_lancamento: tipoLancamento,
        recorrente: false,
      })
    }

    setShowForm(false)
    setValor('')
    setCategoria('')
    setDescricao('')
    setTipoLancamento('avulso')
    carregarTransacoes()
    setSalvando(false)
  }

  async function deletarTransacao(id: string, grupoId: string | null, tipoLancamento: string) {
    // Fixo ou parcelado — pergunta se quer deletar todo o grupo
    if (grupoId && (tipoLancamento === 'fixo' || tipoLancamento === 'parcelado')) {
      const confirmar = window.confirm(
        tipoLancamento === 'fixo'
          ? 'Deseja excluir apenas este lançamento ou todos os lançamentos fixos deste grupo?'
          : 'Deseja excluir apenas esta parcela ou todas as parcelas?'
      )
      if (confirmar) {
        await supabase.from('transacoes').delete().eq('grupo_id', grupoId)
      } else {
        await supabase.from('transacoes').delete().eq('id', id)
      }
    } else {
      await supabase.from('transacoes').delete().eq('id', id)
    }
    carregarTransacoes()
  }

  // Transações filtradas
  const transacoesFiltradas = useMemo(() => {
    let resultado = filtrarPorPeriodo(transacoes, periodo, dataInicio, dataFim)
    if (busca.trim()) {
      resultado = resultado.filter(t =>
        t.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
        t.categoria?.toLowerCase().includes(busca.toLowerCase())
      )
    }
    return resultado
  }, [transacoes, periodo, dataInicio, dataFim, busca])

  const totalReceitas = transacoesFiltradas.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + Number(t.valor), 0)
  const totalDespesas = transacoesFiltradas.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + Number(t.valor), 0)
  const saldo = totalReceitas - totalDespesas

  function badgeTipoLancamento(t: Transacao) {
    if (t.tipo_lancamento === 'fixo') return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-500 ml-1">FIXO</span>
    if (t.tipo_lancamento === 'parcelado') return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-500 ml-1">{t.parcela_atual}/{t.total_parcelas}x</span>
    if (t.tipo_lancamento === 'cartao') return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-500 ml-1">CARTÃO</span>
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <main className="p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">

          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Transações
            </h1>
            {!isPro && transacoes.length >= 7 ? (
              <a href="/upgrade" className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition text-center">
                🔒 Limite atingido — Seja Pro
              </a>
            ) : (
              <button
                onClick={() => setShowForm(!showForm)}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-bold transition ${
                  showForm
                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {showForm ? 'Cancelar' : '+ Nova transação'}
              </button>
            )}
          </div>

          {/* Aviso limite free */}
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
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Saldo', valor: saldo, cor: saldo >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-500' },
              { label: 'Receitas', valor: totalReceitas, cor: 'text-green-600 dark:text-green-500' },
              { label: 'Despesas', valor: totalDespesas, cor: 'text-red-500' },
            ].map((c, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800 shadow-sm">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{c.label}</p>
                <p className={`text-sm sm:text-lg font-bold truncate ${c.cor}`}>
                  {c.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            ))}
          </div>

          {/* Importar CSV */}
          <ImportarCSV isPro={isPro} onImportado={carregarTransacoes} />

          {/* Formulário */}
          {showForm && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <h2 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight mb-4">
                Nova transação
              </h2>
              <form onSubmit={salvarTransacao} className="space-y-4">

                {/* Tipo receita/despesa */}
                <div className="flex gap-2">
                  {(['despesa', 'receita'] as const).map(t => (
                    <button key={t} type="button"
                      onClick={() => { setTipo(t); setCategoria('') }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all ${
                        tipo === t
                          ? t === 'despesa'
                            ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-900 text-red-700 dark:text-red-400'
                            : 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-900 text-green-700 dark:text-green-400'
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400'
                      }`}>
                      {t === 'despesa' ? 'Despesa' : 'Receita'}
                    </button>
                  ))}
                </div>

                {/* Tipo de lançamento */}
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Tipo de lançamento
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {[
                      { value: 'avulso', label: '⚡ Avulso', desc: 'Uma vez' },
                      { value: 'fixo', label: '🔄 Fixo', desc: 'Todo mês' },
                      { value: 'parcelado', label: '💳 Parcelado', desc: 'Em parcelas' },
                      { value: 'cartao', label: '🪪 Cartão', desc: 'Fatura' },
                    ].map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setTipoLancamento(opt.value as any)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          tipoLancamento === opt.value
                            ? 'bg-green-50 dark:bg-green-950/30 border-green-400 dark:border-green-700'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{opt.label}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campos extras por tipo */}
                {tipoLancamento === 'fixo' && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
                      🔄 Lançamento fixo — serão gerados 12 meses automaticamente
                    </p>
                    <select
                      value={frequencia}
                      onChange={e => setFrequencia(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="mensal">Mensal</option>
                      <option value="semanal">Semanal</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                )}

                {tipoLancamento === 'parcelado' && (
                  <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-lg p-3">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-2">
                      💳 Parcelado — o valor será dividido automaticamente
                    </p>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-purple-600 dark:text-purple-400 font-medium whitespace-nowrap">
                        Número de parcelas:
                      </label>
                      <input
                        type="number"
                        min="2" max="48"
                        value={totalParcelas}
                        onChange={e => setTotalParcelas(e.target.value)}
                        className="w-20 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      {valor && (
                        <span className="text-xs text-purple-500 dark:text-purple-400">
                          = {(parseFloat(valor || '0') / parseInt(totalParcelas || '1')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {tipoLancamento === 'cartao' && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                      🪪 Cartão — lançamento na data de vencimento da fatura
                    </p>
                  </div>
                )}

                {/* Valor e categoria */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      {tipoLancamento === 'parcelado' ? 'Valor total (R$)' : 'Valor (R$)'}
                    </label>
                    <input type="number" step="0.01" value={valor}
                      onChange={e => setValor(e.target.value)} required
                      className="mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="0,00" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Categoria</label>
                    <select value={categoria} onChange={e => setCategoria(e.target.value)} required
                      className="mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                      <option value="">Selecione...</option>
                      {categorias[tipo].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Descrição</label>
                  <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)}
                    className="mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Ex: Aluguel, Netflix, Supermercado..." />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {tipoLancamento === 'parcelado' ? 'Data da primeira parcela' : tipoLancamento === 'fixo' ? 'Data do primeiro lançamento' : 'Data'}
                  </label>
                  <input type="date" value={data} onChange={e => setData(e.target.value)} required
                    className="mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>

                <button type="submit" disabled={salvando}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50">
                  {salvando ? 'Salvando...' :
                    tipoLancamento === 'fixo' ? 'Criar lançamento fixo (12 meses)' :
                    tipoLancamento === 'parcelado' ? `Parcelar em ${totalParcelas}x` :
                    'Salvar transação'}
                </button>
              </form>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">

              {/* Período */}
              <div className="flex gap-1.5 flex-wrap">
                {PERIODOS.map(p => (
                  <button key={p.value}
                    onClick={() => setPeriodo(p.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      periodo === p.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}>
                    {p.label}
                  </button>
                ))}
                <button
                  onClick={() => setPeriodo('personalizado')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    periodo === 'personalizado'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}>
                  Personalizado
                </button>
              </div>

              {/* Busca */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Buscar por descrição ou categoria..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            {/* Datas personalizadas */}
            {periodo === 'personalizado' && (
              <div className="flex gap-3 mt-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">De</label>
                  <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Até</label>
                  <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
            )}

            {/* Contagem de resultados */}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {transacoesFiltradas.length} transação{transacoesFiltradas.length !== 1 ? 'ões' : ''} encontrada{transacoesFiltradas.length !== 1 ? 's' : ''}
              {busca && ` para "${busca}"`}
            </p>
          </div>

          {/* Lista de transações */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Carregando...</p>
              </div>
            ) : transacoesFiltradas.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2 text-center px-4">
                <span className="text-3xl">🔍</span>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {busca ? `Nenhum resultado para "${busca}"` : 'Nenhuma transação neste período'}
                </p>
                <button onClick={() => { setPeriodo('todos'); setBusca('') }}
                  className="text-xs text-green-600 dark:text-green-400 hover:underline mt-1">
                  Ver todas as transações
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {transacoesFiltradas.map(t => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        t.tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div className="min-w-0">
                        <div className="flex items-center flex-wrap gap-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {t.categoria}
                          </p>
                          {badgeTipoLancamento(t)}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
                        onClick={() => deletarTransacao(t.id, t.grupo_id, t.tipo_lancamento)}
                        className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
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