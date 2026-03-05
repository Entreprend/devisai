import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-8">
          D
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">
          DevisAI
        </h1>
        <p className="text-xl text-gray-400 mb-10">
          Générez des devis professionnels en 30 secondes grâce à l'IA
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/register"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition text-lg">
            Commencer gratuitement →
          </Link>
          <Link href="/auth/login"
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-xl transition text-lg">
            Se connecter
          </Link>
        </div>
        <p className="text-gray-500 text-sm mt-8">
          3 devis gratuits · Aucune carte requise
        </p>
      </div>
    </main>
  )
}