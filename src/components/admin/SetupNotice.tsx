import { Settings } from 'lucide-react';

// Mostrado em qualquer tela admin enquanto o Supabase não estiver configurado
export default function SetupNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-surface border border-border shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-accent-2/10 text-accent-2-deep flex items-center justify-center mx-auto mb-4">
          <Settings size={22} />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-3">
          Supabase ainda não configurado
        </h1>
        <p className="text-sm text-foreground-muted leading-relaxed">
          Pra ativar o blog e o painel admin, siga o passo a passo do arquivo{' '}
          <code className="text-accent-deep font-semibold">SETUP-SUPABASE.md</code> na
          raiz do projeto e adicione as variáveis de ambiente na Vercel.
        </p>
      </div>
    </div>
  );
}
