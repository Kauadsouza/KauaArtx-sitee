'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Geometry } from 'geojson';
import worldTopo from 'world-atlas/countries-110m.json';
import { TRAVELS, type TravelStatus } from '@/data/travels';

// Dimensões do desenho (viewBox) — o SVG estica junto com a tela
const W = 980;
const H = 520;

// Verde vívido usado só pra glow de destaque (mesmo tom do "você está
// aqui" da trilha em /about — rgba(53,224,101,…)). Fora daqui o mapa usa
// só os tokens reais de globals.css: a marca é um verde monocromático
// (escuro → menta), sem ciano — isso era invenção da versão anterior.
const GLOW_GREEN = '#35E065';

// Mapa-múndi da jornada, estilo "rede brilhante": contorno com glow em
// vez de preenchimento sólido, malha de latitude/longitude por trás (a
// textura de rede), pinos nos lugares de TRAVELS e a rota pontilhada
// ligando-os na ordem. Passar o mouse (ou tocar) num pino abre o cartão.
export default function WorldMap() {
  const t = useTranslations('map');
  const locale = useLocale() as 'pt' | 'en';
  const [activeId, setActiveId] = useState<string | null>(null);

  // Toda a geometria é calculada UMA vez — daí em diante é só desenhar
  const { countryPaths, graticuleD, stops, routeD } = useMemo(() => {
    const topo = worldTopo as unknown as Topology<{
      countries: GeometryCollection;
    }>;
    const world = feature(
      topo,
      topo.objects.countries
    ) as FeatureCollection<Geometry>;

    // Sem a Antártida o mapa preenche melhor o quadro (ninguém mora lá… ainda)
    const lands = {
      ...world,
      features: world.features.filter((f) => f.id !== '010'),
    };

    const projection = geoNaturalEarth1();
    projection.fitSize([W, H], lands);
    const path = geoPath(projection);

    const countryPaths = lands.features
      .map((f) => path(f))
      .filter(Boolean) as string[];

    // Malha de 10° de latitude/longitude — é ela que dá a sensação de
    // rede/globo conectado, sem precisar inventar pontos de dados falsos
    const graticuleD = path(geoGraticule10());

    const stops = TRAVELS.map((s) => {
      const pos = projection(s.coords);
      return { ...s, x: pos?.[0] ?? 0, y: pos?.[1] ?? 0 };
    });

    // Rota da jornada: linha geodésica (curva real no globo) ligando os
    // pontos na ordem da lista
    const routeD =
      TRAVELS.length > 1
        ? path({
            type: 'LineString',
            coordinates: TRAVELS.map((s) => s.coords),
          })
        : null;

    return { countryPaths, graticuleD, stops, routeD };
  }, []);

  const active = stops.find((s) => s.id === activeId) ?? null;

  const statusLabel: Record<TravelStatus, string> = {
    lived: t('status_lived'),
    visited: t('status_visited'),
    planned: t('status_planned'),
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl border border-border overflow-hidden p-3 sm:p-6"
        style={{ background: 'var(--deep)' }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={t('map_alt')}
          className="w-full h-auto select-none"
        >
          <defs>
            {/* Mesma receita do fio de luz usado nos cards do site
                (.hairline-gradient): transparente → menta → sálvia →
                transparente. Aqui vira o contorno dos continentes e a rota. */}
            <linearGradient id="map-line" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent2)" stopOpacity="0.25" />
              <stop offset="45%" stopColor="var(--accent-bright)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--accent2-bright)" stopOpacity="0.35" />
            </linearGradient>
            {/* Glow: desenha borrado por baixo e nítido por cima — o
                clássico contorno neon, sem precisar de sombra por elemento */}
            <filter id="map-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="pin-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* Malha de latitude/longitude — a textura de rede do fundo */}
          {graticuleD && (
            <path
              d={graticuleD}
              fill="none"
              stroke="var(--fg-subtle)"
              strokeOpacity={0.14}
              strokeWidth={0.5}
            />
          )}

          {/* Continentes: contorno com glow, sem preenchimento sólido */}
          <g filter="url(#map-glow)">
            {countryPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="var(--accent)"
                fillOpacity={0.05}
                stroke="url(#map-line)"
                strokeWidth={0.7}
              />
            ))}
          </g>

          {/* Rota da jornada — pulso lento de "sinal viajando" */}
          {routeD && (
            <path
              d={routeD}
              fill="none"
              stroke="url(#map-line)"
              strokeWidth={1.8}
              strokeDasharray="1.5 7"
              strokeLinecap="round"
              filter="url(#map-glow)"
              className="animate-route-flow"
            />
          )}

          {/* Pinos */}
          {stops.map((s, i) => {
            const isLived = s.status === 'lived';
            const isPlanned = s.status === 'planned';
            const fillColor = isLived ? GLOW_GREEN : isPlanned ? 'var(--deep)' : 'var(--accent)';
            const ringColor = isPlanned ? 'var(--fg-subtle)' : GLOW_GREEN;
            const isActive = activeId === s.id;
            return (
              <motion.g
                key={s.id}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="[transform-box:fill-box] origin-center cursor-pointer"
                onMouseEnter={() => setActiveId(s.id)}
                onMouseLeave={() => setActiveId((cur) => (cur === s.id ? null : cur))}
                onClick={() => setActiveId((cur) => (cur === s.id ? null : s.id))}
              >
                <g filter="url(#pin-glow)">
                  {/* Pulso da base (onde ele está agora) */}
                  {isLived && (
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r={9}
                      fill={GLOW_GREEN}
                      opacity={0.35}
                      className="animate-ping [transform-box:fill-box] origin-center"
                    />
                  )}
                  {/* Halo suave — lugares "na mira" não brilham ainda */}
                  {!isPlanned && (
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r={isLived ? 11 : 9}
                      fill={fillColor}
                      opacity={0.16}
                    />
                  )}
                  {/* O pino em si */}
                  {isPlanned ? (
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r={5}
                      fill={fillColor}
                      stroke={ringColor}
                      strokeWidth={1.6}
                      strokeDasharray="2.5 2.5"
                    />
                  ) : (
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r={isLived ? 6 : 5}
                      fill={fillColor}
                      stroke="var(--deep)"
                      strokeWidth={1.4}
                    />
                  )}
                </g>
                {/* Nome ao lado do pino — sem blur, sempre legível */}
                <text
                  x={s.x + 11}
                  y={s.y + 4}
                  fontSize={12}
                  fontWeight={isActive ? 700 : 500}
                  fill={isActive ? 'var(--fg)' : isPlanned ? 'var(--fg-subtle)' : 'var(--fg-muted)'}
                  stroke="var(--deep)"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {s.name[locale]}
                </text>
                {/* Área de toque generosa (invisível) */}
                <circle cx={s.x} cy={s.y} r={16} fill="transparent" />
              </motion.g>
            );
          })}
        </svg>

        {/* Cartão de detalhes do lugar ativo */}
        {active && (
          <div
            className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 rounded-2xl glass-strong border border-border p-4 shadow-xl shadow-black/40"
            style={{
              left: `${(active.x / W) * 100}%`,
              top: `calc(${(active.y / H) * 100}% + 18px)`,
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                aria-hidden
                className="w-2 h-2 rounded-full"
                style={{
                  background: active.status === 'lived' ? GLOW_GREEN : 'var(--accent)',
                }}
              />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle">
                {statusLabel[active.status]}
                {active.year ? ` · ${active.year}` : ''}
              </span>
            </div>
            <p className="font-bold text-foreground text-sm mb-1">
              {active.name[locale]}
              {active.country[locale] !== active.name[locale] ? ` — ${active.country[locale]}` : ''}
            </p>
            {active.note && (
              <p className="text-xs text-foreground-muted leading-relaxed">
                {active.note[locale]}
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Legenda */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {(['lived', 'visited', 'planned'] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-2 text-xs text-foreground-muted">
            {s === 'planned' ? (
              <span
                aria-hidden
                className="w-3 h-3 rounded-full border-2 border-dashed"
                style={{ borderColor: 'var(--fg-subtle)' }}
              />
            ) : (
              <span
                aria-hidden
                className="w-3 h-3 rounded-full"
                style={{ background: s === 'lived' ? GLOW_GREEN : 'var(--accent)' }}
              />
            )}
            {statusLabel[s]}
          </span>
        ))}
      </div>
    </div>
  );
}
