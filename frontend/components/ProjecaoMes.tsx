import { ProjecaoMes } from '@/lib/projecao'

type Props = { dados: ProjecaoMes }

const config = {
  otima:   { label: 'Otima', cor: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950', barra: 'bg-green-500' },
  boa:     { label: 'Boa',   cor: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950', barra: 'bg-green-400' },
  atencao: { label: 'Atencao', cor: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950', barra: 'bg-amber-400' },
  critica: { label: 'Critica', cor: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950', barra: 'bg-red-500' },
}

export default function ProjecaoMesCard({ dados }: Props) {
  const c = config[dados.tendencia]
  const pct = Math.round(dados.percentualMes * 100)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
          Projecao do mes
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.bg} ${c.cor}`}>
            {c.label}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            dia {dados.diasPassados}/{dados.diasTotais}
          </span>
        </div>
      </div>

      {/* Barra de progresso do mês */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-400 dark:text-gray-500">Progresso do mes</span>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-blue-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

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
    </div>
  )
}