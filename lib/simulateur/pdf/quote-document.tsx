import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { SimulateurState, SimulateurData, BudgetBreakdown } from "../types"
import { SEJOUR_CATEGORIES, type SejourCategory } from "../types"

// ─── Styles ─────────────────────────────────────────────────

const colors = {
  coral: "#E07A5F",
  dark: "#1B1B1B",
  teal: "#2A9D8F",
  lightGray: "#F5F5F5",
  mediumGray: "#999999",
  border: "#E0E0E0",
  white: "#FFFFFF",
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 45,
    color: colors.dark,
  },

  // Header
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: colors.coral,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.coral,
    fontFamily: "Helvetica-Bold",
  },
  headerDate: {
    fontSize: 9,
    color: colors.mediumGray,
    marginTop: 6,
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: colors.coral,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Profile
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  profileItem: {
    width: "48%",
    flexDirection: "row",
    marginBottom: 4,
  },
  profileLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: colors.mediumGray,
    width: 100,
  },
  profileValue: {
    fontSize: 10,
    color: colors.dark,
    flex: 1,
  },

  // Programme
  dayBlock: {
    marginBottom: 10,
  },
  dayTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
    marginBottom: 5,
    backgroundColor: colors.lightGray,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  slotRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  slotTime: {
    width: 45,
    fontSize: 9,
    color: colors.mediumGray,
  },
  slotType: {
    width: 70,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "capitalize",
  },
  slotDetail: {
    flex: 1,
    fontSize: 9,
    color: colors.dark,
  },

  // Accommodations
  accommRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  accommName: {
    fontSize: 10,
    flex: 1,
  },
  accommQty: {
    fontSize: 10,
    width: 60,
    textAlign: "center",
  },
  accommPrice: {
    fontSize: 10,
    width: 80,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
  },

  // Services
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  serviceName: {
    fontSize: 10,
    flex: 1,
  },
  servicePrice: {
    fontSize: 10,
    width: 80,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
  },

  // Budget table
  budgetTable: {
    marginTop: 4,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  budgetRowLabel: {
    fontSize: 10,
    color: colors.dark,
  },
  budgetRowValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
  },
  budgetTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: colors.dark,
    marginTop: 2,
  },
  budgetTotalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },
  budgetTotalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.coral,
  },
  budgetSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: colors.lightGray,
  },
  budgetSubLabel: {
    fontSize: 9,
    color: colors.mediumGray,
  },
  budgetSubValue: {
    fontSize: 9,
    color: colors.mediumGray,
    fontFamily: "Helvetica-Bold",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 25,
    left: 45,
    right: 45,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: colors.mediumGray,
    textAlign: "center",
    lineHeight: 1.4,
  },

  // Table header
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: colors.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.mediumGray,
    textTransform: "uppercase",
  },
})

// ─── Helpers ─────────────────────────────────────────────────

function formatEuros(amount: number): string {
  return amount.toLocaleString("fr-FR") + " €"
}

const TYPE_CRENEAU_LABELS: Record<string, string> = {
  activite: "Activité",
  repas: "Repas",
  travail: "Travail",
  libre: "Libre",
  soiree: "Soirée",
}

// ─── Document ────────────────────────────────────────────────

interface QuoteDocumentProps {
  state: SimulateurState
  data: SimulateurData
  budget: BudgetBreakdown
}

export function QuoteDocument({ state, data, budget }: QuoteDocumentProps) {
  const { profile, days, accommodations, selectedServices } = state
  const categoryInfo = profile.category
    ? SEJOUR_CATEGORIES[profile.category as SejourCategory]
    : null
  const nights = Math.max(0, profile.duration - 1)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>L&apos;Hermitage</Text>
          <Text style={styles.headerSubtitle}>Devis séjour corporate</Text>
          <Text style={styles.headerDate}>
            Généré le{" "}
            {new Date().toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* ─── Profil ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil du séjour</Text>
          <View style={styles.profileGrid}>
            {categoryInfo && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Type de séjour</Text>
                <Text style={styles.profileValue}>{categoryInfo.label}</Text>
              </View>
            )}
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Participants</Text>
              <Text style={styles.profileValue}>{profile.groupSize} personnes</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Durée</Text>
              <Text style={styles.profileValue}>
                {profile.duration} jour{profile.duration > 1 ? "s" : ""}
                {nights > 0 ? ` / ${nights} nuit${nights > 1 ? "s" : ""}` : ""}
              </Text>
            </View>
            {profile.startDate && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Date souhaitée</Text>
                <Text style={styles.profileValue}>{profile.startDate}</Text>
              </View>
            )}
            {profile.contactName && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Contact</Text>
                <Text style={styles.profileValue}>{profile.contactName}</Text>
              </View>
            )}
            {profile.contactCompany && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Entreprise</Text>
                <Text style={styles.profileValue}>{profile.contactCompany}</Text>
              </View>
            )}
            {profile.contactEmail && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Email</Text>
                <Text style={styles.profileValue}>{profile.contactEmail}</Text>
              </View>
            )}
            {profile.contactPhone && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Téléphone</Text>
                <Text style={styles.profileValue}>{profile.contactPhone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ─── Programme ─── */}
        {days.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Programme</Text>
            {days.map((day) => (
              <View key={day.dayNumber} style={styles.dayBlock}>
                <Text style={styles.dayTitle}>Jour {day.dayNumber}</Text>
                {day.slots.map((slot) => {
                  const details: string[] = []
                  for (const slug of slot.activite_slugs ?? []) {
                    const act = data.activites.find((a) => a.slug === slug)
                    if (act) details.push(act.acf.nom)
                  }
                  for (const slug of slot.espace_slugs ?? []) {
                    const esp = data.espaces.find((e) => e.slug === slug)
                    if (esp) details.push(esp.acf.nom)
                  }
                  for (const slug of slot.service_slugs ?? []) {
                    const srv = data.services.find((sv) => sv.slug === slug)
                    if (srv) details.push(srv.acf.nom)
                  }
                  if (slot.label_personnalise) details.push(slot.label_personnalise)

                  return (
                    <View key={slot.id} style={styles.slotRow}>
                      <Text style={styles.slotTime}>{slot.heure_debut}</Text>
                      <Text style={styles.slotType}>
                        {TYPE_CRENEAU_LABELS[slot.type_creneau] || slot.type_creneau}
                      </Text>
                      <Text style={styles.slotDetail}>
                        {details.length > 0 ? details.join(" — ") : "—"}
                      </Text>
                    </View>
                  )
                })}
              </View>
            ))}
          </View>
        )}

        {/* ─── Hébergements ─── */}
        {accommodations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hébergements</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Type</Text>
              <Text style={[styles.tableHeaderText, { width: 60, textAlign: "center" }]}>Qté</Text>
              <Text style={[styles.tableHeaderText, { width: 80, textAlign: "right" }]}>
                Sous-total
              </Text>
            </View>
            {accommodations.map((acc) => {
              const heb = data.hebergements.find((h) => h.slug === acc.hebergement_slug)
              const pricePerNight = heb?.acf?.prix_nuit_unite ?? 0
              const subtotal = pricePerNight * acc.quantity * nights

              return (
                <View key={acc.hebergement_slug} style={styles.accommRow}>
                  <Text style={styles.accommName}>
                    {heb?.acf?.nom || acc.hebergement_slug}
                    {pricePerNight > 0 ? ` (${formatEuros(pricePerNight)}/nuit)` : ""}
                  </Text>
                  <Text style={styles.accommQty}>{acc.quantity}</Text>
                  <Text style={styles.accommPrice}>{formatEuros(subtotal)}</Text>
                </View>
              )
            })}
          </View>
        )}

        {/* ─── Services ─── */}
        {selectedServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            {selectedServices.map((sel) => {
              const svc = data.services.find((sv) => sv.slug === sel.service_slug)
              if (!svc) return null

              let price = 0
              let detail = ""
              if (svc.acf.mode_tarification === "forfaitaire" && svc.acf.prix_forfaitaire) {
                price = svc.acf.prix_forfaitaire
                detail = `forfait ${formatEuros(price)}`
              } else if (svc.acf.prix_par_personne) {
                price = svc.acf.prix_par_personne * profile.groupSize
                detail = `${formatEuros(svc.acf.prix_par_personne)} x ${profile.groupSize} pers.`
              }

              return (
                <View key={sel.service_slug} style={styles.serviceRow}>
                  <Text style={styles.serviceName}>
                    {svc.acf.nom}
                    {detail ? ` (${detail})` : ""}
                  </Text>
                  <Text style={styles.servicePrice}>{formatEuros(price)}</Text>
                </View>
              )
            })}
          </View>
        )}

        {/* ─── Budget ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget estimatif</Text>
          <View style={styles.budgetTable}>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetRowLabel}>
                Base séjour ({formatEuros(data.settings.prix_base_journee_personne)}
                /pers./jour)
              </Text>
              <Text style={styles.budgetRowValue}>{formatEuros(budget.base)}</Text>
            </View>
            {budget.activites > 0 && (
              <View style={styles.budgetRow}>
                <Text style={styles.budgetRowLabel}>Activités</Text>
                <Text style={styles.budgetRowValue}>{formatEuros(budget.activites)}</Text>
              </View>
            )}
            {budget.espaces > 0 && (
              <View style={styles.budgetRow}>
                <Text style={styles.budgetRowLabel}>Espaces privatisés</Text>
                <Text style={styles.budgetRowValue}>{formatEuros(budget.espaces)}</Text>
              </View>
            )}
            {budget.hebergements > 0 && (
              <View style={styles.budgetRow}>
                <Text style={styles.budgetRowLabel}>Hébergements</Text>
                <Text style={styles.budgetRowValue}>{formatEuros(budget.hebergements)}</Text>
              </View>
            )}
            {budget.services > 0 && (
              <View style={styles.budgetRow}>
                <Text style={styles.budgetRowLabel}>Services</Text>
                <Text style={styles.budgetRowValue}>{formatEuros(budget.services)}</Text>
              </View>
            )}

            <View style={styles.budgetTotalRow}>
              <Text style={styles.budgetTotalLabel}>Total estimé</Text>
              <Text style={styles.budgetTotalValue}>{formatEuros(budget.total)}</Text>
            </View>

            <View style={styles.budgetSubRow}>
              <Text style={styles.budgetSubLabel}>Par personne</Text>
              <Text style={styles.budgetSubValue}>{formatEuros(budget.par_personne)}</Text>
            </View>
            <View style={styles.budgetSubRow}>
              <Text style={styles.budgetSubLabel}>Par personne / jour</Text>
              <Text style={styles.budgetSubValue}>{formatEuros(budget.par_personne_par_jour)}</Text>
            </View>
          </View>
        </View>

        {/* ─── Footer ─── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Ce devis est indicatif et ne constitue pas un engagement contractuel.
          </Text>
          <Text style={styles.footerText}>
            Le montant final sera ajusté par notre équipe en fonction de vos besoins spécifiques.
          </Text>
          <Text style={[styles.footerText, { marginTop: 4, color: colors.coral }]}>
            Contact : sejours@lhermitage.fr
          </Text>
        </View>
      </Page>
    </Document>
  )
}
