"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useSimulateurStore } from "@/lib/simulateur/store"
import { useSimulateurData } from "@/lib/simulateur/context"
import { ServiceToggleCard } from "./service-toggle-card"
import type { SimService } from "@/lib/simulateur/types"

export function ServiceList() {
  const data = useSimulateurData()
  const selectedServices = useSimulateurStore((s) => s.selectedServices)
  const toggleService = useSimulateurStore((s) => s.toggleService)
  const setServiceOption = useSimulateurStore((s) => s.setServiceOption)

  // Group services by first category
  const grouped = useMemo(() => {
    const groups: { slug: string; name: string; services: SimService[] }[] = []
    const ungrouped: SimService[] = []

    for (const service of data.services) {
      const firstCat = service.categories?.[0]
      if (firstCat) {
        const existing = groups.find((g) => g.slug === firstCat.slug)
        if (existing) {
          existing.services.push(service)
        } else {
          groups.push({
            slug: firstCat.slug,
            name: firstCat.name,
            services: [service],
          })
        }
      } else {
        ungrouped.push(service)
      }
    }

    return { groups, ungrouped }
  }, [data.services])

  const isSelected = (slug: string) => selectedServices.some((s) => s.service_slug === slug)

  const getOptionIndex = (slug: string) =>
    selectedServices.find((s) => s.service_slug === slug)?.option_index

  const renderServiceCard = (service: SimService) => (
    <ServiceToggleCard
      key={service.slug}
      service={service}
      isSelected={isSelected(service.slug)}
      optionIndex={getOptionIndex(service.slug)}
      onToggle={() => toggleService(service.slug)}
      onOptionChange={(idx) => setServiceOption(service.slug, idx)}
    />
  )

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="font-heading uppercase font-extrabold text-2xl text-brand-dark tracking-wide mb-2">
          Services complémentaires
        </h2>
        <p className="text-muted-foreground">
          Personnalisez votre séjour avec des services additionnels. Les services marqués
          &laquo;&nbsp;Inclus&nbsp;&raquo; sont déjà compris dans votre forfait.
        </p>
      </div>

      {/* Grouped services */}
      {grouped.groups.map((group) => (
        <section key={group.slug}>
          <h3 className="font-heading uppercase text-sm font-bold tracking-wider text-[#2A4A51] border-b pb-2 mb-4">
            {group.name}
          </h3>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {group.services.map(renderServiceCard)}
          </motion.div>
        </section>
      ))}

      {/* Ungrouped services */}
      {grouped.ungrouped.length > 0 && (
        <section>
          {grouped.groups.length > 0 && (
            <h3 className="font-heading uppercase text-sm font-bold tracking-wider text-[#2A4A51] border-b pb-2 mb-4">
              Autres services
            </h3>
          )}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {grouped.ungrouped.map(renderServiceCard)}
          </motion.div>
        </section>
      )}

      {data.services.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucun service disponible pour le moment.
        </div>
      )}
    </div>
  )
}
