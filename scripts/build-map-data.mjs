// ============================================================
// GERA OS DADOS DO MAPA — rode com: npm run map:data
//
// Baixa as bases atualizadas, enxuga e escreve em src/data/map/. É esse
// resultado enxuto (e versionado no git) que o site carrega — nada aqui
// roda quando alguém abre a página.
//
// DE ONDE VEM CADA NÚMERO
//
//   Cidades do mundo → dump diário do GeoNames (cities5000: todo lugar
//   habitado com 5 mil pessoas ou mais). Licença CC BY 4.0.
//
//   População do Brasil → API do IBGE, Censo 2022. O GeoNames ainda carrega
//   número de censo antigo pra boa parte do mundo (Uberlândia aparecia com
//   563 mil, de 2010, contra 713 mil de 2022), então pro nosso país a gente
//   passa por cima com a fonte oficial e atual.
//
//   Países (nome em português, capital, região, área) → world-countries.
//
// Sem internet? O script avisa e cai pro pacote all-the-cities, que é o
// mesmo GeoNames só que congelado — melhor um mapa velho que nenhum.
//
// As cidades saem em CAMADAS por população. O site carrega a primeira e vai
// buscando as outras conforme o zoom pede.
// ============================================================

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import countries from 'world-countries';
import { topology } from 'topojson-server';
import { mesh } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';

const MIN_AREA = 0.0015;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'map');
mkdirSync(OUT, { recursive: true });

// Camadas: [arquivo, população mínima, população máxima]
const TIERS = [
  ['cities-1', 500_000, Infinity],
  ['cities-2', 100_000, 500_000],
  ['cities-3', 20_000, 100_000],
  ['cities-4', 5_000, 20_000],
];

// Só lugar habitado de verdade. PPLX é "bairro/parte de cidade"; PPLH, PPLQ
// e PPLW são lugares que já existiram — ficam de fora.
const KEEP = /^PPL(C|A[0-9]?|L|G|S|F)?$/;

// ── GeoNames: o dump de hoje ────────────────────────────────────────
// O arquivo vem zipado com uma entrada só, então dá pra abrir aqui mesmo
// sem depender de biblioteca de zip.
function unzipSingleEntry(buf) {
  if (buf.readUInt32LE(0) !== 0x04034b50) throw new Error('arquivo não é um zip');
  const method = buf.readUInt16LE(8);
  const nameLen = buf.readUInt16LE(26);
  const extraLen = buf.readUInt16LE(28);
  const start = 30 + nameLen + extraLen;
  let compSize = buf.readUInt32LE(18);
  if (!compSize) {
    // tamanho só no fim do arquivo: acha onde começa o índice central
    const cd = buf.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
    if (cd < 0) throw new Error('zip sem índice central');
    compSize = cd - start;
  }
  const raw = buf.subarray(start, start + compSize);
  return method === 0 ? raw : inflateRawSync(raw);
}

async function baixarGeoNames() {
  const url = 'https://download.geonames.org/export/dump/cities5000.zip';
  console.log('baixando', url, '…');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GeoNames respondeu ${res.status}`);
  const texto = unzipSingleEntry(Buffer.from(await res.arrayBuffer())).toString('utf8');

  // Colunas do dump (TSV): 1 nome, 4 lat, 5 lon, 7 classe, 8 código,
  // 9 país, 11 admin1, 15 população
  const linhas = texto.split('\n');
  const cidades = [];
  for (const linha of linhas) {
    if (!linha) continue;
    const c = linha.split('\t');
    if (c[6] !== 'P' || !KEEP.test(c[7])) continue;
    const pop = Number(c[14]);
    if (!pop) continue;
    cidades.push({
      name: c[1],
      lat: Number(c[4]),
      lon: Number(c[5]),
      population: pop,
      country: c[8],
      admin1: c[10],
      capital: c[7] === 'PPLC' ? 1 : 0,
    });
  }
  return cidades;
}

async function baixarAllTheCities() {
  const { default: cidades } = await import('all-the-cities');
  return cidades
    .filter((c) => c.population > 0 && KEEP.test(c.featureCode))
    .map((c) => ({
      name: c.name,
      lat: c.loc.coordinates[1],
      lon: c.loc.coordinates[0],
      population: c.population,
      country: c.country,
      admin1: c.adminCode,
      capital: c.featureCode === 'PPLC' ? 1 : 0,
    }));
}

// ── IBGE: população do Censo 2022, município por município ──────────
const semAcento = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/**
 * Liga o código de estado do GeoNames (BR.31, BR.27…) à sigla do IBGE.
 *
 * Os dois falam de Minas Gerais com códigos diferentes, então a ponte é
 * feita pelo NOME do estado — são 27, e nenhum deles se confunde.
 */
async function pontesDeEstado() {
  const [admin1, estados] = await Promise.all([
    fetch('https://download.geonames.org/export/dump/admin1CodesASCII.txt').then((r) => r.text()),
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then((r) => r.json()),
  ]);

  const porNome = new Map(estados.map((e) => [semAcento(e.nome), e.sigla]));
  const ponte = new Map(); // "31" (código do GeoNames) → "MG"
  for (const linha of admin1.split('\n')) {
    const [codigo, nome] = linha.split('\t');
    if (!codigo?.startsWith('BR.')) continue;
    const sigla = porNome.get(semAcento(nome ?? ''));
    if (sigla) ponte.set(codigo.slice(3), sigla);
  }
  if (ponte.size < 20) throw new Error(`só ${ponte.size} estados ligados`);
  return ponte;
}

async function baixarIBGE() {
  const url =
    'https://servicodados.ibge.gov.br/api/v3/agregados/4709/periodos/2022/variaveis/93?localidades=N6[all]';
  console.log('baixando população do IBGE (Censo 2022) …');
  const [res, ponte] = await Promise.all([fetch(url), pontesDeEstado()]);
  if (!res.ok) throw new Error(`IBGE respondeu ${res.status}`);
  const json = await res.json();
  const series = json?.[0]?.resultados?.[0]?.series ?? [];
  if (!series.length) throw new Error('IBGE não devolveu municípios');

  // O nome vem como "Uberlândia - MG": a sigla no fim é o estado, e é ela
  // que evita dar a população de uma Bom Jesus pra outra Bom Jesus.
  const pop = new Map();
  for (const s of series) {
    const bruto = String(s.localidade.nome);
    const m = bruto.match(/^(.*?)\s*-\s*([A-Z]{2})$/);
    if (!m) continue;
    const valor = Number(Object.values(s.serie)[0]);
    if (valor > 0) pop.set(`${semAcento(m[1])}|${m[2]}`, valor);
  }
  return { pop, ponte };
}

// ── Monta tudo ──────────────────────────────────────────────────────
let cidades;
try {
  cidades = await baixarGeoNames();
  console.log(`GeoNames: ${cidades.length} lugares habitados`);
} catch (erro) {
  console.warn(`⚠ não deu pra baixar do GeoNames (${erro.message}) — usando o pacote congelado`);
  cidades = await baixarAllTheCities();
}

try {
  const { pop, ponte } = await baixarIBGE();
  const brasileiras = cidades.filter((c) => c.country === 'BR');
  let trocadas = 0;
  let semPar = 0;
  for (const c of brasileiras) {
    const uf = ponte.get(c.admin1);
    const novo = uf ? pop.get(`${semAcento(c.name)}|${uf}`) : undefined;
    if (!novo) {
      semPar++;
      continue;
    }
    if (novo !== c.population) trocadas++;
    c.population = novo;
  }
  console.log(
    `IBGE 2022: ${trocadas} de ${brasileiras.length} cidades brasileiras atualizadas ` +
      `(${semPar} sem par — ficam com o número do GeoNames)`
  );
} catch (erro) {
  console.warn(`⚠ IBGE fora do ar (${erro.message}) — população do Brasil fica a do GeoNames`);
}

// Da maior pra menor, tirando repetição (a mesma cidade às vezes aparece
// duas vezes com grafias diferentes)
cidades.sort((a, b) => b.population - a.population);
const vistas = new Set();
const usaveis = cidades.filter((c) => {
  const chave = `${semAcento(c.name)}|${c.country}|${c.lon.toFixed(1)}|${c.lat.toFixed(1)}`;
  if (vistas.has(chave)) return false;
  vistas.add(chave);
  return true;
});

const r3 = (n) => Math.round(n * 1000) / 1000;
let total = 0;

for (const [arquivo, min, max] of TIERS) {
  // [nome, longitude, latitude, população, país, é capital?]
  const linhas = usaveis
    .filter((c) => c.population >= min && c.population < max)
    .map((c) => [c.name, r3(c.lon), r3(c.lat), c.population, c.country, c.capital]);
  const texto = JSON.stringify(linhas);
  writeFileSync(join(OUT, `${arquivo}.json`), texto);
  total += linhas.length;
  console.log(
    `${arquivo}.json ${String(linhas.length).padStart(6)} cidades ${String(
      Math.round(texto.length / 1024)
    ).padStart(5)} KB`
  );
}

// ── Países ──────────────────────────────────────────────────────────
// A base só traz a região em inglês, e o site é bilíngue — são 25 no total,
// então ficam traduzidas aqui na mão mesmo.
const REGIOES_PT = {
  Antarctic: 'Antártica',
  'Australia and New Zealand': 'Austrália e Nova Zelândia',
  Caribbean: 'Caribe',
  'Central America': 'América Central',
  'Central Asia': 'Ásia Central',
  'Central Europe': 'Europa Central',
  'Eastern Africa': 'África Oriental',
  'Eastern Asia': 'Ásia Oriental',
  'Eastern Europe': 'Europa Oriental',
  Melanesia: 'Melanésia',
  Micronesia: 'Micronésia',
  'Middle Africa': 'África Central',
  'North America': 'América do Norte',
  'Northern Africa': 'Norte da África',
  'Northern Europe': 'Europa do Norte',
  Polynesia: 'Polinésia',
  'South America': 'América do Sul',
  'South-Eastern Asia': 'Sudeste Asiático',
  'Southeast Europe': 'Sudeste Europeu',
  'Southern Africa': 'África Austral',
  'Southern Asia': 'Sul da Ásia',
  'Southern Europe': 'Europa do Sul',
  'Western Africa': 'África Ocidental',
  'Western Asia': 'Ásia Ocidental',
  'Western Europe': 'Europa Ocidental',
};

// O mapa-múndi (world-atlas) identifica cada país por um número (o código
// ISO 3166-1 numérico) — a chave aqui é esse mesmo número.
// O world-countries traduz pra português de PORTUGAL — "Quénia", "Arménia",
// "Polónia". O site é brasileiro, então o nome vem do CLDR em pt-BR, que o
// próprio Node carrega. Exceção: quando o CLDR usa aquele formato de lista
// com hífen ("Congo - Kinshasa"), que num mapa fica estranho — aí fica o
// nome por extenso mesmo.
const nomesBR = new Intl.DisplayNames(['pt-BR'], { type: 'region' });
const emPortuguesBR = (c) => {
  const dePortugal = c.translations.por?.common ?? c.name.common;
  let doBrasil;
  try {
    doBrasil = nomesBR.of(c.cca2);
  } catch {
    /* país sem nome no CLDR */
  }
  if (!doBrasil || doBrasil === c.cca2 || doBrasil.includes(' - ')) return dePortugal;
  return doBrasil;
};

const info = {};
const semTraducao = new Set();
for (const c of countries) {
  const regiao = c.subregion || c.region || null;
  if (regiao && !REGIOES_PT[regiao]) semTraducao.add(regiao);
  info[c.ccn3] = {
    pt: emPortuguesBR(c),
    en: c.name.common,
    cca2: c.cca2,
    capital: c.capital?.[0] ?? null,
    region: regiao ? { pt: REGIOES_PT[regiao] ?? regiao, en: regiao } : null,
    area: c.area ?? null,
    // [longitude, latitude] — onde escrever o nome do país. Vem daqui (e não
    // do desenho) pra que até Mônaco e Singapura ganhem nome: o contorno de
    // baixa resolução simplesmente não tem os países minúsculos.
    ll: c.latlng ? [c.latlng[1], c.latlng[0]] : null,
  };
}
if (semTraducao.size) console.warn('⚠ região sem tradução:', [...semTraducao].join(', '));

// ── Divisões internas (estados, províncias, departamentos) ──────────
// O que o mapa precisa é só a LINHA que separa um estado do outro, não o
// polígono de cada um. A "malha" do topojson faz exatamente isso: junta
// tudo num punhado de linhas e joga fora as bordas repetidas — sai umas
// dez vezes menor que o arquivo original.
try {
  // O 50m só traz divisão de 9 países; o 10m cobre o mundo inteiro.
  const url =
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson';
  console.log('baixando divisões estaduais (Natural Earth 10m) …');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Natural Earth respondeu ${res.status}`);
  const fc = await res.json();

  // Agrupa por país: assim o mapa desenha só as divisas de quem está na
  // tela, em vez de percorrer o mundo inteiro a cada quadro.
  const porPais = new Map();
  for (const f of fc.features) {
    if (!f.geometry) continue;
    const pais = f.properties.adm0_a3 || f.properties.iso_a2 || '???';
    if (!porPais.has(pais)) porPais.set(pais, []);
    porPais.get(pais).push({ type: 'Feature', properties: {}, geometry: f.geometry });
  }

  const saida = {};
  for (const [pais, features] of porPais) {
    if (features.length < 2) continue; // país de um estado só não tem divisa interna
    // O 10m é feito pra mapa de parede: guarda cada curvinha de rio que faz
    // divisa. Aqui a linha aparece com 1 pixel de espessura, então joga fora
    // os detalhes menores que MIN_AREA (em graus²) e depois arredonda numa
    // grade. Sem isso o arquivo passa de 14 MB.
    const cru = topology({ estados: { type: 'FeatureCollection', features } });
    const topo = simplify(presimplify(cru), MIN_AREA);
    const linhas = mesh(topo, topo.objects.estados, (a, b) => a !== b);
    if (!linhas.coordinates?.length) continue;
    // Caixa do país, pra poder pular quem está fora da tela
    let oeste = 180;
    let leste = -180;
    let sul = 90;
    let norte = -90;
    for (const linha of linhas.coordinates) {
      for (let i = 0; i < linha.length; i++) {
        // ~10 m de precisão: o resto é peso morto num traço de 1 pixel
        linha[i] = [Math.round(linha[i][0] * 1e4) / 1e4, Math.round(linha[i][1] * 1e4) / 1e4];
      }
      for (const [lon, lat] of linha) {
        if (lon < oeste) oeste = lon;
        if (lon > leste) leste = lon;
        if (lat < sul) sul = lat;
        if (lat > norte) norte = lat;
      }
    }
    saida[pais] = { box: [oeste, sul, leste, norte].map((n) => Math.round(n * 100) / 100), linhas };
  }

  const texto = JSON.stringify(saida);
  writeFileSync(join(OUT, 'admin1.json'), texto);
  console.log(
    `admin1.json  ${fc.features.length} divisões de ${Object.keys(saida).length} países → ${Math.round(
      texto.length / 1024
    )} KB`
  );
} catch (erro) {
  console.warn(`⚠ divisões estaduais falharam (${erro.message}) — o mapa segue sem elas`);
}

const textoPaises = JSON.stringify(info);
writeFileSync(join(OUT, 'countries.json'), textoPaises);
console.log(
  `countries.json ${String(Object.keys(info).length).padStart(4)} países ${Math.round(
    textoPaises.length / 1024
  )} KB`
);
console.log(`\ntotal: ${total} cidades`);
