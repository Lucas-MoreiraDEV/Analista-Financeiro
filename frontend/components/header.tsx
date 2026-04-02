'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Header() {
  const [userName, setUserName] = useState('')
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

  async function sair() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/transacoes', label: 'Transações' },
    { href: '/metas', label: 'Metas' },
    { href: '/relatorios', label: 'Relatorio IA' },
    { href: '/upgrade', label: 'Planos' },
  ]

  return (
    <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-bold text-green-600">FinanceApp</h1>
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
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Ola, {userName}</span>
        <button
          onClick={sair}
          className="text-sm text-gray-400 hover:text-red-500 transition"
        >
          Sair
        </button>
      </div>
    </nav>
  )
}