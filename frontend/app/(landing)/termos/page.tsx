export default function Termos() {
  const dataAtualizacao = '06 de abril de 2026'
  const empresa = 'FinanceApp'
  const email = 'suporte@financeapp.com.br'
  const site = 'https://financeapp.com.br'

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      <header className="border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <a href="/" className="text-lg font-bold text-green-600">FinanceApp</a>
          <a href="/cadastro" className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 transition">
            Voltar ao site
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Termos de Uso
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Última atualização: {dataAtualizacao}
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">

          <section>
            <p>
              Bem-vindo ao <strong>{empresa}</strong>. Ao acessar ou usar nosso serviço em{' '}
              <a href={site} className="text-green-600 hover:underline">{site}</a>,
              você concorda com estes Termos de Uso. Leia atentamente antes de utilizar o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              1. Descrição do serviço
            </h2>
            <p>
              O {empresa} é um aplicativo de gestão financeira pessoal que permite registrar
              transações, definir metas, visualizar relatórios e obter insights financeiros
              gerados por inteligência artificial. O serviço é oferecido no modelo freemium,
              com plano gratuito e plano Pro pago.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              2. Cadastro e conta
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Você deve ter pelo menos 18 anos para criar uma conta.</li>
              <li>As informações fornecidas no cadastro devem ser verdadeiras e precisas.</li>
              <li>Você é responsável por manter a confidencialidade da sua senha.</li>
              <li>Notifique-nos imediatamente em caso de uso não autorizado da sua conta.</li>
              <li>Cada pessoa pode ter apenas uma conta gratuita.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              3. Planos e pagamentos
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Plano gratuito:</strong> limitado a 50 lançamentos por mês, sem acesso aos recursos Pro.</li>
              <li><strong>Plano Pro mensal:</strong> R$ 19,90/mês, com acesso a todos os recursos.</li>
              <li><strong>Plano Pro anual:</strong> R$ 159,00/ano, equivalente a 2 meses grátis.</li>
              <li>Os pagamentos são processados pelo Kirvano. Ao assinar, você concorda também com os termos do Kirvano.</li>
              <li>O acesso Pro é ativado imediatamente após a confirmação do pagamento.</li>
              <li>Não realizamos reembolsos após 7 dias da contratação, conforme o Código de Defesa do Consumidor.</li>
              <li>Dentro de 7 dias da contratação, você pode solicitar reembolso integral pelo e-mail {email}.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              4. Uso aceitável
            </h2>
            <p className="mb-3">Ao usar o {empresa}, você concorda em não:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Usar o serviço para fins ilegais ou fraudulentos.</li>
              <li>Tentar acessar dados de outros usuários.</li>
              <li>Realizar engenharia reversa ou tentar comprometer a segurança do sistema.</li>
              <li>Usar automações ou bots para acessar o serviço sem autorização prévia.</li>
              <li>Compartilhar sua conta com terceiros.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              5. Isenção de responsabilidade financeira
            </h2>
            <p className="mb-3">
              O {empresa} é uma ferramenta de organização financeira pessoal.
              Os insights gerados pela inteligência artificial são informativos e educacionais.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Não somos uma instituição financeira, banco ou corretora.</li>
              <li>As análises e sugestões geradas pela IA não constituem consultoria financeira profissional.</li>
              <li>Decisões financeiras são de exclusiva responsabilidade do usuário.</li>
              <li>Recomendamos consultar um profissional financeiro habilitado para decisões de investimento.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              6. Disponibilidade do serviço
            </h2>
            <p>
              Nos esforçamos para manter o serviço disponível 24 horas por dia, 7 dias por semana.
              No entanto, não garantimos disponibilidade ininterrupta. Podemos realizar manutenções
              programadas com aviso prévio por e-mail. Não nos responsabilizamos por perdas
              decorrentes de indisponibilidade temporária do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              7. Propriedade intelectual
            </h2>
            <p>
              Todo o conteúdo do {empresa} — incluindo código, design, logos e textos —
              é de nossa propriedade exclusiva e protegido por direitos autorais.
              Os dados financeiros inseridos por você permanecem de sua propriedade.
              Você nos concede licença limitada para processar esses dados com o único
              objetivo de fornecer o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              8. Cancelamento e exclusão de conta
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Você pode cancelar sua assinatura a qualquer momento pelo e-mail de suporte.</li>
              <li>Após o cancelamento, o acesso Pro permanece ativo até o fim do período pago.</li>
              <li>Para excluir sua conta e todos os dados associados, entre em contato pelo e-mail {email}.</li>
              <li>Reservamos o direito de encerrar contas que violem estes termos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              9. Limitação de responsabilidade
            </h2>
            <p>
              Na máxima extensão permitida pela lei brasileira, o {empresa} não será responsável
              por danos indiretos, incidentais ou consequentes decorrentes do uso ou
              impossibilidade de uso do serviço. Nossa responsabilidade total não excederá
              o valor pago pelo usuário nos últimos 3 meses.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              10. Alterações nos termos
            </h2>
            <p>
              Podemos modificar estes termos a qualquer momento. Notificaremos você por e-mail
              com pelo menos 15 dias de antecedência sobre mudanças significativas.
              O uso continuado do serviço após as alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              11. Lei aplicável
            </h2>
            <p>
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida
              no foro da comarca de domicílio do consumidor, conforme o Código de Defesa
              do Consumidor (Lei nº 8.078/1990).
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              12. Contato
            </h2>
            <ul className="list-none space-y-2">
              <li>📧 <a href={`mailto:${email}`} className="text-green-600 hover:underline">{email}</a></li>
              <li>🌐 <a href={site} className="text-green-600 hover:underline">{site}</a></li>
            </ul>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-6 mt-10">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400 dark:text-gray-600">
          <span>© 2026 FinanceApp. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <a href="/termos" className="hover:text-green-600 transition">Termos de Uso</a>
            <a href="/privacidade" className="hover:text-green-600 transition">Privacidade</a>
          </div>
        </div>
      </footer>

    </div>
  )
}