'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PenLine, Plus, LogOut, ExternalLink, Eye, EyeOff, Trash2, Pencil,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SetupNotice from '@/components/admin/SetupNotice';
import type { Post } from '@/lib/supabase/types';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  if (!supabase) return <SetupNotice />;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const togglePublished = async (post: Post) => {
    await supabase
      .from('posts')
      .update({ published: !post.published })
      .eq('id', post.id);
    loadPosts();
  };

  const deletePost = async (post: Post) => {
    if (!confirm(`Excluir o post "${post.title}"? Essa ação não tem volta.`)) return;
    await supabase.from('posts').delete().eq('id', post.id);
    loadPosts();
  };

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-10 glass-strong">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent-deep flex items-center justify-center">
              <PenLine size={15} />
            </div>
            <span className="font-bold text-foreground">Painel do Blog</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-all"
            >
              <ExternalLink size={14} />
              Ver site
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-foreground-muted hover:text-red-600 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
              Seus posts
            </h1>
            <p className="text-sm text-foreground-muted">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'} ·{' '}
              {posts.filter((p) => p.published).length} publicado(s)
            </p>
          </div>
          <Link href="/admin/posts/new" className="btn-pill-primary text-sm">
            <Plus size={15} />
            Novo post
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-foreground-subtle">Carregando...</div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 rounded-2xl bg-surface border border-dashed border-border-strong text-center">
            <PenLine size={28} className="text-accent-deep" />
            <p className="text-foreground-muted">
              Nenhum post ainda. Clica em <strong>Novo post</strong> pra escrever o primeiro!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-4 p-5 rounded-2xl bg-surface border border-border shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${
                        post.published
                          ? 'text-accent-deep bg-accent/10 border-accent/25'
                          : 'text-foreground-subtle bg-surface-elevated border-border-strong'
                      }`}
                    >
                      {post.published ? 'Publicado' : 'Rascunho'}
                    </span>
                    <span className="text-xs text-foreground-subtle">
                      {new Date(post.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h2 className="font-bold text-foreground truncate">{post.title}</h2>
                  {post.excerpt && (
                    <p className="text-sm text-foreground-muted truncate">{post.excerpt}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePublished(post)}
                    title={post.published ? 'Despublicar' : 'Publicar'}
                    className="p-2.5 rounded-full text-foreground-muted hover:text-accent-deep hover:bg-accent/10 transition-all"
                  >
                    {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <Link
                    href={`/admin/posts/${post.id}`}
                    title="Editar"
                    className="p-2.5 rounded-full text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-all"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => deletePost(post)}
                    title="Excluir"
                    className="p-2.5 rounded-full text-foreground-muted hover:text-red-600 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
