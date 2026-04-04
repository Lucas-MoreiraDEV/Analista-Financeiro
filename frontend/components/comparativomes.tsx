import { ComparativoMes } from '@/lib/comparativo'

type Props = {
  dados: ComparativoMes
}

function Badge({ valor }: { valor: number }) {
  const positivo = valor >= 0
  const cor = positivo
    ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
    : 'bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400'
  const seta = positivo ? '▲' : '▼'

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cor}`}>
      {seta} {Math.abs(valor).toFixed(1)}%
    </span>
  )
}

export default function ComparativoMesCard({ dados }: Props) {
  const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' })
  const mesAnterior = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    1
  ).toLocaleString('pt-BR', { month: 'long' })

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Comparativo mensal
        </h2>
        <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
          {mesAnterior} → {mesAtual}
        </span>
      </div>

      <div className="space-y-4">

        {/* Receitas */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Receitas</p>
            <p className="text-lg font-bold text-green-600">
              R$ {dados.receitaAtual.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              vs R$ {dados.receitaAnterior.toFixed(2)} em {mesAnterior}
            </p>
          </div>
          <Badge valor={dados.variacaoReceita} />
        </div>

        <div className="border-t dark:border-gray-800" />

        {/* Despesas */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Despesas</p>
            <p className="text-lg font-bold text-red-500">
              R$ {dados.despesaAtual.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              vs R$ {dados.despesaAnterior.toFixed(2)} em {mesAnterior}
            </p>
          </div>
          {/* Despesa alta é ruim — inverte a cor */}
          <Badge valor={-dados.variacaoDespesa} />
        </div>

        <div className="border-t dark:border-gray-800" />

        {/* Saldo */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Saldo</p>
            <p className={`text-lg font-bold ${
              dados.receitaAtual - dados.despesaAtual >= 0
                ? 'text-green-600'
                : 'text-red-500'
            }`}>
              R$ {(dados.receitaAtual - dados.despesaAtual).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              vs R$ {(dados.receitaAnterior - dados.despesaAnterior).toFixed(2)} em {mesAnterior}
            </p>
          </div>
          <Badge valor={dados.variacaoSaldo} />
        </div>

      </div>
    </div>
  )
}