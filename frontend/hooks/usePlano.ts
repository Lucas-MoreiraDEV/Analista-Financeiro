'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export function usePlano() {
  const [plano, setPlano] = useState<'free' | 'pro'>('free')
  const [carregando, setCarregando] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function buscar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('plano')
        .eq('id', user.id)
        .single()

      setPlano(data?.plano ?? 'free')
      setCarregando(false)
    }
    buscar()
  }, [])

  return { plano, isPro: plano === 'pro', carregando }
}