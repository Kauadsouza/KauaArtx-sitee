// Fonte única da lista de admins do site.
//
// Usada pelo middleware (porta do painel /admin) e pela rota
// /api/notify-post. A lista de emails também vive nas policies do banco
// (supabase/fix-admin-rls.sql) — se mudar aqui, mude lá também.
//
// Pode sobrescrever sem mexer no código com a env ADMIN_EMAILS
// ("a@x.com,b@y.com") na Vercel.
export const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ?? 'kauaartx@gmail.com,kauadsouza@gmail.com'
)
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
