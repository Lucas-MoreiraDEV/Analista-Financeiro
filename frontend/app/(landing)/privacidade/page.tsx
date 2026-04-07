export default function Privacidade() {
  const dataAtualizacao = '06 de abril de 2026'
  const empresa = 'FinanceApp'
  const email = 'suporte@financeapp.com.br'
  const site = 'https://financeapp.com.br'

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* Header simples */}
      <header className="border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <a href="/" className="text-lg font-bold text-green-600">FinanceApp</a>
          <a href="/cadastro" className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 transition">
            Voltar ao site
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* Título */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Política de Privacidade
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Última atualização: {dataAtualizacao}
          </p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">

          <section>
            <p>
              O <strong>{empresa}</strong> ("nós", "nosso") leva a privacidade dos seus dados muito a sério.
              Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos
              suas informações pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD —
              Lei nº 13.709/2018).
            </p>
            <p className="mt-4">
              Ao utilizar nosso serviço em <a href={site} className="text-green-600 hover:underline">{site}</a>,
              você concorda com os termos desta política.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              1. Quais dados coletamos
            </h2>
            <p className="mb-3">Coletamos apenas os dados necessários para o funcionamento do serviço:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Dados de conta:</strong> nome de usuário e endereço de e-mail fornecidos no cadastro.</li>
              <li><strong>Dados financeiros:</strong> transações, categorias, metas e valores que você insere voluntariamente no aplicativo.</li>
              <li><strong>Dados de pagamento:</strong> não armazenamos dados de cartão de crédito. Os pagamentos são processados pelo Kirvano, que possui sua própria política de privacidade.</li>
              <li><strong>Dados de uso:</strong> informações sobre como você utiliza o aplicativo (páginas acessadas, funcionalidades usadas), coletados de forma anônima para melhoria do serviço.</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador e dispositivo, coletados automaticamente para segurança e funcionamento do serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              2. Como usamos seus dados
            </h2>
            <p className="mb-3">Utilizamos seus dados exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Criar e gerenciar sua conta no {empresa}.</li>
              <li>Fornecer as funcionalidades do aplicativo, incluindo análises financeiras e relatórios com inteligência artificial.</li>
              <li>Processar pagamentos e gerenciar assinaturas.</li>
              <li>Enviar comunicações relacionadas ao serviço (confirmações de conta, avisos de expiração de plano).</li>
              <li>Melhorar continuamente o produto com base em dados anônimos de uso.</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>
            <p className="mt-4 font-medium">
              Não vendemos, alugamos ou compartilhamos seus dados financeiros com terceiros para fins comerciais.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              3. Inteligência artificial e seus dados
            </h2>
            <p className="mb-3">
              O {empresa} utiliza a API da Anthropic (Claude) para gerar insights financeiros personalizados.
              Ao utilizar os recursos de inteligência artificial do plano Pro:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Seus dados financeiros (valores agregados e categorias) são enviados à API da Anthropic para processamento.</li>
              <li>Não enviamos dados pessoais identificáveis (nome, e-mail, CPF) para a IA — apenas dados financeiros agregados.</li>
              <li>A Anthropic processa esses dados conforme sua própria política de privacidade disponível em <a href="https://anthropic.com/privacy" className="text-green-600 hover:underline" target="_blank">anthropic.com/privacy</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              4. Armazenamento e segurança
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Seus dados são armazenados no Supabase, com infraestrutura hospedada na AWS com criptografia em repouso e em trânsito.</li>
              <li>Utilizamos Row Level Security (RLS) no banco de dados — isso significa que cada usuário só pode acessar seus próprios dados.</li>
              <li>Todas as comunicações entre o navegador e nossos servidores são protegidas por HTTPS/TLS.</li>
              <li>Senhas são armazenadas com hash seguro e nunca em texto puro.</li>
              <li>Realizamos backups automáticos diários dos dados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              5. Compartilhamento de dados
            </h2>
            <p className="mb-3">
              Compartilhamos seus dados apenas com os seguintes prestadores de serviço essenciais:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Supabase:</strong> banco de dados e autenticação.</li>
              <li><strong>Vercel:</strong> hospedagem do aplicativo.</li>
              <li><strong>Kirvano:</strong> processamento de pagamentos.</li>
              <li><strong>Anthropic:</strong> geração de insights com IA (apenas plano Pro).</li>
            </ul>
            <p className="mt-4">
              Todos os prestadores são obrigados contratualmente a proteger seus dados e utilizá-los
              apenas para os fins especificados.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              6. Seus direitos (LGPD)
            </h2>
            <p className="mb-3">
              Conforme a Lei Geral de Proteção de Dados, você tem os seguintes direitos:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Acesso:</strong> solicitar uma cópia de todos os seus dados armazenados.</li>
              <li><strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li><strong>Exclusão:</strong> solicitar a exclusão dos seus dados pessoais a qualquer momento.</li>
              <li><strong>Portabilidade:</strong> solicitar seus dados em formato estruturado e legível.</li>
              <li><strong>Revogação:</strong> revogar o consentimento para o tratamento dos seus dados.</li>
              <li><strong>Oposição:</strong> opor-se ao tratamento de dados em determinadas circunstâncias.</li>
            </ul>
            <p className="mt-4">
              Para exercer qualquer um desses direitos, entre em contato pelo e-mail{' '}
              <a href={`mailto:${email}`} className="text-green-600 hover:underline">{email}</a>.
              Atenderemos sua solicitação em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              7. Cookies
            </h2>
            <p className="mb-3">Utilizamos cookies essenciais para o funcionamento do serviço:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Cookies de sessão:</strong> para manter você autenticado durante o uso do aplicativo.</li>
              <li><strong>Cookies de preferência:</strong> para lembrar suas configurações (como tema escuro).</li>
            </ul>
            <p className="mt-4">
              Não utilizamos cookies de rastreamento de terceiros ou publicidade dentro do aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              8. Retenção de dados
            </h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Após a exclusão da conta,
              seus dados pessoais são removidos em até 30 dias, exceto quando a retenção for
              necessária para cumprimento de obrigações legais.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              9. Menores de idade
            </h2>
            <p>
              O {empresa} não é destinado a menores de 18 anos. Não coletamos intencionalmente
              dados de menores. Se identificarmos que coletamos dados de um menor, excluiremos
              essas informações imediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              10. Alterações nesta política
            </h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos você por e-mail
              sobre mudanças significativas. O uso continuado do serviço após as alterações
              constitui aceitação da nova política.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
              11. Contato
            </h2>
            <p className="mb-3">
              Para dúvidas, solicitações ou reclamações sobre esta política ou o tratamento
              dos seus dados, entre em contato:
            </p>
            <ul className="list-none space-y-2">
              <li>📧 <a href={`mailto:${email}`} className="text-green-600 hover:underline">{email}</a></li>
              <li>🌐 <a href={site} className="text-green-600 hover:underline">{site}</a></li>
            </ul>
            <p className="mt-4">
              Você também pode registrar reclamações à Autoridade Nacional de Proteção de Dados
              (ANPD) em <a href="https://www.gov.br/anpd" className="text-green-600 hover:underline" target="_blank">gov.br/anpd</a>.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
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