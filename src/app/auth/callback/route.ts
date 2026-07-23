import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Recebe a volta do login social (Google/GitHub) e do link de e-mail.
// Fica FORA de [locale] de propósito — igual ao /admin, é uma rota técnica,
// não uma página traduzida. O middleware deixa ela passar sem prefixo de
// idioma (ver src/middleware.ts).
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';
  // "next" vem do próprio site (window.location.pathname no momento do
  // clique) — nunca de fora, então é seguro usar como destino do redirect.
  const redirectUrl = new URL(next, url.origin);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!code || !supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.redirect(redirectUrl);
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Troca o código pela sessão real — grava os cookies que o cliente do
  // navegador (createBrowserClient) já sabe ler.
  await supabase.auth.exchangeCodeForSession(code);

  return response;
}
