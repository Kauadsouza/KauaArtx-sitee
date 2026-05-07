import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(20),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const { error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: ['kauadsouza@gmail.com'],
      replyTo: data.email,
      subject: `[Portfolio] ${data.subject}`,
      html: `
        <div style="font-family: monospace; background: #050505; color: #EDEDED; padding: 32px; border-radius: 8px;">
          <h2 style="color: #2D7A5C; margin: 0 0 24px;">Nova mensagem do portfolio</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #888; padding: 8px 0; width: 80px;">De:</td>
              <td style="color: #EDEDED;">${data.name} &lt;${data.email}&gt;</td>
            </tr>
            <tr>
              <td style="color: #888; padding: 8px 0;">Assunto:</td>
              <td style="color: #EDEDED;">${data.subject}</td>
            </tr>
          </table>
          <hr style="border: 1px solid #1A1A1A; margin: 24px 0;">
          <div style="color: #EDEDED; line-height: 1.6; white-space: pre-wrap;">${data.message}</div>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
