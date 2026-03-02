import { createClient } from '@/lib/supabase/server'

export default async function HistoriquePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: devis } = await supabase
    .from('devis')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <h1 className="text-2xl font-bold text-white mb-8">📋 Mes devis</h1>

      {devis && devis.length > 0 ? (
        <div className="flex flex-col gap-4 max-w-3xl">
          {devis.map((d: any) => (
            <div key={d.id} className="bg-gray-900 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">{d.titre}</h2>
                <p className="text-gray-400 text-sm mt-1">Client : {d.client_nom}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(d.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg">{d.montant_ttc}€</p>
                <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full mt-2 inline-block">
                  {d.statut}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📄</p>
          <p className="text-gray-400">Aucun devis pour le moment</p>
          <a href="/dashboard/nouveau"
             className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-500 transition">
            ✨ Créer mon premier devis
          </a>
        </div>
      )}
    </main>
  )
}