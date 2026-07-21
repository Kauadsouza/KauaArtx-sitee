'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Pencil, AlertCircle, ImagePlus, Link2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createClient } from '@/lib/supabase/client';
import SetupNotice from '@/components/admin/SetupNotice';
import RawHtmlContent from '@/components/blog/RawHtmlContent';
import type { Post } from '@/lib/supabase/types';

// Gera slug a partir do título: "Minha Viagem à Bahia!" → "minha-viagem-a-bahia"
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

// Checa se o link parece uma IMAGEM DIRETA (o arquivo em si) ou uma página.
// Um link de "compartilhar" do Pinterest/Instagram/Drive abre uma página, não
// a imagem — o navegador não consegue exibir isso como <img>. Retorna o texto
// do aviso, ou null quando o link parece ok.
function coverUrlWarning(url: string): string | null {
  const u = url.trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) return 'O link precisa começar com https://';

  let host = '';
  try {
    host = new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return 'Link inválido.';
  }

  // Hosts que entregam PÁGINA, não o arquivo da imagem
  const pageHosts: Record<string, string> = {
    'pin.it': 'Pinterest',
    'pinterest.com': 'Pinterest',
    'br.pinterest.com': 'Pinterest',
    'instagram.com': 'Instagram',
    'drive.google.com': 'Google Drive',
    'photos.app.goo.gl': 'Google Fotos',
    'imgur.com': 'Imgur (use o link que termina em .jpg)',
    'unsplash.com': 'Unsplash (abra a foto e use "Download")',
  };
  if (pageHosts[host]) {
    return `Esse é um link de página do ${pageHosts[host]}, não da imagem em si — por isso a capa não aparece. Abra a imagem, clique com o botão direito → "Copiar endereço da imagem", e cole o link que termina em .jpg, .png ou .webp.`;
  }

  // Sem extensão de imagem: pode funcionar (Supabase, CDNs), então é só um alerta leve
  if (!/\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(u)) {
    return 'Dica: o link ideal termina em .jpg, .png ou .webp. Se a capa não aparecer, é porque esse link não é a imagem direta.';
  }
  return null;
}

interface PostEditorProps {
  post?: Post;
}

export default function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [coverUrl, setCoverUrl] = useState(post?.cover_url ?? '');
  const [category, setCategory] = useState(post?.category ?? '');
  const [contentFormat, setContentFormat] = useState<'markdown' | 'html'>(
    post?.content_format ?? 'markdown'
  );
  const [published, setPublished] = useState(post?.published ?? false);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inserção de imagem e link direto no conteúdo
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [imgUrl, setImgUrl] = useState('');
  const [imgWidth, setImgWidth] = useState<'400' | '700' | 'full'>('full');
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  if (!supabase) return <SetupNotice />;

  // Escreve no ponto onde o cursor está, em vez de jogar tudo no fim
  const insertAtCursor = (snippet: string) => {
    const ta = contentRef.current;
    if (!ta) {
      setContent((c) => `${c}\n${snippet}`);
      return;
    }
    const start = ta.selectionStart ?? content.length;
    const end = ta.selectionEnd ?? content.length;
    setContent(content.slice(0, start) + snippet + content.slice(end));
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + snippet.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  // No modo HTML dá pra fixar a largura em pixels; no Markdown a imagem
  // ocupa a largura da coluna de leitura (que já é um tamanho previsível).
  const insertImage = () => {
    const url = imgUrl.trim();
    if (!url) return;
    const snippet =
      contentFormat === 'html'
        ? imgWidth === 'full'
          ? `\n<img src="${url}" alt="" style="width:100%;height:auto;border-radius:12px;" />\n`
          : `\n<img src="${url}" alt="" width="${imgWidth}" style="max-width:100%;height:auto;border-radius:12px;" />\n`
        : `\n![](${url})\n`;
    insertAtCursor(snippet);
    setImgUrl('');
  };

  const insertLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    const text = linkText.trim() || url;
    const snippet =
      contentFormat === 'html'
        ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
        : `[${text}](${url})`;
    insertAtCursor(snippet);
    setLinkText('');
    setLinkUrl('');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      setError('Título e slug são obrigatórios.');
      return;
    }
    setError(null);
    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: slugify(slug),
      excerpt: excerpt.trim() || null,
      content,
      cover_url: coverUrl.trim() || null,
      category: category.trim() || null,
      content_format: contentFormat,
      published,
    };

    const { error: dbError } = post
      ? await supabase.from('posts').update(payload).eq('id', post.id)
      : await supabase.from('posts').insert(payload);

    if (dbError) {
      setError(
        dbError.code === '23505'
          ? 'Já existe um post com esse slug. Troque o slug e tente de novo.'
          : `Erro ao salvar: ${dbError.message}`
      );
      setSaving(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-10 glass-strong">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} />
            Voltar
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreview(!preview)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-all"
            >
              {preview ? <Pencil size={14} /> : <Eye size={14} />}
              {preview ? 'Editar' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-pill-primary text-sm !py-2.5 !px-5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {preview ? (
          <article className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter text-foreground mb-4">
              {title || 'Sem título'}
            </h1>
            {excerpt && <p className="text-xl text-foreground-muted mb-8">{excerpt}</p>}
            {contentFormat === 'html' ? (
              <RawHtmlContent html={content} />
            ) : (
              <div className="prose-post">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            )}
          </article>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                Título
              </label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Título do post"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground text-lg font-bold outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  Slug (endereço do post: /blog/<span className="text-accent-deep">{slug || 'meu-post'}</span>)
                </label>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                  placeholder="meu-post"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground text-base font-mono outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                  Capa (link de imagem, opcional)
                </label>
                <input
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground text-base outline-none focus:border-accent transition-colors"
                />
                {coverUrlWarning(coverUrl) ? (
                  <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-300/90">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" />
                    <span>{coverUrlWarning(coverUrl)}</span>
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-foreground-subtle">
                    Tamanho exato: <strong className="text-foreground-muted">1600 × 900</strong> (16:9
                    deitada). O corte é centralizado, então deixe o assunto no meio. Link quebrado
                    vira um bloco de degradê, sem imagem quebrada no blog.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                Categoria (vira a tarja no blog, opcional)
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="categorias-sugeridas"
                placeholder="Aventura"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground text-base outline-none focus:border-accent transition-colors"
              />
              {/* Sugestões: dá pra escolher uma ou digitar a sua */}
              <datalist id="categorias-sugeridas">
                {['Aventura', 'Vendas', 'Negócios', 'Bastidores', 'Viagem', 'Reflexão'].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                Resumo (aparece na lista do blog, opcional)
              </label>
              <input
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Uma frase que resume o post..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground text-base outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-foreground-muted">
                  {contentFormat === 'html'
                    ? 'Conteúdo — HTML puro, com <style> e <script> se quiser'
                    : 'Conteúdo — escreva normalmente. Dicas: **negrito**, ## Título de seção, - lista'}
                </label>
                {/* Toggle Markdown / HTML avançado */}
                <div className="flex items-center gap-1 p-0.5 rounded-full bg-background border border-border shrink-0 ml-3">
                  {(['markdown', 'html'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setContentFormat(mode)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        contentFormat === mode
                          ? 'bg-accent text-[color:var(--ink-on-accent)]'
                          : 'text-foreground-muted hover:text-foreground'
                      }`}
                    >
                      {mode === 'markdown' ? 'Markdown' : 'HTML avançado'}
                    </button>
                  ))}
                </div>
              </div>
              {contentFormat === 'html' && (
                <p className="text-xs text-foreground-subtle mb-2">
                  O post inteiro é renderizado com o HTML/CSS/JS que você colar aqui. Só scripts
                  embutidos (inline) rodam — links externos de script são bloqueados pela política
                  de segurança do site.
                </p>
              )}
              {/* ── Inserir imagem e link no ponto do cursor ── */}
              <div className="mb-3 rounded-xl border border-border bg-surface p-4 space-y-4">
                {/* Imagem */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-foreground-muted">
                    <ImagePlus size={14} className="text-accent-deep" />
                    Inserir imagem no conteúdo
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={imgUrl}
                      onChange={(e) => setImgUrl(e.target.value)}
                      placeholder="Cole o link da imagem (https://...)"
                      className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent transition-colors"
                    />
                    {contentFormat === 'html' && (
                      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-background border border-border shrink-0">
                        {(
                          [
                            ['400', 'Pequena'],
                            ['700', 'Média'],
                            ['full', 'Inteira'],
                          ] as const
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setImgWidth(value)}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              imgWidth === value
                                ? 'bg-accent text-[color:var(--ink-on-accent)]'
                                : 'text-foreground-muted hover:text-foreground'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={insertImage}
                      disabled={!imgUrl.trim()}
                      className="btn-pill-primary text-xs !py-2 !px-4 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Inserir
                    </button>
                  </div>
                  {coverUrlWarning(imgUrl) && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-300/90">
                      <AlertCircle size={13} className="mt-0.5 shrink-0" />
                      <span>{coverUrlWarning(imgUrl)}</span>
                    </p>
                  )}
                  <p className="mt-2 text-xs text-foreground-subtle">
                    {contentFormat === 'html' ? (
                      <>
                        Pequena = 400px · Média = 700px · Inteira = toda a largura. Mande a
                        imagem com <strong className="text-foreground-muted">1600px de largura</strong>{' '}
                        pra ficar nítida em qualquer tela.
                      </>
                    ) : (
                      <>
                        No Markdown a imagem ocupa a largura da coluna (
                        <strong className="text-foreground-muted">768px</strong>). Pra escolher o
                        tamanho exato, troque pra HTML avançado. Envie com{' '}
                        <strong className="text-foreground-muted">1600px de largura</strong>.
                      </>
                    )}
                  </p>
                </div>

                {/* Link */}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-foreground-muted">
                    <Link2 size={14} className="text-accent-deep" />
                    Inserir link
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="Texto que aparece"
                      className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent transition-colors"
                    />
                    <input
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={insertLink}
                      disabled={!linkUrl.trim()}
                      className="btn-pill-primary text-xs !py-2 !px-4 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Inserir
                    </button>
                  </div>
                </div>
              </div>

              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                placeholder={
                  contentFormat === 'html'
                    ? '<section style="padding: 2rem; background: #111;">\n  <h2 style="color: #ff8a3d;">Título com estilo próprio</h2>\n  <p>Escreve seu HTML aqui...</p>\n  <script>\n    console.log("roda de verdade no navegador do visitante");\n  <\/script>\n</section>'
                    : 'Escreve aqui seu post...\n\n## Um título de seção\n\nUm parágrafo normal com **negrito** e *itálico*.\n\n- Um item de lista\n- Outro item'
                }
                className={`w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground text-base leading-relaxed outline-none focus:border-accent transition-colors resize-y ${
                  contentFormat === 'html' ? 'font-mono text-sm' : ''
                }`}
              />
            </div>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <div>
                <span className="text-sm font-semibold text-foreground">Publicar</span>
                <p className="text-xs text-foreground-muted">
                  Marcado: o post fica visível pra todo mundo. Desmarcado: fica salvo como rascunho.
                </p>
              </div>
            </label>
          </div>
        )}
      </main>
    </div>
  );
}
