'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Pencil, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createClient } from '@/lib/supabase/client';
import SetupNotice from '@/components/admin/SetupNotice';
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
  const [published, setPublished] = useState(post?.published ?? false);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!supabase) return <SetupNotice />;

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
            <div className="prose-post">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
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
              <label className="block text-xs font-semibold text-foreground-muted mb-1.5">
                Conteúdo — escreva normalmente. Dicas: **negrito**, ## Título de seção, - lista
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                placeholder={'Escreve aqui seu post...\n\n## Um título de seção\n\nUm parágrafo normal com **negrito** e *itálico*.\n\n- Um item de lista\n- Outro item'}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground text-base leading-relaxed outline-none focus:border-accent transition-colors resize-y"
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
