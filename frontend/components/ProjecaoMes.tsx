'use client'
import { ProjecaoMes } from '@/lib/projecao'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Props = { dados: ProjecaoMes }

const config = {
  otima:   { label: 'Otima',    cor: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950', barra: 'bg-green-500', badge: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400' },
  boa:     { label: 'Boa',      cor: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950', barra: 'bg-green-400', badge: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400' },
  atencao: { label: 'Atencao',  cor: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950', barra: 'bg-amber-400', badge: 'bg-amber-50 dark:bg-amber-950 text-amber-500' },
  critica: { label: 'Critica',  cor: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950', barra: 'bg-red-500', badge: 'bg-red-50 dark:bg-red-950 text-red-500' },
}

export default function ProjecaoMesCard({ dados }: Props) {
  const [plano, setPlano] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('plano')
        .eq('id', user.id)
        .single()
      setPlano(data?.plano || 'free')
      setCarregando(false)
    }
    verificar()
  }, [])

  const c = config[dados.tendencia]
  const pct = Math.round(dados.percentualMes * 100)
  const isPro = plano === 'pro'

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 shadow-sm h-full relative overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
            Projecao do mes
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Estimativa ate o dia 30</p>
        </div>
        <div className="flex items-center gap-2">
          {!carregando && !isPro && (
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              PRO
            </span>
          )}
          {isPro && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.badge}`}>
              {c.label}
            </span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            dia {dados.diasPassados}/{dados.diasTotais}
          </span>
        </div>
      </div>

      {/* Barra de progresso do mes */}
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-gray-400 dark:text-gray-500">Progresso do mes</span>
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div className="h-full rounded-full bg-blue-400 transition-all duration-700"
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Conteudo bloqueado para free */}
      {!carregando && !isPro ? (
        <div className="relative">
          {/* Preview borrado */}
          <div className="filter blur-sm pointer-events-none select-none">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-[10px] text-gray-400 uppercase mb-1">Receita projetada</p>
                <p className="text-sm font-bold text-green-600">R$ 5.200,00</p>
                <p className="text-[10px] text-gray-400 mt-0.5">atual: R$ 2.100,00</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-[10px] text-gray-400 uppercase mb-1">Despesa projetada</p>
                <p className="text-sm font-bold text-red-500">R$ 3.800,00</p>
                <p className="text-[10px] text-gray-400 mt-0.5">atual: R$ 1.500,00</p>
              </div>
            </div>
            <div className="rounded-lg p-3 bg-green-50 dark:bg-green-950">
              <p className="text-[10px] uppercase font-medium text-gray-500 mb-1">Saldo projetado</p>
              <p className="text-xl font-bold text-green-600">+R$ 1.400,00</p>
            </div>
          </div>

          {/* Overlay de bloqueio */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950 rounded-full flex items-center justify-center mb-2">
              <span className="text-xl">🔒</span>
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Recurso Pro</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-3 px-2">
              Veja o que vai acontecer com seu dinheiro ate o fim do mes
            </p>
            <a
              href="/upgrade"
              className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Desbloquear Pro
            </a>
          </div>
        </div>
      ) : isPro ? (
        <>
          {/* Grid de valores */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase mb-1">Receita projetada</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                {dados.receitaProjetada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">
                atual: {dados.receitaAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase mb-1">Despesa projetada</p>
              <p className="text-sm font-bold text-red-500">
                {dados.despesaProjetada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">
                atual: {dados.despesaAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>

          {/* Saldo projetado */}
          <div className={`rounded-lg p-3 ${c.bg}`}>
            <p className="text-[10px] uppercase font-medium text-gray-500 dark:text-gray-400 mb-1">Saldo projetado ao fim do mes</p>
            <p className={`text-xl font-bold ${c.cor}`}>
              {dados.saldoProjetado >= 0 ? '+' : ''}
              {dados.saldoProjetado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              Baseado na media dos ultimos 3 meses
            </p>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}