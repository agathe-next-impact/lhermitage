"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { sanitizeHtml } from "@/lib/wordpress/sanitize"
import { BRAND_COLORS } from "@/lib/theme/colors"
import type {
  RecrutementACF,
  RecrutementOffre,
  RecrutementBloc,
  RecrutementTemoignage,
  RecrutementChiffreCle,
  RecrutementChampFormulaire,
} from "@/lib/wordpress/types"
import {
  Briefcase,
  GraduationCap,
  Heart,
  Lightbulb,
  MapPin,
  Send,
  Star,
  TreePine,
  Users,
  CheckCircle2,
  Quote,
  type LucideIcon,
} from "lucide-react"

// --- Icon resolver ---

const ICON_MAP: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  heart: Heart,
  lightbulb: Lightbulb,
  "map-pin": MapPin,
  send: Send,
  star: Star,
  trees: TreePine,
  users: Users,
}

function ResolvedIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null
  // If it's an emoji (starts with non-ASCII), render directly
  if (/^[^\u0000-\u007F]/.test(name)) {
    return <span className={className}>{name}</span>
  }
  const Icon = ICON_MAP[name.toLowerCase()]
  if (Icon) return <Icon className={className} />
  return <span className={className}>{name}</span>
}

// --- Section colors ---

const SECTION_COLORS = [
  BRAND_COLORS.coral,
  BRAND_COLORS.teal,
  BRAND_COLORS.green,
  BRAND_COLORS.rose,
  BRAND_COLORS.orange,
]

// --- Animation variants ---

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

// ─────────────────────── Section: Chiffres Cles ───────────────────────

export function ChiffresCles({ chiffres }: { chiffres: RecrutementChiffreCle[] }) {
  if (!chiffres?.length) return null

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 gap-6"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {chiffres.map((c, i) => (
        <motion.div
          key={i}
          variants={fadeInUp}
          className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-stone-100"
        >
          <ResolvedIcon name={c.icone} className="h-6 w-6 mx-auto mb-2 text-stone-500" />
          {c.categorie && (
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-1">
              {c.categorie}
            </p>
          )}
          <p
            className="text-2xl md:text-3xl font-bold"
            style={{ color: SECTION_COLORS[i % SECTION_COLORS.length] }}
          >
            {c.valeur}
          </p>
          {c.description && <p className="text-sm text-stone-600 mt-1">{c.description}</p>}
        </motion.div>
      ))}
    </motion.div>
  )
}

// ─────────────────────── Section: Introduction ───────────────────────

export function IntroductionSection({
  introduction,
}: {
  introduction: NonNullable<RecrutementACF["introduction"]>
}) {
  return (
    <motion.section
      className="space-y-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
    >
      {introduction.titre && (
        <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-bold text-stone-800">
          {introduction.titre}
        </motion.h2>
      )}
      {introduction.texte && (
        <motion.div
          variants={fadeInUp}
          className="prose prose-stone max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(introduction.texte) }}
        />
      )}
      {introduction.chiffres_cles && <ChiffresCles chiffres={introduction.chiffres_cles} />}
    </motion.section>
  )
}

// ─────────────────────── Section: Offre Card ───────────────────────

function OffreCard({ offre, index }: { offre: RecrutementOffre; index: number }) {
  const color = SECTION_COLORS[index % SECTION_COLORS.length]

  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-2xl border border-stone-100 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`flex items-start mb-4 ${offre.icone ? "gap-4" : ""}`}>
        {offre.icone && (
          <ResolvedIcon name={offre.icone} className="h-6 w-6 shrink-0 mt-1 text-stone-500" />
        )}
        <div>
          <h3 className="text-lg md:text-xl font-bold text-stone-800">{offre.titre}</h3>
          {offre.descriptif && (
            <p className="text-stone-600 mt-1 text-sm">{offre.descriptif}</p>
          )}
        </div>
      </div>

      {offre.missions && offre.missions.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-stone-700 mb-2">Missions principales</p>
          <ul className="space-y-1.5">
            {offre.missions.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color }} />
                <span>{m.texte}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {offre.profil && offre.profil.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-stone-700 mb-2">Profil recherche</p>
          <ul className="space-y-1.5">
            {offre.profil.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                <Star className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                <span>{p.texte}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {offre.cta_lien && (
        <a
          href={offre.cta_lien}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: color }}
        >
          {offre.cta_texte || "Decouvrir la mission"}
          <Send className="h-4 w-4" />
        </a>
      )}
    </motion.div>
  )
}

export function OffresSection({ offres }: { offres: RecrutementOffre[] }) {
  if (!offres?.length) return null

  return (
    <motion.section
      id="offres"
      className="space-y-6"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-bold text-stone-800">
        Offres
      </motion.h2>
      <div className="grid gap-6">
        {offres.map((offre, i) => (
          <OffreCard key={i} offre={offre} index={i} />
        ))}
      </div>
    </motion.section>
  )
}

// ─────────────────────── Section: Cadre de Vie ───────────────────────

function CadreBloc({ bloc, index }: { bloc: RecrutementBloc; index: number }) {
  const color = SECTION_COLORS[index % SECTION_COLORS.length]

  return (
    <motion.div variants={fadeInUp} className="rounded-2xl bg-stone-50 p-6 md:p-8 space-y-4">
      <div className={`flex items-center ${bloc.icone ? "gap-3" : ""}`}>
        {bloc.icone && <ResolvedIcon name={bloc.icone} className="h-6 w-6 text-stone-500" />}
        <h3 className="text-lg font-bold text-stone-800">{bloc.titre}</h3>
      </div>

      {bloc.texte_intro && <p className="text-stone-600">{bloc.texte_intro}</p>}

      {bloc.elements && bloc.elements.length > 0 && (
        <ul className="space-y-3">
          {bloc.elements.map((el, i) => (
            <li key={i} className="flex items-start gap-3">
              <div
                className="h-2 w-2 rounded-full mt-2 shrink-0"
                style={{ backgroundColor: color }}
              />
              <div>
                {el.titre && <p className="font-medium text-stone-800">{el.titre}</p>}
                {el.description && <p className="text-sm text-stone-600">{el.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {bloc.note && (
        <p className="text-sm italic text-stone-500 border-l-2 border-stone-300 pl-3">
          {bloc.note}
        </p>
      )}

      {bloc.image && (
        <div className="relative aspect-video rounded-xl overflow-hidden">
          <Image
            src={bloc.image.url}
            alt={bloc.image.alt || bloc.titre}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
    </motion.div>
  )
}

export function CadreDeVieSection({
  cadre,
}: {
  cadre: NonNullable<RecrutementACF["cadre_de_vie"]>
}) {
  if (!cadre.blocs?.length) return null

  return (
    <motion.section
      className="space-y-6"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {cadre.titre && (
        <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-bold text-stone-800">
          {cadre.titre}
        </motion.h2>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        {cadre.blocs.map((bloc, i) => (
          <CadreBloc key={i} bloc={bloc} index={i} />
        ))}
      </div>
    </motion.section>
  )
}

// ─────────────────────── Section: Temoignages ───────────────────────

function TemoignageCard({ temoignage }: { temoignage: RecrutementTemoignage }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-2xl bg-white border border-stone-100 p-6 md:p-8 shadow-sm"
    >
      <Quote className="h-8 w-8 text-stone-200 mb-4" />
      <blockquote className="text-stone-700 italic leading-relaxed mb-6">
        {temoignage.citation}
      </blockquote>
      <div className="flex items-center gap-3">
        {temoignage.photo && (
          <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0">
            <Image
              src={temoignage.photo.url}
              alt={temoignage.auteur}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        )}
        <div>
          <p className="font-semibold text-stone-800">{temoignage.auteur}</p>
          {temoignage.role && <p className="text-sm text-stone-500">{temoignage.role}</p>}
        </div>
      </div>
    </motion.div>
  )
}

export function TemoignagesSection({ temoignages }: { temoignages: RecrutementTemoignage[] }) {
  if (!temoignages?.length) return null

  return (
    <motion.section
      className="space-y-6"
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-bold text-stone-800">
        Temoignages
      </motion.h2>
      <div className="grid md:grid-cols-2 gap-6">
        {temoignages.map((t, i) => (
          <TemoignageCard key={i} temoignage={t} />
        ))}
      </div>
    </motion.section>
  )
}

// ─────────────────────── Section: Candidature ───────────────────────

function FormField({ champ }: { champ: RecrutementChampFormulaire }) {
  const baseClasses =
    "w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 transition"

  const label = (
    <label className="block text-sm font-medium text-stone-700 mb-1">
      {champ.label}
      {champ.requis && <span className="text-red-500 ml-1">*</span>}
    </label>
  )

  switch (champ.type_champ) {
    case "textarea":
      return (
        <div>
          {label}
          <textarea
            className={`${baseClasses} min-h-[100px]`}
            required={champ.requis}
            placeholder={champ.label}
          />
        </div>
      )
    case "select": {
      const options = champ.options?.split("\n").filter(Boolean) || []
      return (
        <div>
          {label}
          <select className={baseClasses} required={champ.requis}>
            <option value="">Selectionnez...</option>
            {options.map((opt, i) => (
              <option key={i} value={opt.trim()}>
                {opt.trim()}
              </option>
            ))}
          </select>
        </div>
      )
    }
    case "file":
      return (
        <div>
          {label}
          <input
            type="file"
            className={baseClasses}
            required={champ.requis}
          />
        </div>
      )
    default:
      return (
        <div>
          {label}
          <input
            type={champ.type_champ || "text"}
            className={baseClasses}
            required={champ.requis}
            placeholder={champ.label}
          />
        </div>
      )
  }
}

export function CandidatureSection({
  candidature,
}: {
  candidature: NonNullable<RecrutementACF["candidature"]>
}) {
  return (
    <motion.section
      id="candidature"
      className="space-y-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
    >
      {candidature.titre && (
        <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-bold text-stone-800">
          {candidature.titre}
        </motion.h2>
      )}

      {candidature.texte && (
        <motion.div
          variants={fadeInUp}
          className="prose prose-stone max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(candidature.texte) }}
        />
      )}

      {candidature.email && (
        <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4">
          <a
            href={`mailto:${candidature.email}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: BRAND_COLORS.coral }}
          >
            <Send className="h-4 w-4" />
            {candidature.email}
          </a>
          {candidature.email_secondaire && (
            <a
              href={`mailto:${candidature.email_secondaire}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              <Send className="h-4 w-4" />
              {candidature.email_secondaire}
            </a>
          )}
        </motion.div>
      )}

      {candidature.activer_formulaire && candidature.champs && candidature.champs.length > 0 && (
        <motion.form
          variants={fadeInUp}
          className="rounded-2xl bg-stone-50 p-6 md:p-8 space-y-4"
          onSubmit={(e) => e.preventDefault()}
        >
          {candidature.champs.map((champ, i) => (
            <FormField key={i} champ={champ} />
          ))}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: BRAND_COLORS.coral }}
          >
            <Send className="h-4 w-4" />
            Envoyer ma candidature
          </button>
        </motion.form>
      )}
    </motion.section>
  )
}
