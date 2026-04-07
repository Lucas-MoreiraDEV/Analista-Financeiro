export default function Home() {
  return (
    <main className="bg-blue-500">
      <h1>Assistente Financeiro</h1>
          <a href="/login"
            className="w-40 bg-green-600 text-white py-4 rounded-xl font-black text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 active:scale-95 disabled:opacity-50"
          >
            Clique aqui para começar
          </a>

      <footer className="footer">
        <div className="f-logo">Finance<span>App</span></div>
        <div className="f-links">
          <a href="#funcionalidades" className="f-link">Funcionalidades</a>
          <a href="#precos" className="f-link">Preços</a>
          <a href="/login" className="f-link">Entrar</a>
          <a href="/privacidade" className="f-link">Privacidade</a>
          <a href="/termos" className="f-link">Termos</a>
        </div>
        <div className="f-copy">© 2026 FinanceApp</div>
      </footer>
      </main>
  )
}
