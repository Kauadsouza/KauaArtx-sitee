import { describe, expect, it } from 'vitest';
import { estimateReadingMinutes } from '../src/lib/blog-reading';

describe('tempo de leitura do blog', () => {
  it('ignora estilos, scripts e tags de posts HTML', () => {
    const words = Array.from({ length: 221 }, () => 'viagem').join(' ');
    const content = `<style>${'regra '.repeat(500)}</style><p>${words}</p><script>${'codigo '.repeat(500)}</script>`;

    expect(estimateReadingMinutes(content)).toBe(2);
  });

  it('sempre mostra pelo menos um minuto', () => {
    expect(estimateReadingMinutes('Uma nota curta.')).toBe(1);
  });
});
