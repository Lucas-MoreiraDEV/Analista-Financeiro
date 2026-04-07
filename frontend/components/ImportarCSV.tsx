'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'

type TransacaoImportada = {
  data: string
  descricao: string
  valor: number
  tipo: 'receita' | 'despesa'
  categoria: string
  selecionada: boolean
}

type Props = {
  isPro: boolean
  onImportado: () => void
}

const categorias = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde',
  'Lazer', 'Educação', 'Salário', 'Freelance', 'Investimentos', 'Outros'
]

export default function ImportarCSV({ isPro, onImportado }: Props) {
  const [etapa, setEtapa] = useState<'upload' | 'revisao' | 'sucesso'>('upload')
  const [transacoes, setTransacoes] = useState<TransacaoImportada[]>([])
  const [processando, setProcessando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [nomeArquivo, setNomeArquivo] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function processarArquivo(arquivo: File) {
    setProcessando(true)
    setErro('')
    setNomeArquivo(arquivo.name)

    try {
      const conteudo = await arquivo.text()

      const res = await fetch('/api/importar-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudoCsv: conteudo })
      })

      const data = await res.json()

      if (data.error) {
        setErro(data.error)
        setProcessando(false)
        return
      }

      const transacoesComSelecao = data.transacoes.map((t: any) => ({
        ...t,
        selecionada: true
      }))

      setTransacoes(transacoesComSelecao)
      setEtapa('revisao')
    } catch {
      setErro('Erro ao processar arquivo. Tente novamente.')
    }

    setProcessando(false)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (arquivo) processarArquivo(arquivo)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const arquivo = e.dataTransfer.files[0]
    if (arquivo && arquivo.name.endsWith('.csv')) processarArquivo(arquivo)
  }

  function toggleSelecao(index: number) {
    setTransacoes(prev => prev.map((t, i) =>
      i === index ? { ...t, selecionada: !t.selecionada } : t
    ))
  }

  function toggleTodas() {
    const todasSelecionadas = transacoes.every(t => t.selecionada)
    setTransacoes(prev => prev.map(t => ({ ...t, selecionada: !todasSelecionadas })))
  }

  function editarCategoria(index: number, categoria: string) {
    setTransacoes(prev => prev.map((t, i) =>
      i === index ? { ...t, categoria } : t
    ))
  }

  function editarTipo(index: number, tipo: 'receita' | 'despesa') {
    setTransacoes(prev => prev.map((t, i) =>
      i === index ? { ...t, tipo } : t
    ))
  }

  async function salvarTransacoes() {
    setSalvando(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const selecionadas = transacoes
      .filter(t => t.selecionada)
      .map(t => ({
        user_id: user.id,
        tipo: t.tipo,
        valor: Math.abs(t.valor),
        categoria: t.categoria,
        descricao: t.descricao,
        data: t.data
      }))

    const { error } = await supabase
      .from('transacoes')
      .insert(selecionadas)

    if (error) {
      setErro('Erro ao salvar transações.')
      setSalvando(false)
      return
    }

    setEtapa('sucesso')
    setSalvando(false)
    onImportado()
  }

  const totalSelecionadas = transacoes.filter(t => t.selecionada).length
  const totalReceitas = transacoes.filter(t => t.selecionada && t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0)
  const totalDespesas = transacoes.filter(t => t.selecionada && t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0)

  // Bloqueio Pro
  if (!isPro) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm relative overflow-hidden">
        <div className="filter blur-sm pointer-events-none select-none">
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center">
            <p className="text-4xl mb-3">📂</p>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Importar extrato CSV</p>
            <p className="text-xs text-gray-400 mt-1">Arraste o arquivo aqui</p>
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl">
          <span className="text-3xl mb-2">🔒</span>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Recurso Pro</p>
          <p className="text-xs text-gray-400 text-center mb-3 px-4">
            Importe seu extrato bancário e a IA categoriza tudo automaticamente
          </p>
          <a href="/upgrade" className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-700 transition">
            Desbloquear Pro
          </a>
        </div>
      </div>
    )
  }

  // Sucesso
  if (etapa === 'sucesso') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm text-center">
        <div className="w-14 h-14 bg-green-50 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
          Importação concluída!
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
          {totalSelecionadas} transações foram adicionadas com sucesso.
        </p>
        <button
          onClick={() => { setEtapa('upload'); setTransacoes([]); setNomeArquivo('') }}
          className="text-sm text-green-600 dark:text-green-400 font-medium hover:underline"
        >
          Importar outro arquivo
        </button>
      </div>
    )
  }

  // Revisão
  if (etapa === 'revisao') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
              Revisar importação
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{nomeArquivo}</p>
          </div>

          {/* Resumo */}
          <div className="flex gap-3 text-xs">
            <span className="font-medium text-green-600 dark:text-green-400">
              +{totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <span className="font-medium text-red-500">
              -{totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <span className="text-gray-400 dark:text-gray-500">
              {totalSelecionadas}/{transacoes.length} selecionadas
            </span>
          </div>
        </div>

        {/* Selecionar todas */}
        <div className="px-4 sm:px-5 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <input
            type="checkbox"
            checked={transacoes.every(t => t.selecionada)}
            onChange={toggleTodas}
            className="w-4 h-4 accent-green-600 cursor-pointer"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">Selecionar todas</span>
        </div>

        {/* Lista de transações */}
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {transacoes.map((t, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 px-4 sm:px-5 py-3 transition-colors ${
                !t.selecionada ? 'opacity-40' : ''
              } hover:bg-gray-50 dark:hover:bg-gray-800/50`}
            >
              <input
                type="checkbox"
                checked={t.selecionada}
                onChange={() => toggleSelecao(i)}
                className="w-4 h-4 mt-0.5 accent-green-600 cursor-pointer flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{t.descricao}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{t.data}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Tipo */}
                    <select
                      value={t.tipo}
                      onChange={e => editarTipo(i, e.target.value as 'receita' | 'despesa')}
                      className="text-[10px] font-bold border-0 bg-transparent cursor-pointer focus:outline-none"
                      style={{ color: t.tipo === 'receita' ? '#16a34a' : '#ef4444' }}
                    >
                      <option value="receita">receita</option>
                      <option value="despesa">despesa</option>
                    </select>
                    <span className={`text-xs font-bold ${t.tipo === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      {t.tipo === 'receita' ? '+' : '-'} {Math.abs(t.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
                {/* Categoria */}
                <select
                  value={t.categoria}
                  onChange={e => editarCategoria(i, e.target.value)}
                  className="mt-1 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-0 rounded px-2 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  {categorias.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {erro && (
          <div className="px-4 sm:px-5 py-2 bg-red-50 dark:bg-red-950">
            <p className="text-xs text-red-500">{erro}</p>
          </div>
        )}

        <div className="px-4 sm:px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => { setEtapa('upload'); setTransacoes([]) }}
            className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancelar
          </button>
          <button
            onClick={salvarTransacoes}
            disabled={salvando || totalSelecionadas === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {salvando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              `Importar ${totalSelecionadas} transações`
            )}
          </button>
        </div>
      </div>
    )
  }

  // Upload
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
            Importar extrato
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Qualquer banco — a IA interpreta automaticamente
          </p>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
          Pro
        </span>
      </div>

      {/* Área de drop */}
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600 rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-colors group"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onInputChange}
        />

        {processando ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              IA analisando seu extrato...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 group-hover:bg-green-50 dark:group-hover:bg-green-950 rounded-full flex items-center justify-center transition-colors">
              <span className="text-3xl">📂</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                Arraste o CSV aqui
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                ou clique para selecionar o arquivo
              </p>
            </div>
            <p className="text-[10px] text-gray-300 dark:text-gray-700 uppercase tracking-wider">
              Nubank · Itaú · Bradesco · Santander · qualquer banco
            </p>
          </div>
        )}
      </div>

      {erro && (
        <p className="text-xs text-red-500 mt-3 text-center">{erro}</p>
      )}

      {/* Instruções */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
          Como baixar o extrato do seu banco:
        </p>
        <ul className="text-xs text-blue-600 dark:text-blue-500 space-y-0.5">
          <li>• Nubank: App → Extrato → Exportar → CSV</li>
          <li>• Itaú: Internet Banking → Extrato → Salvar como CSV</li>
          <li>• Bradesco: Net Empresa → Consultas → Exportar CSV</li>
        </ul>
      </div>
    </div>
  )
}