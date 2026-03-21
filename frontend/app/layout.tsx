import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Assistente Financeiro',
  description: 'Organize suas finanças com IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}