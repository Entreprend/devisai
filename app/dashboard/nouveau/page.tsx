'use client'
import jsPDF from 'jspdf'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NouveauDevisPage() {
  const [form, setForm] = useState({
    client_nom: '',
    type_projet: '',
    description: '',
    budget: '',
    delai: '',
  })
  const [loading, setLoading] = useState(false)
  const [devis, setDevis] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Appel à Claude
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    const data = await res.json()
    setDevis(data)
    setLoading(false)
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('devis').insert({
      user_id: user!.id,
      titre: devis.titre,
      client_nom: form.client_nom,
      contenu: devis,
      montant_ht: devis.montant_ht,
      montant_ttc: devis.montant_ttc,
      statut: 'brouillon'
    })

    router.push('/dashboard')
  }
const handleExportPDF = () => {
  const doc = new jsPDF()

  // Titre
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(devis.titre, 20, 25)

  // Introduction
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const intro = doc.splitTextToSize(devis.introduction, 170)
  doc.text(intro, 20, 40)

  // Ligne séparatrice
  doc.setDrawColor(200, 200, 200)
  doc.line(20, 65, 190, 65)

  // En-têtes tableau
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Prestation', 20, 75)
  doc.text('Qté', 120, 75)
  doc.text('Prix unit.', 140, 75)
  doc.text('Total', 170, 75)

  // Lignes du tableau
  doc.setFont('helvetica', 'normal')
  let y = 85
  devis.lignes?.forEach((ligne: any) => {
    doc.text(doc.splitTextToSize(ligne.description, 95), 20, y)
    doc.text(String(ligne.quantite), 120, y)
    doc.text(`${ligne.prix_unitaire}€`, 140, y)
    doc.text(`${ligne.total}€`, 170, y)
    y += 12
  })

  // Totaux
  doc.line(20, y + 5, 190, y + 5)
  y += 15
  doc.text(`Montant HT : ${devis.montant_ht}€`, 130, y)
  y += 8
  doc.text(`TVA 20% : ${devis.montant_ttc - devis.montant_ht}€`, 130, y)
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text(`Total TTC : ${devis.montant_ttc}€`, 130, y)

  // Conditions
  y += 20
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Délai : ${devis.delai_livraison}`, 20, y)
  doc.text(`Validité : ${devis.validite}`, 80, y)
  doc.text(`Conditions : ${devis.conditions}`, 20, y + 8)

  // Téléchargement
  doc.save(`${devis.titre}.pdf`)
}
  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <h1 className="text-2xl font-bold text-white mb-8">✨ Nouveau devis</h1>

      {!devis ? (
        <form onSubmit={handleGenerate} className="max-w-xl flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Nom du client</label>
            <input
              name="client_nom"
              type="text"
              placeholder="Ex: Marie Dupont"
              value={form.client_nom}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Type de projet</label>
            <select
              name="type_projet"
              value={form.type_projet}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none"
            >
              <option value="">Choisir...</option>
              <option value="Site vitrine">Site vitrine</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Application web">Application web</option>
              <option value="Refonte de site">Refonte de site</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Description du projet</label>
            <textarea
              name="description"
              placeholder="Décrivez le projet en quelques phrases..."
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Budget indicatif</label>
            <input
              name="budget"
              type="text"
              placeholder="Ex: 2000€"
              value={form.budget}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Délai souhaité</label>
            <input
              name="delai"
              type="text"
              placeholder="Ex: 3 semaines"
              value={form.delai}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? '✨ Génération en cours...' : '✨ Générer le devis'}
          </button>
        </form>
      ) : (
        <div className="max-w-2xl">
          <div className="bg-gray-900 rounded-2xl p-8 mb-6">
            <h2 className="text-xl font-bold text-white mb-2">{devis.titre}</h2>
            <p className="text-gray-400 mb-6">{devis.introduction}</p>

            <table className="w-full mb-6">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 py-2">Prestation</th>
                  <th className="text-right text-gray-400 py-2">Qté</th>
                  <th className="text-right text-gray-400 py-2">Prix unit.</th>
                  <th className="text-right text-gray-400 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {devis.lignes?.map((ligne: any, i: number) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="text-white py-3">{ligne.description}</td>
                    <td className="text-gray-400 py-3 text-right">{ligne.quantite}</td>
                    <td className="text-gray-400 py-3 text-right">{ligne.prix_unitaire}€</td>
                    <td className="text-white py-3 text-right font-semibold">{ligne.total}€</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end flex-col items-end gap-1">
              <p className="text-gray-400">HT : <span className="text-white font-semibold">{devis.montant_ht}€</span></p>
              <p className="text-gray-400">TVA 20% : <span className="text-white">{devis.montant_ttc - devis.montant_ht}€</span></p>
              <p className="text-lg text-white font-bold">TTC : {devis.montant_ttc}€</p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Délai</p>
                <p className="text-white">{devis.delai_livraison}</p>
              </div>
              <div>
                <p className="text-gray-400">Validité</p>
                <p className="text-white">{devis.validite}</p>
              </div>
              <div>
                <p className="text-gray-400">Conditions</p>
                <p className="text-white">{devis.conditions}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
  <button
    onClick={handleSave}
    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition"
  >
    💾 Sauvegarder
  </button>
  <button
    onClick={handleExportPDF}
    className="bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-xl transition"
  >
    📄 Exporter PDF
  </button>
  <button
    onClick={() => setDevis(null)}
    className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition"
  >
    🔄 Recommencer
  </button>
</div>
        </div>
      )}
    </main>
  )
}