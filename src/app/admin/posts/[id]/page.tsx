'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PostEditor from '@/components/admin/PostEditor';
import { createClient } from '@/lib/supabase/client';
import type { Post } from '@/lib/supabase/types';

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (!data) {
          router.replace('/admin');
          return;
        }
        setPost(data);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground-subtle">
        Carregando...
      </div>
    );
  }

  return <PostEditor post={post} />;
}
