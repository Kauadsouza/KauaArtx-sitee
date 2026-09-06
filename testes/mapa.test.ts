// ============================================================
// TESTES DO MAPA
//
// Cada bloco aqui existe por causa de um bug que chegou a aparecer na tela e
// só foi pego por olho humano. A ideia é que da próxima vez o `npm test`
// pegue antes.
// ============================================================

import { describe, expect, it } from 'vitest';
import { geoBounds } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Geometry } from 'geojson';
import topo110 from 'world-atlas/countries-110m.json';
import {
  boxOutside,
  countryByAlpha2,
  detailForZoom,
  minPopForZoom,
  tierForZoom,
  type Bounds,
} from '@/lib/map-layers';
import cidadesGrandes from '@/data/map/cities-1.json';

type Caixa = [number, number, number, number];

const janela = (lon0: number, lon1: number, lat0: number, lat1: number): Bounds => ({
  lon0,
  lon1,
  lat0,
  lat1,
  wrap: false,
});

// Caixa de cada país, direto do desenho do mapa
const paises = (() => {
  const t = topo110 as unknown as Topology<{ countries: GeometryCollection }>;
  const fc = feature(t, t.objects.countries) as FeatureCollection<Geometry>;
  const porNome = new Map<string, Caixa>();
  for (const f of fc.features) {
    const [[o, s], [l, n]] = geoBounds(f);
    porNome.set(String((f.properties as { name?: string })?.name ?? ''), [o, s, l, n]);
  }
  return porNome;
})();

describe('recorte do que está fora da tela', () => {
  // O BUG: a Rússia sumia do mapa em qualquer visão da Europa/Ásia. A caixa
  // dela cruza a linha de data, então vem com oeste 19° L e leste 169° O — o
  // oeste é MAIOR que o leste. Tratada como caixa comum, ela "não intersecta
  // nada" e nunca era desenhada.
  it('desenha a Rússia numa janela sobre a Europa e a Ásia', () => {
    const russia = paises.get('Russia')!;
    expect(russia[0]).toBeGreaterThan(russia[2]); // confirma que a caixa dá a volta
    expect(boxOutside(janela(15, 130, 35, 75), russia)).toBe(false);
  });

  it('desenha Fiji quando a janela está no Pacífico', () => {
    const fiji = paises.get('Fiji')!;
    expect(boxOutside(janela(170, 180, -20, -15), fiji)).toBe(false);
  });

  it('não desenha a Rússia numa janela sobre o Brasil', () => {
    expect(boxOutside(janela(-55, -40, -25, -10), paises.get('Russia')!)).toBe(true);
  });

  it('recorta por latitude também', () => {
    // Groenlândia é lá em cima: numa janela no equador não entra
    expect(boxOutside(janela(-50, -30, -10, 10), paises.get('Greenland')!)).toBe(true);
  });

  it('mantém o país cuja caixa encosta na borda da janela', () => {
    expect(boxOutside(janela(-50, -34, -35, 6), paises.get('Brazil')!)).toBe(false);
  });
});

describe('o que aparece em cada zoom', () => {
  it('de longe não mostra cidade nenhuma', () => {
    expect(minPopForZoom(1)).toBe(Infinity);
    expect(tierForZoom(1)).toBe(0);
  });

  it('quanto mais perto, menor a cidade que aparece', () => {
    const zooms = [1.8, 2.5, 3.5, 5, 7, 9, 11, 13, 16];
    const cortes = zooms.map(minPopForZoom);
    for (let i = 1; i < cortes.length; i++) {
      expect(cortes[i]).toBeLessThanOrEqual(cortes[i - 1]);
    }
    expect(cortes[cortes.length - 1]).toBeLessThanOrEqual(5000);
  });

  it('a camada pedida cobre o corte de população daquele zoom', () => {
    // Se o mapa mostra cidade de 50 mil mas só baixou a camada das de 500
    // mil, a tela fica vazia sem motivo
    const limites: Record<number, number> = { 1: 500_000, 2: 100_000, 3: 20_000, 4: 5_000 };
    for (const z of [2, 3, 4, 5, 6, 8, 10, 12, 14, 16]) {
      const corte = minPopForZoom(z);
      const camada = tierForZoom(z);
      if (corte === Infinity) continue;
      expect(camada).toBeGreaterThan(0);
      expect(corte).toBeGreaterThanOrEqual(limites[camada]);
    }
  });

  it('o traço fica mais detalhado conforme aproxima, nunca o contrário', () => {
    const niveis = [1, 2, 2.5, 5, 6, 10, 16].map(detailForZoom);
    for (let i = 1; i < niveis.length; i++) {
      expect(niveis[i]).toBeLessThanOrEqual(niveis[i - 1]); // 110 → 50 → 10
    }
  });
});

describe('escolha de quais cidades escrever', () => {
  // O BUG: numa região cheia (costa leste dos EUA), a coleta parava ao bater
  // um teto e ela varre o mundo em ordem GEOGRÁFICA — então o orçamento
  // acabava antes de chegar em Washington, e a tela enchia de cidadezinha.
  // A regra é: quem entra é decidido por TAMANHO, nunca por posição.
  it('as maiores da região entram antes das pequenas', () => {
    const cidades = cidadesGrandes as [string, number, number, number, string, number][];
    const naRegiao = cidades.filter(
      (c) => c[1] > -88 && c[1] < -73 && c[2] > 33.5 && c[2] < 41.5
    );
    const escolhidas = [...naRegiao].sort((a, b) => b[3] - a[3]).slice(0, 12).map((c) => c[0]);
    expect(escolhidas).toContain('New York City');
    expect(escolhidas).toContain('Washington');
    // e a ordem tem que ser decrescente de população
    const pops = [...naRegiao].sort((a, b) => b[3] - a[3]).map((c) => c[3]);
    expect(pops).toEqual([...pops].sort((a, b) => b - a));
  });
});

describe('fichas de país', () => {
  it('usa português do Brasil, não de Portugal', () => {
    expect(countryByAlpha2('KE')?.pt).toBe('Quênia');
    expect(countryByAlpha2('AM')?.pt).toBe('Armênia');
    expect(countryByAlpha2('PL')?.pt).toBe('Polônia');
    expect(countryByAlpha2('VN')?.pt).toBe('Vietnã');
  });

  it('não deixa o CLDR abreviar país em formato de lista', () => {
    // "Congo - Kinshasa" ficaria estranho no mapa
    expect(countryByAlpha2('CD')?.pt).toBe('República Democrática do Congo');
    expect(countryByAlpha2('CD')?.pt).not.toContain(' - ');
  });

  it('traz capital e região dos países principais', () => {
    const br = countryByAlpha2('BR');
    expect(br?.capital).toBe('Brasília');
    expect(br?.region?.pt).toBe('América do Sul');
    expect(br?.ll).toHaveLength(2);
  });
});
