'use client'
import { useState } from 'react'
import { exportarRelatorioPDF } from '@/lib/exportarPDF'

type Transacao = {
  id: string
  tipo: 'receita' | 'despesa'
  valor: number
  categoria: string
  descricao: string
  data: string
}

type Props = {
  transacoes: Transacao[]
  isPro: boolean
}

export default function RelatorioPDF({ transacoes, isPro }: Props) {
  const [gerando, setGerando] = useState(false)

  const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  const mesAtualNum = new Date().getMonth()
  const anoAtual = new Date().getFullYear()

  const transacoesMes = transacoes.filter(t => {
    const d = new Date(t.data)
    return d.getUTCMonth() === mesAtualNum && d.getUTCFullYear() === anoAtual
  })

  const totalReceitas = transacoesMes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const totalDespesas = transacoesMes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor), 0)

  const saldo = totalReceitas - totalDespesas

  const porCategoria = transacoesMes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + Number(t.valor)
      return acc
    }, {} as Record<string, number>)

  const categorias = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])

  async function gerarPDF() {
    setGerando(true)
    await exportarRelatorioPDF(
      'relatorio-pdf-content',
      `relatorio-financeiro-${mesAtualNum + 1}-${anoAtual}.pdf`
    )
    setGerando(false)
  }

  if (!isPro) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm relative overflow-hidden">
        <div className="filter blur-sm pointer-events-none select-none">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-tight">Relatorio PDF mensal</h2>
            <button className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg">
              Exportar PDF
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['Receitas', 'Despesas', 'Saldo'].map(l => (
              <div key={l} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">{l}</p>
                <p className="text-lg font-bold text-gray-300">R$ ----</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl">
          <span className="text-2xl mb-2">🔒</span>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Recurso Pro</p>
          <p className="text-xs text-gray-400 text-center mb-3 px-4">
            Exporte seu relatorio mensal completo em PDF
          </p>
          <a href="/upgrade" className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-700 transition">
            Desbloquear Pro
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
            Relatorio mensal
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 capitalize">{mesAtual}</p>
        </div>
        <button
          onClick={gerarPDF}
          disabled={gerando}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
        >
          {gerando ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Gerando...
            </>
          ) : (
            <>📄 Exportar PDF</>
          )}
        </button>
      </div>

      {/* Preview do relatório */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Receitas</p>
          <p className="text-sm font-bold text-green-600">
            {totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Despesas</p>
          <p className="text-sm font-bold text-red-500">
            {totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Saldo</p>
          <p className={`text-sm font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        {transacoesMes.length} transacoes em {mesAtual}
      </p>

      {/* Conteúdo oculto que vira PDF */}
      <div id="relatorio-pdf-content" style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px', background: '#fff', padding: '48px', fontFamily: 'sans-serif' }}>

        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, borderBottom: '2px solid #16a34a', paddingBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#16a34a', margin: 0 }}>FinanceApp</h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0', textTransform: 'capitalize' }}>Relatorio financeiro — {mesAtual}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Gerado em</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '2px 0 0' }}>
              {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Cards de resumo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Receitas', valor: totalReceitas, cor: '#16a34a' },
            { label: 'Total Despesas', valor: totalDespesas, cor: '#ef4444' },
            { label: 'Saldo do Mes', valor: saldo, cor: saldo >= 0 ? '#16a34a' : '#ef4444' },
          ].map((c, i) => (
            <div key={i} style={{ background: '#f9fafb', borderRadius: 12, padding: '20px 16px', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>{c.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: c.cor, margin: 0 }}>
                {c.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          ))}
        </div>

        {/* Gastos por categoria */}
        {categorias.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16, borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>
              Gastos por categoria
            </h2>
            {categorias.map(([cat, val], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{cat}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>
                  {val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Lista de transações */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16, borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>
            Todas as transacoes ({transacoesMes.length})
          </h2>
          {transacoesMes.map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{t.categoria}</p>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                  {t.descricao || 'Sem descricao'} · {new Date(t.data).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.tipo === 'receita' ? '#16a34a' : '#ef4444' }}>
                {t.tipo === 'receita' ? '+' : '-'} {Number(t.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <div style={{ marginTop: 40, paddingTop: 16, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 11, color: '#9ca3af' }}>FinanceApp — Relatorio gerado automaticamente</p>
          <p style={{ fontSize: 11, color: '#9ca3af' }}>{new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
    </div>
  )
}