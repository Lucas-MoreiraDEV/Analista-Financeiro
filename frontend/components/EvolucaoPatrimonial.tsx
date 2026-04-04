import { PontoEvolucao } from '@/lib/evolucao'

type Props = { dados: PontoEvolucao[] }

export default function EvolucaoPatrimonial({ dados }: Props) {
  const valores = dados.map(d => d.saldo)
  const maxVal = Math.max(...valores.map(Math.abs), 1)
  const temPositivo = valores.some(v => v > 0)
  const temNegativo = valores.some(v => v < 0)
  const altura = 80
  const zeroY = temNegativo ? (altura * 0.6) : altura

  function calcY(val: number): number {
    const norm = val / maxVal
    return zeroY - norm * (temNegativo ? altura * 0.6 : altura)
  }

  const pontos = dados.map((d, i) => {
    const x = (i / (dados.length - 1)) * 100
    const y = calcY(d.saldo)
    return { x, y, ...d }
  })

  const pathD = pontos
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const areaD = `${pathD} L ${pontos[pontos.length - 1].x} ${zeroY} L 0 ${zeroY} Z`

  const saldoTotal = dados.reduce((acc, d) => acc + d.saldo, 0)
  const tendenciaPositiva = saldoTotal >= 0

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
          Evolucao patrimonial
        </h2>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          tendenciaPositiva
            ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-950 text-red-500'
        }`}>
          {tendenciaPositiva ? '▲' : '▼'} {Math.abs(saldoTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      {/* Gráfico SVG de linha */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`-2 -4 104 ${altura + 8}`}
          className="w-full"
          style={{ height: 100 }}
          preserveAspectRatio="none"
        >
          {/* Linha zero */}
          {temNegativo && (
            <line
              x1="0" y1={zeroY}
              x2="100" y2={zeroY}
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              className="text-gray-300 dark:text-gray-700"
            />
          )}

          {/* Área preenchida */}
          <path
            d={areaD}
            fill={tendenciaPositiva ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'}
          />

          {/* Linha principal */}
          <path
            d={pathD}
            fill="none"
            stroke={tendenciaPositiva ? '#22c55e' : '#ef4444'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Pontos */}
          {pontos.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.5"
              fill={tendenciaPositiva ? '#22c55e' : '#ef4444'}
            />
          ))}
        </svg>
      </div>

      {/* Labels dos meses */}
      <div className="flex justify-between mt-2">
        {dados.map((d, i) => (
          <span key={i} className="text-[10px] text-gray-400 dark:text-gray-600 uppercase font-medium">
            {d.label}
          </span>
        ))}
      </div>

      {/* Resumo por mês — scroll horizontal no mobile */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
        {dados.map((d, i) => (
          <div
            key={i}
            className="flex-shrink-0 text-center bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 min-w-[60px]"
          >
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase mb-1">{d.label}</p>
            <p className={`text-xs font-bold ${d.saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              {d.saldo >= 0 ? '+' : ''}{(d.saldo / 1000).toFixed(1)}k
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}