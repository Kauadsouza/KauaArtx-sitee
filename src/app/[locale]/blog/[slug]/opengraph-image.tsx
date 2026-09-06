import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/supabase/server';
import { SITE_NAME } from '@/lib/site';

// A imagem que aparece quando o link do post é colado no WhatsApp, LinkedIn,
// X. Post COM capa já usa a capa (ver o generateMetadata da página); esta aqui
// é pros que não têm — em vez do cartão genérico do site, sai o título do post
// escrito grande, que é o que faz a pessoa entender o link antes de abrir.
export const alt = 'Post do blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function PostOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  const titulo = post?.title ?? SITE_NAME;
  const resumo = post?.excerpt ?? null;

  // Título comprido pede letra menor, senão estoura o cartão
  const tamanho = titulo.length > 80 ? 54 : titulo.length > 48 ? 66 : 82;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#04100a',
          padding: '72px 80px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Aurora, a mesma assinatura do resto do site */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: -140,
            width: 760,
            height: 620,
            background:
              'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(99,247,141,0.30), transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -240,
            right: -120,
            width: 720,
            height: 600,
            background:
              'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(75,238,198,0.24), transparent 72%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: '#63F78D',
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: '#8EB69B',
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: tamanho,
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: -1.5,
              color: '#DAF1DE',
              display: 'flex',
            }}
          >
            {titulo}
          </div>
          {resumo && (
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.35,
                color: '#8EB69B',
                display: 'flex',
              }}
            >
              {resumo.length > 150 ? `${resumo.slice(0, 150)}…` : resumo}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', height: 6, gap: 0 }}>
          <div style={{ flex: 1, background: '#63F78D' }} />
          <div style={{ flex: 1, background: '#4BEEC6' }} />
          <div style={{ flex: 2, background: 'rgba(35,83,71,0.6)' }} />
        </div>
      </div>
    ),
    size
  );
}
