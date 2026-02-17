import type { ReactNode } from "react"
import type { Metadata } from "next"
import { simulateurApi } from "@/lib/simulateur/api"
import { SimulateurDataProvider } from "@/lib/simulateur/context"
import { StepIndicator } from "@/components/features/simulateur/step-indicator"
import { PageHeader } from "@/components/layout/page-header"
import { BentoHeaderContent } from "@/components/layout/bento-header-content"
import { REVALIDATION } from "@/lib/constants"

export const revalidate = REVALIDATION.simulateur

export const metadata: Metadata = {
  title: {
    template: "%s | Simulateur L'Hermitage",
    default: "Simulateur de séjour corporate",
  },
  description: "Composez votre séjour corporate sur mesure à L'Hermitage.",
}

export default async function SimulateurLayout({
  children,
  modal,
}: {
  children: ReactNode
  modal: ReactNode
}) {
  const data = await simulateurApi.getAllData()

  return (
    <SimulateurDataProvider data={data}>
      <PageHeader title="Simulateur de séjour" color="#2A4A51" />
      <BentoHeaderContent title="Composez votre séjour corporate sur mesure">
        <div className="space-y-6">
          <StepIndicator />
          <main>{children}</main>
        </div>
      </BentoHeaderContent>
      {modal}
    </SimulateurDataProvider>
  )
}
