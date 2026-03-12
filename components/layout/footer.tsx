import Link from "next/link"
import Image from "next/image"
import { wpApi } from "@/lib/wordpress/api"
import type { FooterOptions } from "@/lib/wordpress/types"
import { BRAND_COLORS } from "@/lib/theme/colors"

function FacebookIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const SOCIAL_ICONS: Record<string, { icon: () => JSX.Element; label: string }> = {
  facebook: { icon: FacebookIcon, label: "Facebook" },
  instagram: { icon: InstagramIcon, label: "Instagram" },
  linkedin: { icon: LinkedInIcon, label: "LinkedIn" },
  youtube: { icon: YouTubeIcon, label: "YouTube" },
  twitter: { icon: TwitterIcon, label: "X (Twitter)" },
}

export async function SiteFooter() {
  let footer: FooterOptions

  try {
    footer = await wpApi.getFooterOptions()
  } catch {
    return null
  }

  return (
    <footer style={{ backgroundColor: BRAND_COLORS.darkBlue }}>
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          {/* Logo & description */}
          <div className="mb-6 md:mb-0 max-w-sm">
            <Link href="/" className="flex items-center mb-4">
              {footer.logo.url ? (
                <Image
                  src={footer.logo.url}
                  alt={footer.logo.alt || "L'Hermitage"}
                  width={180}
                  height={48}
                  className="h-10 w-auto me-3"
                />
              ) : (
                <span className="self-center text-2xl font-semibold whitespace-nowrap text-white font-heading">
                  L&apos;Hermitage
                </span>
              )}
            </Link>
            {footer.description && (
              <p className="text-gray-300 text-sm leading-relaxed">{footer.description}</p>
            )}
            {/* Contact info */}
            {(footer.contact.adresse || footer.contact.telephone || footer.contact.email) && (
              <div className="mt-4 text-sm text-gray-300 space-y-1">
                {footer.contact.adresse && <p>{footer.contact.adresse}</p>}
                {footer.contact.telephone && (
                  <p>
                    <a href={`tel:${footer.contact.telephone.replace(/\s/g, "")}`} className="hover:text-white transition-colors">
                      {footer.contact.telephone}
                    </a>
                  </p>
                )}
                {footer.contact.email && (
                  <p>
                    <a href={`mailto:${footer.contact.email}`} className="hover:text-white transition-colors">
                      {footer.contact.email}
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Link columns */}
          {footer.columns.length > 0 && (
            <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
              {footer.columns.map((column) => (
                <div key={column.title}>
                  <h2 className="mb-6 text-sm font-semibold uppercase text-white font-heading">
                    {column.title}
                  </h2>
                  <ul className="text-gray-300 text-sm space-y-3">
                    {column.links.map((link) => (
                      <li key={link.url}>
                        <Link href={link.url} className="hover:text-white transition-colors">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <hr className="my-6 border-gray-600 sm:mx-auto lg:my-8" />

        {/* Bottom bar: copyright + social icons */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-400 sm:text-center">
            {footer.copyright || `© ${new Date().getFullYear()} L'Hermitage. Tous droits réservés.`}
          </span>

          {/* Social media icons */}
          {Object.keys(footer.social).length > 0 && (
            <div className="flex mt-4 sm:mt-0 gap-3">
              {Object.entries(footer.social).map(([network, url]) => {
                const config = SOCIAL_ICONS[network]
                if (!config || !url) return null
                const Icon = config.icon
                return (
                  <a
                    key={network}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={config.label}
                  >
                    <Icon />
                    <span className="sr-only">{config.label}</span>
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
