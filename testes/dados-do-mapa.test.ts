// ============================================================
// TESTES DO GERADOR DE DADOS (npm run map:data)
//
// O gerador baixa de fora, então o teste não roda o download — ele cobre as
// partes que erraram: o casamento com o IBGE e a grafia dos nomes.
// ============================================================

import { describe, expect, it } from 'vitest';
import {
  chaveCidade,
  nomeEmPortuguesBR,
  semAcento,
  separaMunicipioEstado,
} from '../scripts/map-data-helpers.mjs';

describe('nome de município do IBGE', () => {
  // O BUG: o IBGE escreve "Uberlândia - MG" com HÍFEN e o código esperava
  // parêntese. Resultado: 2 casamentos em 4.308, e um deles colocou 13.936
  // habitantes em Araçatuba (que tem 200 mil).
  it('separa o município da sigla do estado', () => {
    expect(separaMunicipioEstado('Uberlândia - MG')).toEqual({ municipio: 'Uberlândia', uf: 'MG' });
    expect(separaMunicipioEstado('Alta Floresta D’Oeste - RO')).toEqual({
      municipio: 'Alta Floresta D’Oeste',
      uf: 'RO',
    });
  });

  it('aguenta nome com hífen no meio', () => {
    // "Mogi-Guaçu - SP": o corte tem que ser no ÚLTIMO hífen
    expect(separaMunicipioEstado('Mogi-Guaçu - SP')).toEqual({
      municipio: 'Mogi-Guaçu',
      uf: 'SP',
    });
  });

  it('devolve nada quando não tem estado no fim', () => {
    expect(separaMunicipioEstado('Uberlândia')).toBeNull();
    expect(separaMunicipioEstado('Brasil')).toBeNull();
  });

  it('não casa formato de parêntese por acidente', () => {
    expect(separaMunicipioEstado('Uberlândia (MG)')).toBeNull();
  });
});

describe('chave de casamento entre IBGE e GeoNames', () => {
  it('ignora acento e pontuação', () => {
    expect(semAcento('Uberlândia')).toBe('uberlandia');
    expect(semAcento("Sant'Ana do Livramento")).toBe('santanadolivramento');
    expect(semAcento('São Paulo')).toBe('saopaulo');
  });

  it('a mesma cidade escrita de dois jeitos dá a mesma chave', () => {
    expect(chaveCidade('Uberlândia', 'MG')).toBe(chaveCidade('UBERLANDIA', 'MG'));
  });

  // Essa é a proteção contra o bug do Araçatuba: cidade de nome igual em
  // estado diferente NÃO pode compartilhar população
  it('separa cidades de mesmo nome em estados diferentes', () => {
    expect(chaveCidade('Bom Jesus', 'PI')).not.toBe(chaveCidade('Bom Jesus', 'RS'));
  });
});

describe('grafia de país em português do Brasil', () => {
  const nomesBR = new Intl.DisplayNames(['pt-BR'], { type: 'region' });

  it('prefere a grafia brasileira à portuguesa', () => {
    expect(nomeEmPortuguesBR('KE', 'Quénia', nomesBR)).toBe('Quênia');
    expect(nomeEmPortuguesBR('PL', 'Polónia', nomesBR)).toBe('Polônia');
  });

  it('mantém o nome por extenso quando o CLDR usa hífen de lista', () => {
    expect(nomeEmPortuguesBR('CD', 'República Democrática do Congo', nomesBR)).toBe(
      'República Democrática do Congo'
    );
  });

  it('cai pro nome de origem quando o código não existe', () => {
    expect(nomeEmPortuguesBR('ZZZ', 'Terra do Nunca', nomesBR)).toBe('Terra do Nunca');
  });
});
