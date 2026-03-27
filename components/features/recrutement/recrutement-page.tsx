"use client"

import type { RecrutementACF } from "@/lib/wordpress/types"
import {
  IntroductionSection,
  OffresSection,
  CadreDeVieSection,
  TemoignagesSection,
  CandidatureSection,
} from "./recrutement-sections"

interface RecrutementPageProps {
  acf: RecrutementACF
}

export function RecrutementPage({ acf }: RecrutementPageProps) {
  return (
    <div className="space-y-4 pt-2 pl-2">
      {acf.introduction && <IntroductionSection introduction={acf.introduction} />}
      {acf.offres && acf.offres.length > 0 && <OffresSection offres={acf.offres} />}
      {acf.temoignages && acf.temoignages.length > 0 && (
        <TemoignagesSection temoignages={acf.temoignages} />
      )}
      {acf.cadre_de_vie && <CadreDeVieSection cadre={acf.cadre_de_vie} />}
      {acf.candidature && <CandidatureSection candidature={acf.candidature} />}
    </div>
  )
}
