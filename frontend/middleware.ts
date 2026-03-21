import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(),
                 setAll: (c) => c.forEach(({ name, value, options }) =>
                   response.cookies.set(name, value, options)) } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redireciona para login se não autenticado
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redireciona para dashboard se já logado
  if (user && (request.nextUrl.pathname === '/login' ||
               request.nextUrl.pathname === '/cadastro')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/cadastro']
}