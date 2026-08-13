import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'Kauã Souza — Criador em Oxford';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const portrait = await readFile(
    join(process.cwd(), 'public/images/kaua-pixel.png')
  );
  const portraitSrc = `data:image/png;base64,${portrait.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#04100a',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Cortinas de aurora */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            left: -120,
            width: 700,
            height: 600,
            background:
              'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(99,247,141,0.32), transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -160,
            right: -80,
            width: 640,
            height: 560,
            background:
              'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(75,238,198,0.28), transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -220,
            left: 200,
            width: 800,
            height: 500,
            background:
              'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(53,224,101,0.16), transparent 72%)',
          }}
        />

        {/* Texto */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 0 0 84px',
            width: 720,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#9fbfaa',
              fontSize: 22,
              letterSpacing: 4,
              marginBottom: 28,
            }}
          >
            OXFORD · UK · NOVA FASE
          </div>
          <div
            style={{
              color: '#e9fbef',
              fontSize: 92,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -3,
            }}
          >
            Kauã Souza
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 40,
              fontWeight: 700,
              background: 'linear-gradient(100deg, #63f78d, #4beec6)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Criador em Oxford
          </div>
          <div
            style={{
              marginTop: 26,
              color: '#9fbfaa',
              fontSize: 26,
              lineHeight: 1.4,
            }}
          >
            Canal @KauaArtx · Preparando para estudar
          </div>
        </div>

        {/* Retrato pixel art */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portraitSrc}
          alt=""
          width={430}
          height={439}
          style={{
            position: 'absolute',
            right: 30,
            bottom: -10,
          }}
        />
      </div>
    ),
    { ...size }
  );
}

