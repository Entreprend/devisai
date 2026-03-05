import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: devis } = await supabase
    .from('devis')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const { count } = await supabase
    .from('devis')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  return (
    <main className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Bonjour 👋</h1>
        <p className="text-gray-400 mt-1">Prêt à générer votre prochain devis ?</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Total devis</p>
          <p className="text-3xl font-bold text-white">{count ?? 0}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Ce mois</p>
          <p className="text-3xl font-bold text-white">
            {devis?.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length ?? 0}
          </p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">Plan actuel</p>
          <p className="text-3xl font-bold text-blue-400">Free</p>
        </div>
      </div>

      {/* CTA */}
      <Link href="/dashboard/nouveau"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition mb-8">
        ✨ Nouveau devis
      </Link>

      {/* Derniers devis */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Derniers devis</h2>
          <Link href="/dashboard/historique" className="text-blue-400 text-sm hover:underline">
            Voir tout →
          </Link>
        </div>

        {devis && devis.length > 0 ? (
          <div className="flex flex-col gap-3">
            {devis.map((d: any) => (
              <div key={d.id}
                   className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{d.titre}</p>
                  <p className="text-gray-400 text-sm">{d.client_nom} · {new Date(d.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{d.montant_ttc}€</p>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                    {d.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-gray-400 mb-4">Aucun devis encore</p>
            <Link href="/dashboard/nouveau"
                  className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-blue-500 transition">
              ✨ Créer mon premier devis
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}