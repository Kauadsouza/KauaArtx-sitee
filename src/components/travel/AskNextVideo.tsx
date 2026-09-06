'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, MessageCircleQuestion, SendHorizontal } from 'lucide-react';

const COPY = {
  pt: {
    kicker: 'PRÓXIMO VÍDEO',
    title: 'O que você quer saber?',
    description:
      'Manda uma pergunta real sobre Oxford, primeira viagem internacional ou o começo do canal. Ela pode virar parte do próximo vídeo.',
    name: 'Seu nome',
    email: 'Seu email',
    question: 'Sua pergunta',
    placeholder: 'O que você gostaria que eu mostrasse ou contasse no próximo vídeo?',
    privacy: 'A pergunta vai direto para o Kauã. Nada é publicado automaticamente.',
    submit: 'Enviar pergunta',
    sending: 'Enviando...',
    successTitle: 'Pergunta recebida',
    successText: 'Valeu. Agora ela já pode entrar no planejamento do próximo vídeo.',
    another: 'Enviar outra',
    error: 'Não consegui enviar agora. Tente novamente em alguns minutos.',
    subject: 'Pergunta para o próximo vídeo',
  },
  en: {
    kicker: 'NEXT VIDEO',
    title: 'What do you want to know?',
    description:
      'Send a real question about Oxford, a first international trip, or the start of the channel. It may become part of the next video.',
    name: 'Your name',
    email: 'Your email',
    question: 'Your question',
    placeholder: 'What would you like me to show or talk about in the next video?',
    privacy: 'The question goes directly to Kauã. Nothing is published automatically.',
    submit: 'Send question',
    sending: 'Sending...',
    successTitle: 'Question received',
    successText: 'Thank you. It can now become part of the next video plan.',
    another: 'Send another',
    error: 'I could not send it right now. Please try again in a few minutes.',
    subject: 'Question for the next video',
  },
} as const;

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

export default function AskNextVideo({ locale }: { locale: string }) {
  const copy = locale === 'en' ? COPY.en : COPY.pt;
  const [status, setStatus] = useState<SubmitStatus>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);

    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.get('name'),
          email: fields.get('email'),
          subject: copy.subject,
          message: fields.get('question'),
          website: fields.get('website'),
        }),
      });

      if (!response.ok) throw new Error('Question submission failed');
      form.reset();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  const fieldClass =
    'w-full rounded-xl border border-border bg-background/55 px-4 py-3.5 text-base text-foreground outline-none transition-colors placeholder:text-foreground-subtle hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/15';

  return (
    <section id="pergunte" className="scroll-mt-28 py-16 sm:py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border-strong bg-surface p-7 sm:p-10 lg:p-12">
        <span aria-hidden className="absolute inset-x-0 top-0 h-px hairline-gradient" />
        <div aria-hidden className="orb -right-24 -top-24 h-72 w-72 bg-accent/10" />

        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
          <div className="max-w-md">
            <div className="mb-5 flex items-center gap-2 text-accent">
              <MessageCircleQuestion size={19} aria-hidden />
              <span className="font-mono text-xs font-semibold tracking-[0.2em]">{copy.kicker}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-5 leading-relaxed text-foreground-muted">{copy.description}</p>
          </div>

          {status === 'success' ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-border bg-background/35 p-8 text-center" aria-live="polite">
              <CheckCircle2 size={42} className="text-accent-bright" aria-hidden />
              <h3 className="mt-5 text-2xl font-bold text-foreground">{copy.successTitle}</h3>
              <p className="mt-2 max-w-md text-foreground-muted">{copy.successText}</p>
              <button type="button" onClick={() => setStatus('idle')} className="btn-pill-secondary mt-7 text-sm">
                {copy.another}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-background/35 p-5 sm:p-7">
              <input name="website" type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-foreground-muted">
                  {copy.name}
                  <input name="name" required minLength={2} maxLength={100} className={`${fieldClass} mt-2`} />
                </label>
                <label className="text-sm font-medium text-foreground-muted">
                  {copy.email}
                  <input name="email" type="email" required maxLength={200} className={`${fieldClass} mt-2`} />
                </label>
              </div>
              <label className="mt-4 block text-sm font-medium text-foreground-muted">
                {copy.question}
                <textarea
                  name="question"
                  required
                  minLength={20}
                  maxLength={5000}
                  rows={5}
                  placeholder={copy.placeholder}
                  className={`${fieldClass} mt-2 resize-y`}
                />
              </label>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-sm text-xs leading-relaxed text-foreground-subtle">{copy.privacy}</p>
                <button type="submit" disabled={status === 'sending'} className="btn-pill-primary shrink-0 text-sm disabled:cursor-wait disabled:opacity-60">
                  {status === 'sending' ? copy.sending : copy.submit}
                  <SendHorizontal size={14} aria-hidden />
                </button>
              </div>

              {status === 'error' && (
                <p className="mt-4 text-sm text-red-300" role="alert">{copy.error}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
