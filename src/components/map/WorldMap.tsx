'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Geometry } from 'geojson';
import worldTopo from 'world-atlas/countries-110m.json';
import { TRAVELS, type TravelStatus } from '@/data/travels';

// Dimensões do desenho (viewBox) — o SVG estica junto com a tela
const W = 980;
const H = 520;

// Cores do mapa, na paleta da floresta noturna do site
const LAND_FILL = '#0A2622';
const LAND_STROKE = '#16382F';

const STATUS_COLOR: Record<TravelStatus, string> = {
  lived: '#35E065', // base — verde vivo (mesmo do "você está aqui" da trilha)
  visited: '#7FD8A4', // visitado — sálvia clara
  planned: '#5CC8DA', // planejado — ciano da segunda cor da marca
};

// Mapa-múndi da jornada: continentes em silhueta escura, pinos nos
// lugares da lista TRAVELS e a rota tracejada ligando os pontos na ordem.
// Passar o mouse (ou tocar) num pino abre o cartão com os detalhes.
export default function WorldMap() {
  const t = useTranslations('map');
  const locale = useLocale() as 'pt' | 'en';
  const [activeId, setActiveId] = useState<string | null>(null);

  // Toda a geometria é calculada UMA vez — daí em diante é só desenhar
  const { countryPaths, stops, routeD } = useMemo(() => {
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

    return { countryPaths, stops, routeD };
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
        className="relative rounded-3xl bg-surface border border-border overflow-hidden p-3 sm:p-6"
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={t('map_alt')}
          className="w-full h-auto select-none"
        >
          {/* Continentes */}
          <g>
            {countryPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill={LAND_FILL}
                stroke={LAND_STROKE}
                strokeWidth={0.6}
              />
            ))}
          </g>

          {/* Rota da jornada */}
          {routeD && (
            <path
              d={routeD}
              fill="none"
              stroke="#35E065"
              strokeOpacity={0.5}
              strokeWidth={1.6}
              strokeDasharray="2 6"
              strokeLinecap="round"
            />
          )}

          {/* Pinos */}
          {stops.map((s, i) => {
            const color = STATUS_COLOR[s.status];
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
                {/* Pulso da base (onde ele está agora) */}
                {s.status === 'lived' && (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={9}
                    fill={color}
                    opacity={0.35}
                    className="animate-ping [transform-box:fill-box] origin-center"
                  />
                )}
                {/* Halo suave */}
                <circle cx={s.x} cy={s.y} r={s.status === 'lived' ? 11 : 9} fill={color} opacity={0.14} />
                {/* O pino em si */}
                {s.status === 'planned' ? (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={5}
                    fill="#051F20"
                    stroke={color}
                    strokeWidth={1.6}
                    strokeDasharray="2.5 2.5"
                  />
                ) : (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={s.status === 'lived' ? 6 : 5}
                    fill={color}
                    stroke="#04100a"
                    strokeWidth={1.4}
                  />
                )}
                {/* Nome ao lado do pino */}
                <text
                  x={s.x + 11}
                  y={s.y + 4}
                  fontSize={12}
                  fontWeight={isActive ? 700 : 500}
                  fill={isActive ? '#EAF7EF' : '#BFDCCB'}
                  stroke="#04100a"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {s.name}
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
                style={{ background: STATUS_COLOR[active.status] }}
              />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle">
                {statusLabel[active.status]}
                {active.year ? ` · ${active.year}` : ''}
              </span>
            </div>
            <p className="font-bold text-foreground text-sm mb-1">
              {active.name}
              {active.country[locale] !== active.name ? ` — ${active.country[locale]}` : ''}
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
                style={{ borderColor: STATUS_COLOR[s] }}
              />
            ) : (
              <span
                aria-hidden
                className="w-3 h-3 rounded-full"
                style={{ background: STATUS_COLOR[s] }}
              />
            )}
            {statusLabel[s]}
          </span>
        ))}
      </div>
    </div>
  );
}
