import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { SITE_URL } from '@/lib/site';
import { isAdminEmail } from '@/lib/admin';

export const dynamic = 'force-dynamic';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// POST /api/notify-post  { postId }
// Manda um email pra cada pessoa cadastrada no portal avisando do post
// novo. Só funciona chamado pelo painel /admin com a sessão do Kauã:
// 1) valida a sessão (cookie) e confere se o email é de admin;
// 2) busca o post (precisa estar publicado);
// 3) lista os usuários do Supabase (service role);
// 4) dispara os emails em lotes pela Resend.
export async function POST(req: NextRequest) {
  try {
    // Só aceita chamadas vindas do próprio site (defesa extra anti-CSRF,
    // além do cookie SameSite e da checagem de admin logo abaixo).
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host && new URL(origin).host !== host) {
      return NextResponse.json({ error: 'Origem não permitida' }, { status: 403 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
    }

    // ── 1. Quem está chamando? (sessão real via cookie, não dá pra forjar)
    const cookieStore = await cookies();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // esta rota só lê a sessão, nunca grava cookie
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!isAdminEmail(user?.email)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // ── 2. Ferramentas de admin prontas?
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json(
        {
          error:
            'Falta a env SUPABASE_SERVICE_ROLE_KEY na Vercel (Settings → Environment Variables). Ela está no Supabase em Settings → API → service_role.',
        },
        { status: 500 }
      );
    }
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Falta a env RESEND_API_KEY na Vercel — sem ela nenhum email sai.' },
        { status: 500 }
      );
    }

    const { postId } = await req.json();
    if (!postId || typeof postId !== 'string') {
      return NextResponse.json({ error: 'postId inválido' }, { status: 400 });
    }

    const admin = createSupabaseClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: post, error: postError } = await admin
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();
    if (postError || !post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    }
    if (!post.published) {
      return NextResponse.json(
        { error: 'O post ainda não está publicado — publique antes de avisar.' },
        { status: 400 }
      );
    }

    // ── 3. Todo mundo que criou conta no portal
    const emails = new Set<string>();
    let page = 1;
    const perPage = 1000;
    // Teto de segurança bem acima do realista pra um site pessoal
    while (page <= 20) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) {
        return NextResponse.json(
          { error: `Não consegui listar os inscritos: ${error.message}` },
          { status: 500 }
        );
      }
      for (const u of data.users) {
        if (u.email) emails.add(u.email.toLowerCase());
      }
      if (data.users.length < perPage) break;
      page++;
    }

    if (emails.size === 0) {
      return NextResponse.json({ sent: 0, failed: 0, total: 0 });
    }

    // ── 4. O email em si — simples, com a cara do site
    const postUrl = `${SITE_URL}/blog/${post.slug}`;
    const title = escapeHtml(post.title);
    const excerpt = post.excerpt ? escapeHtml(post.excerpt) : '';
    const html = `
      <div style="font-family: sans-serif; background: #051F20; color: #E8F5EE; padding: 36px 28px; border-radius: 14px;">
        <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #7FD8A4;">Post novo no blog</p>
        <h1 style="margin: 0 0 16px; font-size: 24px; line-height: 1.3; color: #ffffff;">${title}</h1>
        ${excerpt ? `<p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #B9D6C5;">${excerpt}</p>` : ''}
        <a href="${postUrl}" style="display: inline-block; background: #35E065; color: #04100a; font-weight: bold; font-size: 14px; padding: 12px 26px; border-radius: 999px; text-decoration: none;">Ler o post →</a>
        <hr style="border: none; border-top: 1px solid #10352c; margin: 28px 0 16px;">
        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #6E8F7D;">
          Você recebe este aviso porque criou conta no site do Kauã.
          Não quer mais receber? Responda este email pedindo pra sair da lista.
        </p>
      </div>
    `;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const list = [...emails];
    let sent = 0;
    let failed = 0;

    // Lotes de 100 (limite do batch da Resend); cada pessoa recebe o SEU
    // email individual — ninguém vê o endereço de ninguém.
    for (let i = 0; i < list.length; i += 100) {
      const chunk = list.slice(i, i + 100).map((to) => ({
        from: 'Site KauaArtx <onboarding@resend.dev>',
        to: [to],
        replyTo: 'kauaartx@gmail.com',
        subject: `Post novo: ${post.title}`,
        html,
      }));
      const { error } = await resend.batch.send(chunk);
      if (error) {
        console.error('[notify-post] Lote recusado pela Resend:', error);
        failed += chunk.length;
      } else {
        sent += chunk.length;
      }
    }

    return NextResponse.json({ sent, failed, total: list.length });
  } catch (err) {
    console.error('[notify-post] Erro inesperado:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
