import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';
import { isAdminEmail } from './lib/admin';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Área admin: protegida por sessão Supabase, fora do sistema de idiomas
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return adminMiddleware(request);
  }

  // Callback do login social (Google/GitHub): rota técnica, sem prefixo de
  // idioma — se passasse pelo next-intl, seria redirecionada pra /pt/auth/...
  // e o código de troca da sessão se perderia no meio do caminho.
  if (pathname === '/auth/callback') {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

async function adminMiddleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({ request });

  // Supabase ainda não configurado — a página de login mostra o guia de setup
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // getUser() valida o token no servidor do Supabase — não confia só no cookie
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname.startsWith('/admin/login');

  if (!user && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
  }

  // Sessão válida NÃO basta: o portal da home cria conta real pra qualquer
  // visitante (email/Google/GitHub). O painel só abre pra email de admin —
  // sem isso, qualquer pessoa cadastrada veria o painel inteiro (o RLS
  // barra a escrita no banco, mas a porta é a primeira camada). Não-admin
  // logado volta pra home, inclusive na página de login (senão entraria em
  // loop /admin/login → /admin → /admin/login).
  if (user && !isAdminEmail(user.email)) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    return NextResponse.redirect(homeUrl);
  }

  if (user && isLoginPage) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = '/admin';
    return NextResponse.redirect(adminUrl);
  }

  return response;
}

export const config = {
  // Exclui: api, assets do Next, arquivos com extensão e rotas de metadata
  // sem extensão (opengraph-image/twitter-image), que não têm versão por idioma
  matcher: ['/((?!api|_next|_vercel|opengraph-image|twitter-image|.*\\..*).*)'],
};
