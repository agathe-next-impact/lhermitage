import Link from "next/link"
import CardNav from "@/components/layout/card-nav"
import { wpApi } from "@/lib/wordpress/api"
import type { WPMenuItem } from "@/lib/wordpress/types"
import type { CardNavItem } from "@/components/layout/card-nav"
import { transformWordPressUrl } from "@/lib/wordpress/url-transform"

function transformMenuToNavItems(menuItems: WPMenuItem[]): CardNavItem[] {
  const parentItems = menuItems.filter((item) => item.parent === 0)

  const colors = [
    { bg: "#2A4A51", text: "#ffffff" },
    { bg: "#56939F", text: "#ffffff" },
    { bg: "#78AD7D", text: "#ffffff" },
    { bg: "#C14C66", text: "#ffffff" },
    { bg: "#DC6F45", text: "#ffffff" },
    { bg: "#E75754", text: "#ffffff" },
  ]

  return parentItems.map((parent, index) => {
    const children = parent.children || []
    const colorIndex = index % colors.length

    return {
      label: parent.title,
      bgColor: colors[colorIndex].bg,
      textColor: colors[colorIndex].text,
      links: children.map((child) => ({
        label: child.title,
        href: transformWordPressUrl(child.url),
        ariaLabel: `Voir ${child.title}`,
      })),
    }
  })
}

export async function SiteHeader() {
  let globalOptions
  let menuItems: WPMenuItem[] = []

  try {
    const [options, menu] = await Promise.all([wpApi.getGlobalOptions(), wpApi.getMenu("menu-1")])

    globalOptions = options
    menuItems = menu
  } catch (error) {
    console.error("Error in SiteHeader fetching data:", error)
    globalOptions = {
      lien_du_cta_de_barre_superieure: {
        title: "Réserver",
        url: "/simulateur",
        target: "",
      },
      miniature_du_megamenu: {
        titre_cta_1: "Découvrir le lieu",
        lien_cta_1: {
          title: "Découvrir le lieu",
          url: "/visite-virtuelle",
          target: "",
        },
        image: {
          url: "/rural-retreat-hermitage-building-nature.jpg",
          alt: "Vue de l'Hermitage",
          sizes: {
            medium: "/rural-retreat-hermitage-building-nature-medium.jpg",
          },
        },
      },
    }
  }

  let navItems: CardNavItem[] = []

  if (menuItems.length > 0) {
    navItems = transformMenuToNavItems(menuItems)
  } else {
    navItems = [
      {
        label: "Séjours",
        bgColor: "#2A4A51",
        textColor: "#ffffff",
        links: [
          {
            label: "Séjours Collectifs",
            href: "/sejours-collectifs",
            ariaLabel: "Voir les séjours collectifs",
          },
          {
            label: "Séjours Individuels",
            href: "/sejours-individuels",
            ariaLabel: "Voir les séjours individuels",
          },
          { label: "Hébergements", href: "/hebergements", ariaLabel: "Voir les hébergements" },
          {
            label: "Activités",
            href: "/sejours-collectifs/activites",
            ariaLabel: "Voir les activités",
          },
        ],
      },
      {
        label: "Écosystème",
        bgColor: "#56939F",
        textColor: "#ffffff",
        links: [
          {
            label: "Structures Hébergées",
            href: "/ecosysteme-innovant/structures-hebergees",
            ariaLabel: "Voir les structures hébergées",
          },
          {
            label: "Partenaires",
            href: "/ecosysteme-innovant/partenaires",
            ariaLabel: "Voir les partenaires",
          },
          {
            label: "Événements",
            href: "/ecosysteme-innovant/evenements",
            ariaLabel: "Voir les événements",
          },
        ],
      },
      {
        label: "Tiers lieu rural",
        bgColor: "#78AD7D",
        textColor: "#ffffff",
        links: [
          { label: "Le Projet", href: "/le-projet", ariaLabel: "Découvrir le projet" },
          { label: "Le Concept", href: "/le-concept", ariaLabel: "Comprendre le concept" },
          { label: "Nos Valeurs", href: "/nos-valeurs", ariaLabel: "Découvrir nos valeurs" },
          { label: "L'Équipe", href: "/lequipe", ariaLabel: "Rencontrer l'équipe" },
        ],
      },
      {
        label: "Infos pratiques",
        bgColor: "#C14C66",
        textColor: "#ffffff",
        links: [
          {
            label: "Localisation",
            href: "/infos-pratiques/localisation",
            ariaLabel: "Voir la localisation",
          },
          { label: "Contacts", href: "/infos-pratiques/contacts", ariaLabel: "Nous contacter" },
          {
            label: "Jours et Horaires",
            href: "/infos-pratiques/jours-et-horaires-douverture",
            ariaLabel: "Voir les horaires",
          },
          { label: "Services", href: "/services", ariaLabel: "Découvrir nos services" },
        ],
      },
    ]
  }

  const ctaButton = globalOptions.lien_du_cta_de_barre_superieure

  return (
    <header className="fixed top-0 z-40 w-full bg-transparent">
      <div className="flex items-center justify-between gap-4 bg-[#E75754] text-sm uppercase font-extrabold px-4 py-1.5 text-white">
        <Link href="/visite-virtuelle" className="hover:underline">
          Visiter
        </Link>
        <div>
          <Link href="/soutenir" className="hover:underline">
            Soutenir
          </Link>
          &nbsp;|&nbsp;
          <Link href="/simulateur" className="hover:underline">
            Réserver
          </Link>
        </div>
      </div>
      <CardNav
        centerLogo="/logo-arcs-coral.png"
        centerLogoAlt="Logo ARCS"
        items={navItems}
        baseColor="#ffffff"
        menuColor="#535353"
        buttonBgColor="#E75754"
        buttonTextColor="#ffffff"
        ctaLabel={ctaButton?.title || "Réserver"}
        ctaHref={transformWordPressUrl(ctaButton?.url || "/simulateur")}
        ctaTarget={ctaButton?.target}
        ease="power3.out"
      />
    </header>
  )
}
