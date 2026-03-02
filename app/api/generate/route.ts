import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { client_nom, type_projet, description, budget, delai } = body

  // Simulation de réponse IA (à remplacer par Claude quand crédits disponibles)
  const devis = {
    titre: `Devis – ${type_projet} pour ${client_nom}`,
    introduction: `Suite à notre échange, nous avons le plaisir de vous soumettre notre proposition commerciale pour la réalisation de votre ${type_projet.toLowerCase()}. Notre équipe mettra tout en œuvre pour répondre à vos attentes : ${description}`,
    lignes: [
      {
        description: `Conception et design ${type_projet}`,
        quantite: 1,
        unite: 'forfait',
        prix_unitaire: 800,
        total: 800
      },
      {
        description: 'Développement et intégration',
        quantite: 1,
        unite: 'forfait',
        prix_unitaire: 1200,
        total: 1200
      },
      {
        description: 'Tests, mise en ligne et formation',
        quantite: 1,
        unite: 'forfait',
        prix_unitaire: 300,
        total: 300
      }
    ],
    montant_ht: 2300,
    montant_ttc: 2760,
    delai_livraison: delai || '3 semaines',
    validite: '30 jours',
    conditions: '30% à la commande, solde à la livraison'
  }

  return NextResponse.json(devis)
}