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
    <div className="flex flex-col min-h-screen bg-gray-950">

      {/* Header mobile + desktop */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            D
          </div>
          <span className="text-white font-bold">DevisAI</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 truncate max-w-[140px]">
          {user.email}
        </div>
      </header>

      {/* Nav horizontale */}
      <nav className="bg-gray-900 border-b border-gray-800 px-4 flex gap-1 overflow-x-auto">
        <Link href="/dashboard"
              className="flex items-center gap-2 px-3 py-3 text-gray-400 hover:text-white whitespace-nowrap text-sm transition">
          🏠 Accueil
        </Link>
        <Link href="/dashboard/nouveau"
              className="flex items-center gap-2 px-3 py-3 text-gray-400 hover:text-white whitespace-nowrap text-sm transition">
          ✨ Nouveau devis
        </Link>
        <Link href="/dashboard/historique"
              className="flex items-center gap-2 px-3 py-3 text-gray-400 hover:text-white whitespace-nowrap text-sm transition">
          📋 Historique
        </Link>
        <form action="/auth/signout" method="POST" className="ml-auto">
          <button
            type="submit"
            className="flex items-center gap-2 px-3 py-3 text-gray-400 hover:text-red-400 whitespace-nowrap text-sm transition">
            → Déconnexion
          </button>
        </form>
      </nav>

      {/* Contenu */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

    </div>
  )
}