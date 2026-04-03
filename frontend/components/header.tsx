'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Header() {
  const [userName, setUserName] = useState('')
  const [menuAberto, setMenuAberto] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function carregarUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserName(user.email?.split('@')[0] || '')
    }
    carregarUser()
  }, [])

  // Fecha menu ao navegar
  useEffect(() => { setMenuAberto(false) }, [pathname])

  async function sair() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/transacoes', label: 'Transacoes' },
    { href: '/metas', label: 'Metas' },
    { href: '/relatorios', label: 'Relatorio IA' },
    { href: '/upgrade', label: 'Planos' },
  ]

  return (
    <>
      <nav className="bg-white border-b px-4 md:px-6 py-4 flex justify-between items-center relative z-50">
        {/* Logo */}
        <h1 className="text-lg font-bold text-green-600">FinanceApp</h1>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm transition ${
                pathname === link.href
                  ? 'text-gray-700 font-medium'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Usuario + sair desktop */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm text-gray-500">Ola, {userName}</span>
          <button
            onClick={sair}
            className="text-sm text-gray-400 hover:text-red-500 transition"
          >
            Sair
          </button>
        </div>

        {/* Botao hamburguer mobile */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${menuAberto ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${menuAberto ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${menuAberto ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Menu mobile dropdown */}
      {menuAberto && (
        <div className="md:hidden bg-white border-b shadow-sm z-40 relative">
          <div className="px-4 py-2 border-b">
            <span className="text-sm text-gray-500">Ola, {userName}</span>
          </div>
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 text-sm border-b transition ${
                pathname === link.href
                  ? 'text-gray-900 font-medium bg-gray-50'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={sair}
            className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-50 transition"
          >
            Sair
          </button>
        </div>
      )}
    </>
  )
}