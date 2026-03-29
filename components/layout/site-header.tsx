import type { ReactNode } from "react"
import CardNav from "@/components/layout/card-nav"
import { wpApi } from "@/lib/wordpress/api"
import type { WPMenuItem } from "@/lib/wordpress/types"
import type { CardNavItem } from "@/components/layout/card-nav"
import { transformWordPressUrl } from "@/lib/wordpress/url-transform"
import { MENU_COLOR_SEQUENCE, buildRouteColorMap } from "@/lib/page-colors"
import { MenuColorsProvider } from "@/components/menu-colors-provider"

function transformMenuToNavItems(menuItems: WPMenuItem[]): CardNavItem[] {
  const parentItems = menuItems.filter((item) => item.parent === 0)

  return parentItems.map((parent, index) => {
    const children = parent.children || []
    const color = MENU_COLOR_SEQUENCE[index % MENU_COLOR_SEQUENCE.length]

    return {
      label: parent.title,
      bgColor: color,
      textColor: "#ffffff",
      links: children.map((child) => ({
        label: child.title,
        href: child.url,
        ariaLabel: `Voir ${child.title}`,
      })),
    }
  })
}

const FALLBACK_NAV_ITEMS: CardNavItem[] = [
  {
    label: "Séjours",
    bgColor: MENU_COLOR_SEQUENCE[0],
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
    bgColor: MENU_COLOR_SEQUENCE[1],
    textColor: "#ffffff",
    links: [
      {
        label: "Structures Hébergées",
        href: "/ecosysteme-innovant/structures",
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
    bgColor: MENU_COLOR_SEQUENCE[2],
    textColor: "#ffffff",
    links: [
      { label: "Le Projet", href: "/tiers-lieu-rural/le-projet", ariaLabel: "Découvrir le projet" },
      {
        label: "Le Domaine",
        href: "/tiers-lieu-rural/le-domaine-de-l-hermitage",
        ariaLabel: "Découvrir le domaine",
      },
      {
        label: "Un Patrimoine Historique",
        href: "/tiers-lieu-rural/un-patrimoine-historique",
        ariaLabel: "Découvrir le patrimoine",
      },
      { label: "L'Équipe", href: "/tiers-lieu-rural/lequipe", ariaLabel: "Rencontrer l'équipe" },
    ],
  },
  {
    label: "Infos pratiques",
    bgColor: MENU_COLOR_SEQUENCE[3],
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

export async function SiteHeader({ children }: { children?: ReactNode }) {
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
        url: "/reserver",
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

  const navItems = menuItems.length > 0 ? transformMenuToNavItems(menuItems) : FALLBACK_NAV_ITEMS

  const colorMap = buildRouteColorMap(navItems)
  const ctaButton = globalOptions.lien_du_cta_de_barre_superieure

  return (
    <MenuColorsProvider colorMap={colorMap}>
      <header className="fixed top-0 z-40 w-full bg-transparent">
        <CardNav
          topBarLinks={[
            { label: "Séjours", href: "/sejours-collectifs/nos-sejours", bgColor: "#56939F" },
            { label: "Réserver", href: "/reserver", bgColor: "#E75754" },
            { label: "Soutenir", href: "/soutenir-le-projet/don-association", bgColor: "#78AD7D" },
          ]}
          centerLogo="/logo-arcs-coral.png"
          centerLogoAlt="Logo ARCS"
          items={navItems}
          baseColor="#ffffff"
          menuColor="#535353"
          buttonBgColor="#E75754"
          buttonTextColor="#ffffff"
          ctaLabel={ctaButton?.title || "Réserver"}
          ctaHref={transformWordPressUrl(ctaButton?.url || "/reserver")}
          ctaTarget={ctaButton?.target}
          ease="power3.out"
        />
      </header>
      {children}
    </MenuColorsProvider>
  )
}
