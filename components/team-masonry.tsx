"use client"

import Image from "next/image"
import type { WPPost, TeamMemberACF } from "@/lib/wordpress/types"
import { motion } from "framer-motion"
import { useIsMounted } from "@/hooks/use-is-mounted"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"

interface TeamMasonryProps {
  members: WPPost<TeamMemberACF>[]
}

export function TeamMasonry({ members }: TeamMasonryProps) {
  const mounted = useIsMounted()

  if (!mounted || members.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {members.length === 0 ? "Aucun membre d'équipe trouvé" : "Chargement..."}
      </div>
    )
  }

  return (
    <div className="w-full md:pt-2 md:pl-2">
      <div className="flex flex-col gap-16">
        {members.map((member, index) => {
          const photo = member.acf?.photo
          const description = member.acf?.descriptif
          const title = member.title?.rendered || ""
          const activitePrincipale = member.acf?.activite_principale
          const isEven = index % 2 === 0

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              <div
                className={`grid grid-cols-1 md:grid-cols-12 gap-6 ${isEven ? "" : "md:grid-flow-dense"}`}
              >
                {/* Photo card */}
                <div className={`${isEven ? "md:col-span-4" : "md:col-span-4 md:col-start-9"}`}>
                  <motion.div
                    className="h-full relative rounded-2xl overflow-hidden shadow-lg group bg-card"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    {photo?.url ? (
                      <Image
                        src={photo.url || "/placeholder.svg"}
                        alt={photo.alt || title}
                        width={photo.width || 600}
                        height={photo.height || 800}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        quality={80}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">Aucune photo</span>
                      </div>
                    )}
                  </motion.div>
                </div>

                <div
                  className={`flex flex-col gap-4 ${isEven ? "md:col-span-8" : "md:col-span-8 md:col-start-1"}`}
                >
                  <motion.div className="py-3 w-fit flex items-center gap-3">
                    <Image
                      src="/logo-arcs-coral.png"
                      alt="Logo arc coral"
                      width={30}
                      height={30}
                      className="flex-shrink-0"
                    />
                    <h3 className="text-xl md:text-2xl font-bold text-brand-coral">{title}</h3>
                  </motion.div>

                  {activitePrincipale && (
                    <motion.div>
                      <p className="md:text-lg font-black text-brand-coral uppercase">
                        {activitePrincipale}
                      </p>
                    </motion.div>
                  )}

                  <motion.div
                    className="bg-card rounded-2xl p-4"
                    whileHover={{
                      boxShadow:
                        "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {description ? (
                      <div
                        className="text-sm md:text-base leading-relaxed prose prose-sm max-w-none text-foreground"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
                      />
                    ) : (
                      <p className="text-muted-foreground">Aucune description disponible</p>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
