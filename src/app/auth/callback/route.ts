import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Recebe a volta do login social (Google/GitHub) e do link de e-mail.
// Fica FORA de [locale] de propósito — igual ao /admin, é uma rota técnica,
// não uma página traduzida. O middleware deixa ela passar sem prefixo de
// idioma (ver src/middleware.ts).
export const dynamic = 'force-dynamic';

// O destino pós-login só pode ser um caminho INTERNO do site. Sem esta
// checagem, ?next=https://evil.com (ou //evil.com) viraria um open
// redirect: um link de phishing começando pelo nosso domínio confiável e
// terminando num site malicioso. "Vem do nosso próprio código" não protege
// nada — a URL é pública e qualquer um monta a query que quiser.
function safeNext(next: string | null): string {
  if (!next) return '/';
  if (!next.startsWith('/')) return '/'; // absoluto (https://…) — fora
  if (next.startsWith('//') || next.startsWith('/\\')) return '/'; // protocolo-relativo — fora
  return next;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const redirectUrl = new URL(safeNext(url.searchParams.get('next')), url.origin);

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
