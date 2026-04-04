'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Cadastro() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { email }
      }
    })

    if (error) {
      setErro(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
  <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-200 w-full max-w-md">
      
      {/* Cabeçalho do Formulário */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Criar conta</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Grátis para sempre no plano <span className="font-semibold text-green-600">Basic</span>
        </p>
      </div>

      <form onSubmit={handleCadastro} className="flex flex-col gap-5">
        <div>
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mt-1.5 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            minLength={6}
            className="mt-1.5 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {erro && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3">
            <p className="text-red-700 text-xs font-medium">{erro}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-md shadow-green-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Criando conta...
            </span>
          ) : (
            'Criar conta grátis'
          )}
        </button>
      </form>

      {/* Footer do Card */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Já tem uma conta?{' '}
          <a href="/login" className="text-green-600 font-bold hover:text-green-700 transition-colors">
            Entrar agora
          </a>
        </p>
      </div>
      
      <p className="text-[10px] text-gray-400 text-center mt-6 uppercase tracking-widest font-medium">
        🔒 Seus dados estão seguros
      </p>
    </div>
  </main>
)
}