import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

// Force dynamic so Next.js never tries to statically analyze this route
export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  subject: z.string().min(3).max(150),
  message: z.string().min(20).max(5000),
});

// Escapa HTML pra ninguém injetar código no email
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Rate limit simples por IP: máx. 5 envios a cada 10 minutos por instância
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; start: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    return false;
  }
  entry.count++;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  try {
    // Só aceita envios vindos do próprio site (bloqueia abuso cross-site)
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host && new URL(origin).host !== host) {
      return NextResponse.json({ error: 'Origem não permitida' }, { status: 403 });
    }

    // Payload máximo: 25 KB (o formulário legítimo nunca passa disso)
    const contentLength = Number(req.headers.get('content-length') ?? 0);
    if (contentLength > 25_000) {
      return NextResponse.json({ error: 'Payload muito grande' }, { status: 413 });
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde alguns minutos.' },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Honeypot: campo invisível pra humanos — se veio preenchido, é bot.
    // Responde sucesso pra não dar pista.
    if (typeof body?.website === 'string' && body.website.length > 0) {
      return NextResponse.json({ success: true });
    }

    const data = schema.parse(body);

    const name = escapeHtml(data.name);
    const subject = escapeHtml(data.subject);
    const message = escapeHtml(data.message);
    const email = escapeHtml(data.email);

    // Sem chave o envio nunca sai — avisa nos logs em vez de estourar
    // um "Erro interno" genérico que não diz nada.
    if (!process.env.RESEND_API_KEY) {
      console.error('[contact] RESEND_API_KEY ausente — email não enviado');
      return NextResponse.json({ error: 'Falha no envio' }, { status: 500 });
    }

    // Instantiate inside the handler so it only runs at request time
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: 'Site Kauã <onboarding@resend.dev>',
      to: ['kauaartx@gmail.com'],
      replyTo: data.email,
      subject: `[Site] ${data.subject} — ${name}`,
      html: `
        <div style="font-family: sans-serif; background: #fffdf8; color: #1c1917; padding: 32px; border-radius: 12px; border: 1px solid #ece7dc;">
          <h2 style="color: #047857; margin: 0 0 24px;">Nova mensagem do site</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #a8a29e; padding: 8px 0; width: 80px;">De:</td>
              <td style="color: #1c1917;">${name} &lt;${email}&gt;</td>
            </tr>
            <tr>
              <td style="color: #a8a29e; padding: 8px 0;">Assunto:</td>
              <td style="color: #1c1917;">${subject}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #ece7dc; margin: 24px 0;">
          <div style="color: #1c1917; line-height: 1.6; white-space: pre-wrap;">${message}</div>
        </div>
      `,
    });

    if (error) {
      // O motivo real (chave inválida, cota, destinatário bloqueado no modo
      // teste do Resend) só aparece aqui — sem isso o log da Vercel fica mudo.
      console.error('[contact] Resend recusou o envio:', error);
      return NextResponse.json({ error: 'Falha no envio' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }
    console.error('[contact] Erro inesperado:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
