'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase'

export default function Header() {
  const [userName, setUserName] = useState('')
  const [menuAberto, setMenuAberto] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    async function carregarUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserName(user.email?.split('@')[0] || '')
    }
    carregarUser()
  }, [])

  useEffect(() => { setMenuAberto(false) }, [pathname])

  async function sair() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/transacoes', label: 'Transações' },
    { href: '/metas', label: 'Metas' },
    { href: '/relatorios', label: 'Relatório IA' },
    { href: '/upgrade', label: 'Planos' },
  ]

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-4 flex justify-between items-center relative z-50 transition-colors duration-300">

        <h1 className="text-lg font-bold text-green-600">FinanceApp</h1>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm transition ${
                pathname === link.href
                  ? 'text-gray-700 dark:text-gray-100 font-medium'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <a href="/perfil"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            Olá, {userName}
          </a>

          {/* Toggle dark mode */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              title="Alternar tema"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          )}

          <button
            onClick={sair}
            className="text-sm text-gray-400 hover:text-red-500 transition"
          >
            Sair
          </button>
        </div>

        {/* Hamburguer mobile */}
        <div className="md:hidden flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          )}
          <button
            className="flex flex-col gap-1.5 p-1"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <span className={`block w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all ${menuAberto ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all ${menuAberto ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all ${menuAberto ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {menuAberto && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-40 relative">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <a href="/perfil"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            Olá, {userName}
          </a>
          </div>
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 text-sm border-b border-gray-100 dark:border-gray-800 transition ${
                pathname === link.href
                  ? 'text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-800'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={sair}
            className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition"
          >
            Sair
          </button>
        </div>
      )}
    </>
  )
}