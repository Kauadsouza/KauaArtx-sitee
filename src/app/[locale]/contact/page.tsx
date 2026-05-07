'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Github, Instagram, Linkedin, Youtube, Mail, SendHorizonal, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const SOCIALS = [
  { href: 'mailto:kauadsouza@gmail.com', icon: Mail, label: 'Email', handle: 'kauadsouza@gmail.com' },
  { href: 'https://www.instagram.com/kauaartx/', icon: Instagram, label: 'Instagram', handle: '@kauaartx' },
  { href: 'https://www.linkedin.com/in/kauadsouza', icon: Linkedin, label: 'LinkedIn', handle: 'kauadsouza' },
  { href: 'https://github.com/Kauadsouza', icon: Github, label: 'GitHub', handle: 'Kauadsouza' },
  { href: 'https://www.youtube.com/@KauartX', icon: Youtube, label: 'YouTube', handle: '@KauartX' },
];

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  subject: z.string().min(3, 'Assunto muito curto'),
  message: z.string().min(20, 'Mensagem muito curta (mín. 20 caracteres)'),
});

type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const t = useTranslations('contact');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      reset();
    } catch {
      setStatus('error');
    }
  };

  const inputClass = (hasError?: boolean) =>
    cn(
      'w-full px-4 py-3 rounded-lg border bg-surface text-foreground text-sm placeholder:text-foreground-subtle outline-none transition-all',
      hasError
        ? 'border-red-500/50 focus:border-red-500'
        : 'border-border focus:border-accent-bright hover:border-border-strong'
    );

  return (
    <div className="min-h-screen pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-32">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="py-16 sm:py-24"
        >
          <p className="text-accent-bright font-mono text-sm mb-4">/ contato</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-foreground-muted max-w-2xl">{t('subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left: Social links */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">{t('social_title')}</h2>
            <div className="space-y-3">
              {SOCIALS.map(({ href, icon: Icon, label, handle }) => (
                <a
                  key={href}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="group flex items-center gap-4 p-4 rounded-lg border border-border bg-surface hover:border-border-strong hover:bg-surface-elevated transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center group-hover:border-accent group-hover:text-accent-bright transition-all">
                    <Icon size={16} className="text-foreground-subtle group-hover:text-accent-bright transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-foreground-subtle">{handle}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <CheckCircle2 size={48} className="text-accent-bright mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">{t('form_success_title')}</h3>
                <p className="text-foreground-muted">{t('form_success_desc')}</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-8 px-6 py-2.5 rounded-lg border border-border text-foreground-muted hover:text-foreground hover:border-border-strong transition-all text-sm"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs text-foreground-subtle mb-1.5 font-mono">{t('form_name')}</label>
                    <input
                      {...register('name')}
                      placeholder="Kauã Souza"
                      className={inputClass(!!errors.name)}
                    />
                    {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs text-foreground-subtle mb-1.5 font-mono">{t('form_email')}</label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="hello@example.com"
                      className={inputClass(!!errors.email)}
                    />
                    {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-foreground-subtle mb-1.5 font-mono">{t('form_subject')}</label>
                  <input
                    {...register('subject')}
                    placeholder="Proposta de projeto / Parceria / Dúvida..."
                    className={inputClass(!!errors.subject)}
                  />
                  {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="block text-xs text-foreground-subtle mb-1.5 font-mono">{t('form_message')}</label>
                  <textarea
                    {...register('message')}
                    rows={6}
                    placeholder="Olá Kauã, quero conversar sobre..."
                    className={cn(inputClass(!!errors.message), 'resize-none')}
                  />
                  {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message.message}</p>}
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={14} />
                    {t('form_error')}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="group w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-accent hover:bg-accent-bright disabled:opacity-60 disabled:cursor-not-allowed text-foreground font-medium text-sm transition-all"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                      {t('form_sending')}
                    </>
                  ) : (
                    <>
                      {t('form_send')}
                      <SendHorizonal size={14} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
