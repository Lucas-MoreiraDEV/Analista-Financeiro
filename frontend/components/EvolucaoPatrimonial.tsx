import { PontoEvolucao } from '@/lib/evolucao'

type Props = { dados: PontoEvolucao[] }

export default function EvolucaoPatrimonial({ dados }: Props) {
  const temDados = dados.some(d => d.receita > 0 || d.despesa > 0)
  const valores = dados.map(d => d.saldo)
  const maxAbs = Math.max(...valores.map(Math.abs), 1)
  const temNegativo = valores.some(v => v < 0)
  const altura = 80
  const zeroY = temNegativo ? altura * 0.65 : altura

  function calcY(val: number) {
    return zeroY - (val / maxAbs) * (temNegativo ? altura * 0.65 : altura)
  }

  const pontos = dados.map((d, i) => ({
    x: (i / Math.max(dados.length - 1, 1)) * 100,
    y: calcY(d.saldo),
    ...d
  }))

  const pathD = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${pontos[pontos.length - 1].x} ${zeroY} L 0 ${zeroY} Z`

  const saldoTotal = dados.reduce((acc, d) => acc + d.saldo, 0)
  const positivo = saldoTotal >= 0

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
            Evolucao patrimonial
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Saldo acumulado por mes</p>
        </div>
        {temDados && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            positivo
              ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-950 text-red-500'
          }`}>
            {positivo ? '▲' : '▼'} {Math.abs(saldoTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        )}
      </div>

      {!temDados ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sem dados ainda</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Adicione transacoes para ver sua evolucao</p>
        </div>
      ) : (
        <>
          {/* Grafico SVG */}
          <div className="w-full mb-3">
            <svg viewBox={`-1 -4 102 ${altura + 10}`} className="w-full" style={{ height: 110 }} preserveAspectRatio="none">
              {/* Linha zero */}
              {temNegativo && (
                <line x1="0" y1={zeroY} x2="100" y2={zeroY}
                  stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 2"
                  className="text-gray-300 dark:text-gray-700" />
              )}
              {/* Area */}
              <path d={areaD} fill={positivo ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)'} />
              {/* Linha */}
              <path d={pathD} fill="none"
                stroke={positivo ? '#22c55e' : '#ef4444'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {/* Pontos */}
              {pontos.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="2.5"
                    fill={positivo ? '#22c55e' : '#ef4444'} />
                  <circle cx={p.x} cy={p.y} r="4.5"
                    fill={positivo ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'} />
                </g>
              ))}
            </svg>
          </div>

          {/* Labels meses */}
          <div className="flex justify-between mb-3">
            {dados.map((d, i) => (
              <span key={i} className="text-[10px] text-gray-400 dark:text-gray-600 uppercase font-medium">{d.label}</span>
            ))}
          </div>

          {/* Mini cards — scroll horizontal no mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {dados.map((d, i) => {
              const temTransacao = d.receita > 0 || d.despesa > 0
              return (
                <div key={i} className={`flex-shrink-0 text-center rounded-lg px-3 py-2 min-w-[56px] border transition-colors ${
                  !temTransacao
                    ? 'bg-gray-50 dark:bg-gray-800/50 border-transparent'
                    : d.saldo >= 0
                      ? 'bg-green-50 dark:bg-green-950/50 border-green-100 dark:border-green-900'
                      : 'bg-red-50 dark:bg-red-950/50 border-red-100 dark:border-red-900'
                }`}>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase mb-1">{d.label}</p>
                  {!temTransacao ? (
                    <p className="text-xs text-gray-300 dark:text-gray-700">—</p>
                  ) : (
                    <p className={`text-xs font-bold ${d.saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      {d.saldo >= 0 ? '+' : ''}{d.saldo >= 1000 || d.saldo <= -1000
                        ? `${(d.saldo / 1000).toFixed(1)}k`
                        : d.saldo.toFixed(0)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}