'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Compte créé ! Vérifiez votre email pour confirmer.')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Créer un compte</h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Votre nom"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            className="bg-gray-800 text-white px-4 py-3 rounded-xl outline-none"
          />
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-gray-800 text-white px-4 py-3 rounded-xl outline-none"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-gray-800 text-white px-4 py-3 rounded-xl outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? 'Création...' : "Créer mon compte"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center text-blue-400">{message}</p>
        )}

        <p className="mt-6 text-center text-gray-400 text-sm">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-blue-400 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  )
}