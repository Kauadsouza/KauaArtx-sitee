// ============================================================
// As partes do gerador de dados que dá pra testar sozinhas.
//
// Moram aqui (e não dentro de build-map-data.mjs) porque cada uma delas já
// errou na vida real e agora tem teste em testes/map-data.test.ts.
// ============================================================

/** Tira acento e pontuação: "Sant'Ana do Livramento" → "santanadolivramento" */
export const semAcento = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/**
 * Separa o nome do município da sigla do estado.
 *
 * O IBGE escreve "Uberlândia - MG", com HÍFEN. Uma versão anterior esperava
 * parêntese ("Uberlândia (MG)"), não casava com nada, e as duas coincidências
 * que sobraram colocaram 13.936 habitantes em Araçatuba (que tem 200 mil).
 * Daí o teste.
 */
export const separaMunicipioEstado = (nome) => {
  const m = String(nome).match(/^(.*?)\s*-\s*([A-Z]{2})$/);
  if (!m) return null;
  return { municipio: m[1], uf: m[2] };
};

/** A chave que liga um município do IBGE a uma cidade do GeoNames. */
export const chaveCidade = (nome, uf) => `${semAcento(nome)}|${uf}`;

/**
 * Nome de país em português do Brasil.
 *
 * A base traduz pra português de Portugal ("Quénia", "Arménia", "Polónia"),
 * então o nome vem do CLDR, que o próprio Node carrega. Exceção: quando o
 * CLDR usa aquele formato de lista com hífen ("Congo - Kinshasa"), que num
 * mapa fica estranho — aí fica o nome por extenso.
 */
export const nomeEmPortuguesBR = (cca2, dePortugal, nomesBR) => {
  let doBrasil;
  try {
    doBrasil = nomesBR.of(cca2);
  } catch {
    /* país sem nome no CLDR */
  }
  if (!doBrasil || doBrasil === cca2 || doBrasil.includes(' - ')) return dePortugal;
  return doBrasil;
};
