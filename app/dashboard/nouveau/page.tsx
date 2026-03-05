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
  const [pdfLoading, setPdfLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [devis, setDevis] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setDevis(null)

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
    setSaveLoading(true)
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

    setSaveLoading(false)
    setSaved(true)
    setTimeout(() => router.push('/dashboard'), 1000)
  }

  const handleExportPDF = async () => {
    setPdfLoading(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(devis.titre, 20, 25)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const intro = doc.splitTextToSize(devis.introduction, 170)
    doc.text(intro, 20, 40)

    doc.setDrawColor(200, 200, 200)
    doc.line(20, 65, 190, 65)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Prestation', 20, 75)
    doc.text('Qté', 120, 75)
    doc.text('Prix unit.', 140, 75)
    doc.text('Total', 170, 75)

    doc.setFont('helvetica', 'normal')
    let y = 85
    devis.lignes?.forEach((ligne: any) => {
      doc.text(doc.splitTextToSize(ligne.description, 95), 20, y)
      doc.text(String(ligne.quantite), 120, y)
      doc.text(`${ligne.prix_unitaire}€`, 140, y)
      doc.text(`${ligne.total}€`, 170, y)
      y += 12
    })

    doc.line(20, y + 5, 190, y + 5)
    y += 15
    doc.text(`Montant HT : ${devis.montant_ht}€`, 130, y)
    y += 8
    doc.text(`TVA 20% : ${devis.montant_ttc - devis.montant_ht}€`, 130, y)
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.text(`Total TTC : ${devis.montant_ttc}€`, 130, y)

    y += 20
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Délai : ${devis.delai_livraison}`, 20, y)
    doc.text(`Validité : ${devis.validite}`, 80, y)
    doc.text(`Conditions : ${devis.conditions}`, 20, y + 8)

    doc.save(`${devis.titre}.pdf`)
    setPdfLoading(false)
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">✨ Nouveau devis</h1>
        <p className="text-gray-400 mt-1 text-sm">Remplissez le formulaire, l'IA génère votre devis en secondes</p>
      </div>

      {!devis ? (
        <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-800">
          <form onSubmit={handleGenerate} className="flex flex-col gap-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">
                  Nom du client
                </label>
                <input
                  name="client_nom"
                  type="text"
                  placeholder="Ex: Marie Dupont"
                  value={form.client_nom}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none border border-gray-700 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">
                  Type de projet
                </label>
                <select
                  name="type_projet"
                  value={form.type_projet}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none border border-gray-700 focus:border-blue-500 transition"
                >
                  <option value="">Choisir...</option>
                  <option value="Site vitrine">Site vitrine</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Application web">Application web</option>
                  <option value="Refonte de site">Refonte de site</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">
                Description du projet
              </label>
              <textarea
                name="description"
                placeholder="Décrivez le projet en quelques phrases..."
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none border border-gray-700 focus:border-blue-500 transition resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">
                  Budget indicatif
                </label>
                <input
                  name="budget"
                  type="text"
                  placeholder="Ex: 2000€"
                  value={form.budget}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none border border-gray-700 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">
                  Délai souhaité
                </label>
                <input
                  name="delai"
                  type="text"
                  placeholder="Ex: 3 semaines"
                  value={form.delai}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none border border-gray-700 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed
                         text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  L'IA génère votre devis...
                </>
              ) : '✨ Générer le devis'}
            </button>

          </form>
        </div>

      ) : (
        <div>
          {/* Badge succès */}
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20
                          text-green-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            <span>✅</span> Devis généré avec succès !
          </div>

          {/* Aperçu devis */}
          <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-800 mb-6">
            <h2 className="text-xl font-bold text-white mb-2">{devis.titre}</h2>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">{devis.introduction}</p>

            <div className="overflow-x-auto">
              <table className="w-full mb-6 min-w-[400px]">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 py-2 text-sm">Prestation</th>
                    <th className="text-right text-gray-400 py-2 text-sm">Qté</th>
                    <th className="text-right text-gray-400 py-2 text-sm">Prix unit.</th>
                    <th className="text-right text-gray-400 py-2 text-sm font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {devis.lignes?.map((ligne: any, i: number) => (
                    <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                      <td className="text-white py-3 text-sm">{ligne.description}</td>
                      <td className="text-gray-400 py-3 text-right text-sm">{ligne.quantite}</td>
                      <td className="text-gray-400 py-3 text-right text-sm">{ligne.prix_unitaire}€</td>
                      <td className="text-white py-3 text-right font-semibold text-sm">{ligne.total}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end flex-col items-end gap-1 mb-6">
              <p className="text-gray-400 text-sm">HT : <span className="text-white font-semibold">{devis.montant_ht}€</span></p>
              <p className="text-gray-400 text-sm">TVA 20% : <span className="text-white">{devis.montant_ttc - devis.montant_ht}€</span></p>
              <p className="text-xl text-white font-bold border-t border-gray-700 pt-2 mt-1">
                TTC : {devis.montant_ttc}€
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-700 text-sm">
              <div className="bg-gray-800 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">⏱ Délai</p>
                <p className="text-white font-medium">{devis.delai_livraison}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">📅 Validité</p>
                <p className="text-white font-medium">{devis.validite}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">💳 Conditions</p>
                <p className="text-white font-medium">{devis.conditions}</p>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={saveLoading || saved}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60
                         text-white font-semibold px-6 py-3 rounded-xl transition
                         flex items-center justify-center gap-2"
            >
              {saved ? '✅ Sauvegardé !' : saveLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Sauvegarde...
                </>
              ) : '💾 Sauvegarder'}
            </button>

            <button
              onClick={handleExportPDF}
              disabled={pdfLoading}
              className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-60
                         text-white font-semibold px-6 py-3 rounded-xl transition
                         flex items-center justify-center gap-2"
            >
              {pdfLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Génération PDF...
                </>
              ) : '📄 Exporter PDF'}
            </button>

            <button
              onClick={() => { setDevis(null); setSaved(false) }}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white
                         font-semibold px-6 py-3 rounded-xl transition"
            >
              🔄 Recommencer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}