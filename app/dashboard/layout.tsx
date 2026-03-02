import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="flex min-h-screen bg-gray-950">

      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col p-4">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            D
          </div>
          <span className="text-white font-bold">DevisAI</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          <Link href="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition text-sm">
            🏠 Accueil
          </Link>
          <Link href="/dashboard/nouveau"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition text-sm">
            ✨ Nouveau devis
          </Link>
          <Link href="/dashboard/historique"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition text-sm">
            📋 Historique
          </Link>
        </nav>

        {/* User + déconnexion en bas */}
        <div className="mt-auto px-2 flex flex-col gap-2">
          <p className="text-gray-500 text-xs truncate">{user.email}</p>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-gray-400 hover:text-red-400 text-xs transition"
            >
              → Se déconnecter
            </button>
          </form>
        </div>

      </aside>

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

    </div>
  )
}